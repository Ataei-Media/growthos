import { scoreTone } from "@/features/report/format";
import { cn } from "@/lib/utils";

const toneColor: Record<string, string> = {
  strong: "var(--success)",
  ok: "var(--accent)",
  weak: "var(--warning)",
};

/** Circular overall-score gauge (SVG, theme-aware). */
export function ScoreRing({
  score,
  size = 148,
  label = "Revenue Score",
}: {
  score: number;
  size?: number;
  label?: string;
}) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(100, score)) / 100);
  const color = toneColor[scoreTone(score)];

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold tracking-tight text-foreground">{score}</span>
        <span className={cn("text-xs font-medium text-muted-foreground")}>{label}</span>
      </div>
    </div>
  );
}
