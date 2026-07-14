import "server-only";
import { scrapeSite } from "@/lib/audit/firecrawl";
import { buildScreenshotUrl } from "@/lib/audit/screenshot";
import { ensureAIProvider } from "@/lib/ai/bootstrap";
import {
  aiReportSchema,
  normalizeReport,
  type ReportContext,
  type RevenueReport,
} from "./types";
import { buildReportMessages, REPORT_PROMPT_VERSION } from "./prompt";

export interface GenerateResult {
  report: RevenueReport;
  screenshotUrl: string;
  provider: string;
  model: string;
  promptVersion: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
  durationMs: number;
}

/**
 * The pipeline: crawl → context → prompt → AI provider → parse → normalise.
 * Returns usage + duration so the caller can log cost. Throws on failure.
 */
export async function generateReport(
  url: string,
  context?: ReportContext | null,
): Promise<GenerateResult> {
  const site = await scrapeSite(url);
  const screenshotUrl = buildScreenshotUrl(url);

  const provider = ensureAIProvider();
  const { system, user } = buildReportMessages({ ...site, context });

  const start = Date.now();
  const completion = await provider.complete({
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    json: true,
    maxTokens: 5000,
    traceId: url,
  });
  const durationMs = Date.now() - start;

  let parsed: unknown;
  try {
    parsed = JSON.parse(completion.content);
  } catch {
    throw new Error("The analysis returned malformed data. Please try again.");
  }

  const ai = aiReportSchema.parse(parsed);
  const report = normalizeReport(ai, url);

  return {
    report,
    screenshotUrl,
    provider: completion.provider,
    model: completion.model,
    promptVersion: REPORT_PROMPT_VERSION,
    usage: completion.usage,
    durationMs,
  };
}
