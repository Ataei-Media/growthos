import { Clock, ShieldCheck } from "lucide-react";

/**
 * Ethical urgency: both claims are literally true. The preview really is unique
 * to this site, and it really does expire (the report page enforces the 24h
 * window). No fake countdowns.
 */
export function UrgencyNote({ hoursLeft, domain }: { hoursLeft?: number; domain: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span className="inline-flex items-center gap-2">
        <ShieldCheck className="size-4 text-accent" />
        This analysis is unique to <span className="font-medium text-foreground">{domain}</span>.
      </span>
      {typeof hoursLeft === "number" && hoursLeft > 0 ? (
        <span className="inline-flex items-center gap-2">
          <Clock className="size-4 text-warning" />
          Your free preview is saved for{" "}
          <span className="font-medium text-foreground">
            {hoursLeft} more hour{hoursLeft === 1 ? "" : "s"}
          </span>
          .
        </span>
      ) : null}
    </div>
  );
}
