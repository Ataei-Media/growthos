import { CATEGORY_LABELS, type ReportIssue } from "@/features/report/types";
import { cn } from "@/lib/utils";

const severityStyle: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive",
  high: "bg-warning/15 text-warning",
  medium: "bg-muted text-muted-foreground",
};

const severityLabel: Record<string, string> = {
  critical: "Critical",
  high: "High impact",
  medium: "Medium",
};

function Block({ label, children }: { label: string; children: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-[15px] leading-relaxed text-foreground/90">{children}</p>
    </div>
  );
}

export function IssueCard({ issue, index }: { issue: ReportIssue; index: number }) {
  return (
    <article className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex size-6 items-center justify-center rounded-md bg-background text-xs font-semibold text-muted-foreground">
          {index}
        </span>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium",
            severityStyle[issue.severity],
          )}
        >
          {severityLabel[issue.severity]}
        </span>
        <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[issue.category]}</span>
      </div>

      <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground">{issue.title}</h3>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Block label="Current situation">{issue.currentSituation}</Block>
        <Block label="The problem">{issue.problem}</Block>
        <Block label="Why it costs you">{issue.whyItHurts}</Block>
      </div>
    </article>
  );
}
