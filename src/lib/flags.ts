/**
 * Feature flags.
 *
 * Every non-core capability is gated here so features can ship dark, roll out
 * gradually, or be enabled per-plan/per-org without code changes. Nothing in
 * the product should hardcode "is this feature on?" — read it through `flags`.
 *
 * Resolution order (later wins):
 *   1. `defaults` below
 *   2. `NEXT_PUBLIC_FLAG_<NAME>` environment override ("true"/"false")
 *   3. (future) per-organization overrides loaded from the database
 *
 * Public (`NEXT_PUBLIC_`) so the same evaluation runs on server and client.
 */

export const FEATURE_FLAGS = [
  // Core product surfaces (AI Chief Revenue Officer)
  "opportunityEngine",
  "aiChat", // "Your Growth Advisor"
  "aiMemory",
  "livingReports",

  // AI Workspace modules (see product vision)
  "workspaceMarketing",
  "workspaceAds",
  "workspaceSeo",
  "workspaceEmail",
  "workspaceAnalytics",
  "workspaceCompetitors",
  "workspaceTasks",
  "workspaceDocuments",
  "workspaceTeamChat",

  // Commercial / platform
  "competitorMode",
  "marketingGenerator",
  "revenueForecasting",
  "pdfExport",
  "teamSeats",
  "whiteLabel",
  "apiAccess",
  "multiLanguage",
] as const;

export type FeatureFlag = (typeof FEATURE_FLAGS)[number];

/**
 * Ship-dark defaults. Capabilities flip on as their milestone lands and is
 * verified in production — never before. Team seats/invitations are enabled
 * because multi-tenant collaboration ships with Milestone 3.
 */
const defaults: Record<FeatureFlag, boolean> = {
  opportunityEngine: false,
  aiChat: false,
  aiMemory: false,
  livingReports: false,

  workspaceMarketing: false,
  workspaceAds: false,
  workspaceSeo: false,
  workspaceEmail: false,
  workspaceAnalytics: false,
  workspaceCompetitors: false,
  workspaceTasks: false,
  workspaceDocuments: false,
  workspaceTeamChat: false,

  competitorMode: false,
  marketingGenerator: false,
  revenueForecasting: false,
  pdfExport: false,
  teamSeats: true,
  whiteLabel: false,
  apiAccess: false,
  multiLanguage: false,
};

function envKey(flag: FeatureFlag) {
  // camelCase -> SCREAMING_SNAKE_CASE
  const snake = flag.replace(/[A-Z]/g, (c) => `_${c}`).toUpperCase();
  return `NEXT_PUBLIC_FLAG_${snake}`;
}

function readEnvOverride(flag: FeatureFlag): boolean | undefined {
  const raw = process.env[envKey(flag)];
  if (raw === undefined) return undefined;
  return raw === "true" || raw === "1";
}

/** Resolve a single flag. */
export function isEnabled(flag: FeatureFlag): boolean {
  return readEnvOverride(flag) ?? defaults[flag];
}

/** Resolve every flag once (useful for passing a snapshot to the client). */
export function resolveFlags(): Record<FeatureFlag, boolean> {
  return Object.fromEntries(
    FEATURE_FLAGS.map((flag) => [flag, isEnabled(flag)]),
  ) as Record<FeatureFlag, boolean>;
}

/** Ergonomic accessor: `flags.aiChat` -> boolean. */
export const flags = new Proxy({} as Record<FeatureFlag, boolean>, {
  get: (_target, prop: string) => isEnabled(prop as FeatureFlag),
});
