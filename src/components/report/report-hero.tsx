import { ScoreRing } from "@/components/report/score-ring";
import { formatRange } from "@/features/report/format";
import type { RevenueReport } from "@/features/report/types";

export function ReportHero({ report }: { report: RevenueReport }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-8">
      <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
        <div className="flex justify-center">
          <ScoreRing score={report.overallScore} />
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Estimated revenue opportunity
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {formatRange(report.totalMonthlyLowCents, report.totalMonthlyHighCents)}
            </span>
            <span className="text-lg text-muted-foreground">/ month</span>
          </div>
          <p className="mt-4 max-w-2xl text-pretty text-[15px] leading-relaxed text-foreground/90">
            {report.executiveSummary}
          </p>
        </div>
      </div>
    </section>
  );
}
