import Link from "next/link";
import { Download } from "lucide-react";
import { ReportHeader } from "./report-header";
import { ReportHero } from "./report-hero";
import { ScoreBars } from "./score-bars";
import { IssueCard } from "./issue-card";
import { OpportunityCard } from "./opportunity-card";
import { LockedInsight } from "./locked-insight";
import { UrgencyNote } from "./urgency-note";
import { UnlockBanner } from "./unlock-banner";
import { Upsell } from "./upsell";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS, type RevenueReport } from "@/features/report/types";
import { formatRange } from "@/features/report/format";

const PREVIEW_WINDOW_HOURS = 24;

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
    </div>
  );
}

function hoursLeft(createdAt?: string): number | undefined {
  if (!createdAt) return undefined;
  const expiry = new Date(createdAt).getTime() + PREVIEW_WINDOW_HOURS * 3_600_000;
  const ms = expiry - Date.now();
  return ms <= 0 ? 0 : Math.ceil(ms / 3_600_000);
}

export function ReportView({
  report,
  reportId,
  paid,
  createdAt,
}: {
  report: RevenueReport;
  reportId: string;
  paid: boolean;
  createdAt?: string;
}) {
  let host = report.url;
  try {
    host = new URL(report.url).host;
  } catch {
    /* keep */
  }

  const allOpps = [...report.quickWins, ...report.growthOpportunities];

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-6 py-10 sm:py-14">
      <ReportHeader brandName={report.brandName} url={report.url} />
      <ReportHero report={report} />

      <section>
        <SectionTitle eyebrow="Website health" title="Where you stand today" />
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <ScoreBars scores={report.scores} />
        </div>
      </section>

      <section>
        <SectionTitle
          eyebrow="Critical issues"
          title={`${report.criticalIssues.length} issues costing you revenue`}
        />
        <div className="mt-6 space-y-4">
          {paid ? (
            report.criticalIssues.map((issue, i) => (
              <IssueCard key={issue.id} issue={issue} index={i + 1} />
            ))
          ) : (
            <>
              {/* One full issue as proof of depth… */}
              <IssueCard issue={report.criticalIssues[0]} index={1} />
              {/* …the rest locked, titles visible to build curiosity. */}
              {report.criticalIssues.slice(1).map((issue) => (
                <LockedInsight
                  key={issue.id}
                  title={issue.title}
                  category={CATEGORY_LABELS[issue.category]}
                />
              ))}
            </>
          )}
        </div>
      </section>

      {paid ? (
        <>
          <section>
            <SectionTitle eyebrow="Quick wins" title="High impact, low effort" />
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {report.quickWins.map((o) => (
                <OpportunityCard key={o.id} opportunity={o} />
              ))}
            </div>
          </section>

          <section>
            <SectionTitle eyebrow="Growth opportunities" title="Bigger bets worth planning" />
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {report.growthOpportunities.map((o) => (
                <OpportunityCard key={o.id} opportunity={o} />
              ))}
            </div>
          </section>

          <section>
            <SectionTitle eyebrow="Action plan" title="Your next three weeks" />
            <ol className="mt-6 space-y-4">
              {report.actionPlan.map((step, i) => (
                <li key={step.title} className="flex gap-4 rounded-xl border border-border bg-card p-5">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold tracking-tight text-foreground">{step.title}</h3>
                    <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
                      {step.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card p-8 text-center">
            <Button asChild size="lg">
              <Link href={`/report/${reportId}/pdf`}>
                <Download className="size-4" />
                Download PDF report
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              We&apos;ve emailed a copy to you so it&apos;s always one click away.
            </p>
          </div>

          <Upsell />
        </>
      ) : (
        <>
          {/* Curiosity: show every opportunity's title + money, blur the how. */}
          <section>
            <SectionTitle
              eyebrow="The opportunities we found"
              title={`${allOpps.length} ways to grow — worth ${formatRange(
                report.totalMonthlyLowCents,
                report.totalMonthlyHighCents,
              )}/mo`}
            />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {allOpps.map((o) => (
                <LockedInsight
                  key={o.id}
                  title={o.title}
                  category={CATEGORY_LABELS[o.category]}
                  impact={formatRange(o.monthlyLowCents, o.monthlyHighCents)}
                />
              ))}
            </div>
          </section>

          <UrgencyNote hoursLeft={hoursLeft(createdAt)} domain={host} />
          <UnlockBanner reportId={reportId} report={report} />
        </>
      )}
    </div>
  );
}
