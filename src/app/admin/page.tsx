import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminMetrics } from "@/lib/admin/metrics";
import { formatCents } from "@/features/report/format";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

const usd = (micros: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(micros / 1_000_000);
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export default async function AdminPage() {
  await requireAdmin();
  const m = await getAdminMetrics();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Revenue Control</h1>
        <p className="mt-1 text-sm text-muted-foreground">Internal metrics — GrowthOS.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Revenue today" value={formatCents(m.revenueTodayCents)} sub={`${formatCents(m.revenueTotalCents)} all time`} />
        <Stat label="Reports today" value={String(m.reportsToday)} sub={`${m.reportsTotal} all time`} />
        <Stat label="Conversion" value={pct(m.conversionRate)} sub={`${m.paidTotal} paid`} />
        <Stat label="Payment rate" value={pct(m.paymentRate)} sub="paid ÷ ready" />
        <Stat label="Avg opportunity" value={`${formatCents(m.avgOpportunityCents)}/mo`} sub="per report" />
        <Stat label="Failed generations" value={String(m.failedGenerations)} />
        <Stat label="AI cost today" value={usd(m.aiCostTodayMicros)} sub={`${usd(m.aiCostTotalMicros)} all time`} />
        <Stat
          label="Gross margin (today)"
          value={
            m.revenueTodayCents > 0
              ? pct(1 - m.aiCostTodayMicros / 1_000_000 / (m.revenueTodayCents / 100))
              : "—"
          }
          sub="revenue vs AI cost"
        />
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold text-foreground">Top industries</h2>
        {m.topIndustries.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No data yet.</p>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {m.topIndustries.map((row) => (
              <li key={row.industry} className="flex items-center justify-between text-sm">
                <span className="text-foreground/90">{row.industry}</span>
                <span className="font-medium tabular-nums text-muted-foreground">{row.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
