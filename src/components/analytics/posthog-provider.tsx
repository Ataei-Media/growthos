"use client";

import * as React from "react";
import posthog from "posthog-js";

/**
 * Initialises PostHog on the client with autocapture, heatmaps and session
 * recording — so we get clicks, scrolls, funnels, heatmaps and recordings
 * without hand-instrumenting every element. No-ops when unconfigured.
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";
    if (!key || key.includes("placeholder")) return;

    // Guard against double-init under React strict mode / fast refresh.
    if ((posthog as unknown as { __loaded?: boolean }).__loaded) return;

    posthog.init(key, {
      api_host: host,
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      enable_heatmaps: true,
      disable_session_recording: false,
      persistence: "localStorage+cookie",
    });
  }, []);

  return <>{children}</>;
}
