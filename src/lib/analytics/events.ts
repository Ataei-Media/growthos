/**
 * Canonical event taxonomy.
 *
 * Every meaningful action in GrowthOS is logged as a typed event. This module
 * defines the contract (names + payload shapes); the sink that persists events
 * to the `events` table and forwards them to PostHog is wired in Milestone 3
 * once the Supabase clients exist.
 *
 * Rules:
 *  - Event names are `noun.verb` in past tense, snake within segments.
 *  - Payloads are small, PII-free, and JSON-serialisable.
 *  - Never remove or repurpose an event name — add a new one.
 */

export const EVENT_NAMES = [
  "audit.started",
  "audit.finished",
  "audit.failed",
  "report.viewed",
  "pdf.downloaded",
  "competitor.added",
  "generation.created",
  "subscription.purchased",
  "subscription.canceled",
  "member.invited",
  "project.created",
  "website.connected",
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

/** Strongly-typed payloads per event. Keep these lean and PII-free. */
export interface EventPayloads {
  "audit.started": { auditId: string; websiteUrl: string; promptVersion: string };
  "audit.finished": { auditId: string; overallScore: number; durationMs: number };
  "audit.failed": { auditId: string; reason: string };
  "report.viewed": { reportId: string; auditId: string };
  "pdf.downloaded": { reportId: string };
  "competitor.added": { competitorId: string; competitorUrl: string };
  "generation.created": { assetId: string; assetType: string; provider: string };
  "subscription.purchased": { plan: string; interval: string };
  "subscription.canceled": { plan: string };
  "member.invited": { role: string };
  "project.created": { projectId: string };
  "website.connected": { websiteId: string; url: string };
}

export interface TrackedEvent<T extends EventName = EventName> {
  name: T;
  organizationId: string;
  actorId: string | null;
  payload: EventPayloads[T];
  occurredAt: string;
}

/**
 * Contract implemented by the concrete event sink (Milestone 3). Declared here
 * so services can depend on the interface, not the implementation.
 */
export interface EventSink {
  track<T extends EventName>(
    name: T,
    context: { organizationId: string; actorId?: string | null },
    payload: EventPayloads[T],
  ): Promise<void>;
}
