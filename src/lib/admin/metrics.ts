import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface AdminMetrics {
  revenueTodayCents: number;
  revenueTotalCents: number;
  reportsToday: number;
  reportsTotal: number;
  paidTotal: number;
  conversionRate: number; // paid / total reports
  paymentRate: number; // paid / ready
  avgOpportunityCents: number;
  failedGenerations: number;
  aiCostTodayMicros: number;
  aiCostTotalMicros: number;
  topIndustries: { industry: string; count: number }[];
}

const EMPTY: AdminMetrics = {
  revenueTodayCents: 0,
  revenueTotalCents: 0,
  reportsToday: 0,
  reportsTotal: 0,
  paidTotal: 0,
  conversionRate: 0,
  paymentRate: 0,
  avgOpportunityCents: 0,
  failedGenerations: 0,
  aiCostTodayMicros: 0,
  aiCostTotalMicros: 0,
  topIndustries: [],
};

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * Internal metrics for the admin dashboard. Aggregated in-process, which is
 * fine at early volume; move to SQL aggregates / a materialised view once the
 * table grows large.
 */
export async function getAdminMetrics(): Promise<AdminMetrics> {
  if (!isSupabaseConfigured()) return EMPTY;
  const admin = createAdminClient();
  const todayIso = startOfTodayIso();

  const { data: reports } = await admin
    .from("revenue_reports")
    .select(
      "status, paid, amount_cents, paid_at, opportunity_low_cents, opportunity_high_cents, industry, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(5000);

  const { data: generations } = await admin
    .from("ai_generations")
    .select("cost_micros, success, created_at")
    .order("created_at", { ascending: false })
    .limit(5000);

  const rows = reports ?? [];
  const gens = generations ?? [];

  const reportsTotal = rows.length;
  const reportsToday = rows.filter((r) => r.created_at >= todayIso).length;
  const ready = rows.filter((r) => r.status === "ready" || r.paid);
  const paidRows = rows.filter((r) => r.paid);
  const paidTotal = paidRows.length;

  const revenueTotalCents = paidRows.reduce((s, r) => s + (r.amount_cents ?? 0), 0);
  const revenueTodayCents = paidRows
    .filter((r) => (r.paid_at ?? "") >= todayIso)
    .reduce((s, r) => s + (r.amount_cents ?? 0), 0);

  const oppValues = ready
    .map((r) => {
      const lo = r.opportunity_low_cents ?? 0;
      const hi = r.opportunity_high_cents ?? 0;
      return lo || hi ? (lo + hi) / 2 : null;
    })
    .filter((v): v is number => v !== null);
  const avgOpportunityCents =
    oppValues.length > 0 ? Math.round(oppValues.reduce((s, v) => s + v, 0) / oppValues.length) : 0;

  const failedGenerations =
    rows.filter((r) => r.status === "failed").length + gens.filter((g) => !g.success).length;

  const aiCostTotalMicros = gens.reduce((s, g) => s + (g.cost_micros ?? 0), 0);
  const aiCostTodayMicros = gens
    .filter((g) => g.created_at >= todayIso)
    .reduce((s, g) => s + (g.cost_micros ?? 0), 0);

  const industryCounts = new Map<string, number>();
  for (const r of rows) {
    if (!r.industry) continue;
    industryCounts.set(r.industry, (industryCounts.get(r.industry) ?? 0) + 1);
  }
  const topIndustries = [...industryCounts.entries()]
    .map(([industry, count]) => ({ industry, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    revenueTodayCents,
    revenueTotalCents,
    reportsToday,
    reportsTotal,
    paidTotal,
    conversionRate: reportsTotal > 0 ? paidTotal / reportsTotal : 0,
    paymentRate: ready.length > 0 ? paidTotal / ready.length : 0,
    avgOpportunityCents,
    failedGenerations,
    aiCostTodayMicros,
    aiCostTotalMicros,
    topIndustries,
  };
}
