import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { computeCostMicros } from "@/config/ai-pricing";
import { clientEnv } from "@/lib/env";
import type { ReportContext, RevenueReport } from "./types";

export interface ReportRecord {
  id: string;
  url: string;
  domain: string | null;
  brandName: string | null;
  status: "generating" | "ready" | "failed";
  report: RevenueReport | null;
  screenshotUrl: string | null;
  paid: boolean;
  email: string | null;
  createdAt: string;
  context: ReportContext;
}

function mapRow(row: {
  id: string;
  url: string;
  domain: string | null;
  brand_name: string | null;
  status: string;
  report: unknown;
  screenshot_url: string | null;
  paid: boolean;
  email: string | null;
  created_at: string;
  industry: string | null;
  country: string | null;
  average_order_value_cents: number | null;
  main_goal: string | null;
  biggest_challenge: string | null;
}): ReportRecord {
  return {
    id: row.id,
    url: row.url,
    domain: row.domain,
    brandName: row.brand_name,
    status: row.status as ReportRecord["status"],
    report: (row.report as RevenueReport | null) ?? null,
    screenshotUrl: row.screenshot_url,
    paid: row.paid,
    email: row.email,
    createdAt: row.created_at,
    context: {
      industry: row.industry,
      country: row.country,
      averageOrderValueCents: row.average_order_value_cents,
      mainGoal: row.main_goal,
      biggestChallenge: row.biggest_challenge,
    },
  };
}

const SELECT =
  "id, url, domain, brand_name, status, report, screenshot_url, paid, email, created_at, industry, country, average_order_value_cents, main_goal, biggest_challenge";

/** Create a pending report row (with onboarding context) and return its id. */
export async function createReport(url: string, context?: ReportContext): Promise<string> {
  if (!isSupabaseConfigured()) throw new Error("Storage is not configured.");
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("revenue_reports")
    .insert({
      url,
      status: "generating",
      industry: context?.industry ?? null,
      country: context?.country ?? null,
      average_order_value_cents: context?.averageOrderValueCents ?? null,
      main_goal: context?.mainGoal ?? null,
      biggest_challenge: context?.biggestChallenge ?? null,
    })
    .select("id")
    .single();
  if (error || !data) {
    // TEMP diagnostic: probe the Supabase host directly to surface the real cause.
    let probe = "";
    try {
      const res = await fetch(`${clientEnv.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`);
      probe = `probe_status=${res.status}`;
    } catch (e) {
      const cause = (e as { cause?: { code?: string; message?: string } }).cause;
      probe = `probe_err=${(e as Error).message}; code=${cause?.code ?? ""}; causeMsg=${
        cause?.message ?? ""
      }`;
    }
    throw new Error(
      `${error?.message ?? "no data"} | url=[${clientEnv.NEXT_PUBLIC_SUPABASE_URL}] | ${probe}`,
    );
  }
  return data.id;
}

/** Append a generation to the AI cost/quality log. Best-effort. */
export async function logGeneration(input: {
  reportId: string;
  provider: string;
  model: string;
  promptVersion: string | null;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  durationMs: number;
  success: boolean;
  error?: string | null;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("ai_generations").insert({
      report_id: input.reportId,
      provider: input.provider,
      model: input.model,
      prompt_version: input.promptVersion,
      prompt_tokens: input.promptTokens,
      completion_tokens: input.completionTokens,
      total_tokens: input.totalTokens,
      cost_micros: computeCostMicros(input.model, input.promptTokens, input.completionTokens),
      duration_ms: input.durationMs,
      success: input.success,
      error: input.error ?? null,
    });
  } catch (e) {
    console.error("[ai-cost] failed to log generation", e);
  }
}

export async function getReport(id: string): Promise<ReportRecord | null> {
  if (!isSupabaseConfigured()) return null;
  const admin = createAdminClient();
  const { data } = await admin.from("revenue_reports").select(SELECT).eq("id", id).maybeSingle();
  return data ? mapRow(data) : null;
}

export async function markReportReady(
  id: string,
  payload: {
    report: RevenueReport;
    screenshotUrl: string | null;
    provider: string;
    model: string;
    promptVersion: string;
  },
): Promise<void> {
  const admin = createAdminClient();
  const { report } = payload;
  await admin
    .from("revenue_reports")
    .update({
      status: "ready",
      report: report as unknown as never,
      brand_name: report.brandName,
      domain: safeHost(report.url),
      screenshot_url: payload.screenshotUrl,
      overall_score: report.overallScore,
      opportunity_low_cents: report.totalMonthlyLowCents,
      opportunity_high_cents: report.totalMonthlyHighCents,
      provider: payload.provider,
      model: payload.model,
      prompt_version: payload.promptVersion,
    })
    .eq("id", id);
}

export async function markReportFailed(id: string, error: string): Promise<void> {
  const admin = createAdminClient();
  await admin.from("revenue_reports").update({ status: "failed", error }).eq("id", id);
}

export async function attachCheckoutSession(id: string, sessionId: string): Promise<void> {
  const admin = createAdminClient();
  await admin.from("revenue_reports").update({ stripe_session_id: sessionId }).eq("id", id);
}

export async function markReportPaid(
  id: string,
  payload: { email: string | null; paymentIntent: string | null; amountCents: number | null },
): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from("revenue_reports")
    .update({
      paid: true,
      paid_at: new Date().toISOString(),
      email: payload.email,
      stripe_payment_intent: payload.paymentIntent,
      amount_cents: payload.amountCents,
    })
    .eq("id", id);
}

function safeHost(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}
