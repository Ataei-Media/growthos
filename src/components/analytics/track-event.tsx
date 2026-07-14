"use client";

import * as React from "react";
import posthog from "posthog-js";

/** Fire a named funnel event once on mount (client-side). */
export function TrackEvent({
  event,
  properties,
}: {
  event: string;
  properties?: Record<string, unknown>;
}) {
  React.useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || key.includes("placeholder")) return;
    posthog.capture(event, properties);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
