import "server-only";
import { PostHog } from "posthog-node";
import { clientEnv } from "@/lib/env";

/** The acquisition funnel — the only events we track for now. */
export type FunnelEvent =
  | "landing_page_visit"
  | "website_submitted"
  | "analysis_started"
  | "analysis_finished"
  | "payment_started"
  | "payment_completed"
  | "report_downloaded";

function posthogConfigured() {
  const key = clientEnv.NEXT_PUBLIC_POSTHOG_KEY;
  return Boolean(key) && !key!.includes("placeholder");
}

/**
 * Capture a funnel event server-side. Best-effort and non-blocking on failure —
 * analytics must never break the revenue flow.
 */
export async function trackServer(
  event: FunnelEvent,
  distinctId: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  if (!posthogConfigured()) return;
  const client = new PostHog(clientEnv.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: clientEnv.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
  try {
    client.capture({ distinctId, event, properties });
    await client.shutdown();
  } catch {
    /* swallow — analytics is best-effort */
  }
}
