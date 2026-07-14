import { Clock, Gauge, TrendingUp } from "lucide-react";
import { CATEGORY_LABELS, type ReportOpportunity } from "@/features/report/types";
import {
  ACTION_LABEL,
  DIFFICULTY_LABEL,
  formatMinutes,
  formatRange,
} from "@/features/report/format";

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
      {icon}
      {children}
    </span>
  );
}

export function OpportunityCard({ opportunity }: { opportunity: ReportOpportunity }) {
  const o = opportunity;
  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
              Priority {o.priority}
            </span>
            <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[o.category]}</span>
          </div>
          <h3 className="mt-2 text-base font-semibold tracking-tight text-foreground">{o.title}</h3>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-sm font-semibold text-success">
            +{formatRange(o.monthlyLowCents, o.monthlyHighCents)}
          </div>
          <div className="text-[11px] text-muted-foreground">per month</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Chip icon={<Gauge className="size-3.5" />}>{DIFFICULTY_LABEL[o.difficulty]}</Chip>
        <Chip icon={<Clock className="size-3.5" />}>{formatMinutes(o.estimatedMinutes)}</Chip>
        <Chip icon={<TrendingUp className="size-3.5" />}>{o.confidence}% confidence</Chip>
      </div>

      <p className="mt-4 text-[15px] leading-relaxed text-foreground/90">{o.whatToDo}</p>

      <div className="mt-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Why it matters
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{o.whyItMatters}</p>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-background p-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Example</p>
        <p className="mt-1 text-sm italic text-foreground/80">“{o.example}”</p>
      </div>

      <div className="mt-4 flex items-center justify-between pt-1">
        <span className="text-xs text-muted-foreground">
          Recommended action:{" "}
          <span className="font-medium text-foreground">{ACTION_LABEL[o.action]}</span>
        </span>
      </div>
    </article>
  );
}
