import { Lock } from "lucide-react";

/**
 * A locked teaser: the title is visible (curiosity), the insight itself is
 * blurred (premium), and revenue impact is shown for opportunities (desire).
 */
export function LockedInsight({
  title,
  category,
  impact,
}: {
  title: string;
  category: string;
  impact?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-xs text-muted-foreground">{category}</span>
          <h4 className="mt-1 font-semibold tracking-tight text-foreground">{title}</h4>
        </div>
        {impact ? (
          <span className="shrink-0 text-sm font-semibold text-success">+{impact}/mo</span>
        ) : (
          <Lock className="size-4 shrink-0 text-muted-foreground" />
        )}
      </div>

      {/* Blurred premium body — the insight is there, just locked. */}
      <div className="mt-3 space-y-2 select-none blur-[5px]" aria-hidden>
        <div className="h-2.5 w-full rounded bg-secondary" />
        <div className="h-2.5 w-11/12 rounded bg-secondary" />
        <div className="h-2.5 w-3/4 rounded bg-secondary" />
      </div>
    </div>
  );
}
