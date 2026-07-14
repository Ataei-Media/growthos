import { CATEGORY_LABELS, type ReportCategory } from "@/features/report/types";
import { scoreTone } from "@/features/report/format";
import { cn } from "@/lib/utils";

const toneBg: Record<string, string> = {
  strong: "bg-success",
  ok: "bg-accent",
  weak: "bg-warning",
};

export function ScoreBars({ scores }: { scores: { category: ReportCategory; score: number }[] }) {
  return (
    <div className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
      {scores.map((s) => (
        <div key={s.category} className="grid grid-cols-[130px_1fr_28px] items-center gap-3">
          <span className="truncate text-sm text-muted-foreground">
            {CATEGORY_LABELS[s.category]}
          </span>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className={cn("h-full rounded-full", toneBg[scoreTone(s.score)])}
              style={{ width: `${s.score}%` }}
            />
          </div>
          <span className="text-right text-sm font-medium tabular-nums text-foreground">
            {s.score}
          </span>
        </div>
      ))}
    </div>
  );
}
