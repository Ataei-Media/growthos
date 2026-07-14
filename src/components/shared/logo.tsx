import { cn } from "@/lib/utils";

/**
 * GrowthOS wordmark. A minimal "rising signal" mark (revenue trending up) plus
 * the wordmark. Typography-first, no gradients or blobs.
 */
export function Logo({ className, showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        aria-hidden="true"
        className="text-accent"
      >
        <rect x="0.75" y="0.75" width="20.5" height="20.5" rx="6" className="stroke-border" strokeWidth="1.5" />
        <path
          d="M5.5 14.5L9 11L12 13L16.5 7.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="16.5" cy="7.5" r="1.6" fill="currentColor" />
      </svg>
      {showWordmark && (
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          Growth<span className="text-muted-foreground">OS</span>
        </span>
      )}
    </span>
  );
}
