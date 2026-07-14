import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REPORT_PRICE_LABEL } from "@/config/pricing";
import { formatRange } from "@/features/report/format";
import type { RevenueReport } from "@/features/report/types";

/** The paywall — everything below the free preview lives behind this. */
export function UnlockBanner({ reportId, report }: { reportId: string; report: RevenueReport }) {
  const locked = [
    `All ${report.criticalIssues.length} critical issues, in full detail`,
    `${report.quickWins.length} quick wins with exact revenue impact`,
    `${report.growthOpportunities.length} growth opportunities`,
    "Your 3-week prioritised action plan",
    "A boardroom-ready PDF you can share or send to your team",
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-accent/40 bg-card ring-1 ring-accent/20">
      <div className="grid gap-8 p-8 md:grid-cols-2 md:p-10">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
            <Lock className="size-3.5" />
            Full report locked
          </span>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
            Unlock the {formatRange(report.totalMonthlyLowCents, report.totalMonthlyHighCents)}/mo
            opportunity
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
            You&apos;ve seen the diagnosis. The full report shows you exactly what
            to change, with copy-paste examples and the revenue behind each fix.
          </p>
          <ul className="mt-5 space-y-2.5">
            {locked.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/90">
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-center rounded-xl border border-border bg-background p-7 text-center">
          <div className="flex items-end justify-center gap-1">
            <span className="text-5xl font-semibold tracking-tight text-foreground">
              {REPORT_PRICE_LABEL}
            </span>
            <span className="mb-1.5 text-sm text-muted-foreground">one-time</span>
          </div>
          <Button asChild size="lg" variant="accent" className="mt-6">
            <Link href={`/report/${reportId}/checkout`}>Unlock full report</Link>
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Instant access · Emailed to you · 30-day money-back guarantee
          </p>
        </div>
      </div>
    </section>
  );
}
