/**
 * Cross-cutting domain types shared across features.
 * Feature-specific types live alongside their feature module.
 */

/** Subscription tiers offered by GrowthOS. */
export type PlanId = "free" | "growth" | "agency" | "enterprise";

/** The seven headline scores surfaced on the dashboard (0-100). */
export type ScoreCategory =
  | "marketing"
  | "revenue"
  | "seo"
  | "ads"
  | "email"
  | "conversion"
  | "performance";

export type ScoreSet = Record<ScoreCategory, number>;

/** Severity used to rank audit findings and issues. */
export type Severity = "critical" | "high" | "medium" | "low";

/** Lifecycle of a website audit job. */
export type AuditStatus =
  | "queued"
  | "crawling"
  | "analyzing"
  | "completed"
  | "failed";

/** Generic result wrapper for server actions. */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
