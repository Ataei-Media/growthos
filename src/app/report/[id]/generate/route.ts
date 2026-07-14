import { NextResponse } from "next/server";
import {
  getReport,
  logGeneration,
  markReportFailed,
  markReportReady,
} from "@/features/report/service";
import { generateReport } from "@/features/report/generate";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { trackServer } from "@/lib/analytics/posthog";

// Generation (crawl + AI) can take a while; give it room on platforms that allow it.
export const maxDuration = 300;

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ status: "failed", error: "not_configured" });
  }

  const record = await getReport(id);
  if (!record) return NextResponse.json({ status: "not_found" }, { status: 404 });
  if (record.status === "ready") return NextResponse.json({ status: "ready" });

  await trackServer("analysis_started", id, { url: record.url });
  const startedAt = Date.now();

  try {
    const result = await generateReport(record.url, record.context);
    await markReportReady(id, {
      report: result.report,
      screenshotUrl: result.screenshotUrl,
      provider: result.provider,
      model: result.model,
      promptVersion: result.promptVersion,
    });
    await logGeneration({
      reportId: id,
      provider: result.provider,
      model: result.model,
      promptVersion: result.promptVersion,
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
      totalTokens: result.usage.totalTokens,
      durationMs: result.durationMs,
      success: true,
    });
    await trackServer("analysis_finished", id, { score: result.report.overallScore });
    return NextResponse.json({ status: "ready" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "generation failed";
    await markReportFailed(id, message);
    await logGeneration({
      reportId: id,
      provider: "openai",
      model: "unknown",
      promptVersion: null,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      durationMs: Date.now() - startedAt,
      success: false,
      error: message,
    });
    return NextResponse.json({ status: "failed" });
  }
}
