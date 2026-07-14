import { cn } from "@/lib/utils";

/** Illustrative report snapshot for the hero (not customer data). */
const categories = [
  { label: "Conversion", score: 58 },
  { label: "SEO", score: 71 },
  { label: "Ads", score: 46 },
  { label: "Email", score: 39 },
  { label: "Trust", score: 82 },
] as const;

function toneFor(score: number) {
  if (score >= 75) return "bg-success";
  if (score >= 55) return "bg-accent";
  return "bg-warning";
}

export function HeroPreview() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <div className="ml-3 flex-1">
            <div className="inline-flex max-w-full items-center rounded-md bg-background px-2.5 py-1 text-xs text-muted-foreground">
              growthos.app/report
            </div>
          </div>
        </div>

        {/* Report body */}
        <div className="grid gap-6 p-6 sm:grid-cols-[220px_1fr] sm:p-8">
          <div className="flex flex-col justify-center rounded-lg border border-border bg-background p-6">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Revenue Score
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-5xl font-semibold tracking-tight text-foreground">63</span>
              <span className="text-lg text-muted-foreground">/100</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">€38k–€61k</span> annual
              opportunity identified
            </p>
          </div>

          <div className="flex flex-col justify-center gap-3.5">
            {categories.map((c) => (
              <div key={c.label} className="grid grid-cols-[92px_1fr_32px] items-center gap-3">
                <span className="text-sm text-muted-foreground">{c.label}</span>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn("h-full rounded-full", toneFor(c.score))}
                    style={{ width: `${c.score}%` }}
                  />
                </div>
                <span className="text-right text-sm font-medium tabular-nums text-foreground">
                  {c.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
