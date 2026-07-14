"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { trackServer } from "@/lib/analytics/posthog";
import type { OnboardingAnswers } from "@/config/onboarding";
import { createReport } from "./service";

const NOT_CONFIGURED =
  "The report engine isn't connected in this environment yet. Add your API keys to enable live analysis.";

/** Accepts "example.com" or a full URL; returns a normalised https URL or null. */
function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  if (!z.string().url().safeParse(withProtocol).success) return null;
  try {
    const url = new URL(withProtocol);
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Kick off a personalised analysis from the onboarding wizard. Creates the
 * report row with context, then redirects to the report (which runs generation).
 */
export async function startReportWithContext(
  input: { url: string } & OnboardingAnswers,
): Promise<{ error: string } | void> {
  const url = normalizeUrl(input.url);
  if (!url) return { error: "That website URL doesn't look right. Please check it and retry." };

  await trackServer("website_submitted", "anonymous", {
    url,
    industry: input.industry,
    country: input.country,
    goal: input.mainGoal,
  });

  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED };

  let id: string;
  try {
    id = await createReport(url, {
      industry: input.industry,
      country: input.country,
      averageOrderValueCents: input.averageOrderValueCents,
      mainGoal: input.mainGoal,
      biggestChallenge: input.biggestChallenge,
    });
  } catch {
    return { error: "We couldn't start the analysis. Please try again." };
  }

  redirect(`/report/${id}`);
}
