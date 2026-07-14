# GrowthOS — Architecture Principles

Binding decisions. Every milestone is built to these; deviations need an explicit
call. GrowthOS is built as if it will serve **100,000+ organizations, millions of
generations, teams, agencies, API access and multiple languages**.

### 1. Positioning — Revenue Intelligence, not "AI"
We sell **Revenue Intelligence / Growth Intelligence / Conversion Intelligence**.
Never "AI Website Analyzer" or "AI Marketing Tool". The customer buys revenue, not
AI. Guardrails live in [`src/config/messaging.ts`](./src/config/messaging.ts).

### 2. Audits are reusable objects
We never generate a report directly. We build an editable object graph:
`audit → audit_sections → findings → recommendations → revenue_opportunities → generated_assets`.
Each layer is its own table and independently editable. Schema:
[`supabase/migrations/0001_initial_schema.sql`](./supabase/migrations/0001_initial_schema.sql).

### 3. Design system — product, not marketing template
The app feels like Linear / Stripe / Vercel / Raycast / Notion. Typography first.
Small radius, minimal borders, generous whitespace, subtle motion. **No** large
gradients, heavy shadows, blobs, or oversized icons. Tokens in
[`src/app/globals.css`](./src/app/globals.css).

### 4. Database-first, multi-tenant
The schema exists before the features. All 17 core tables ship in migration 0001,
even while empty. Every domain row carries `organization_id`; RLS scopes access by
org membership. No code assumes a single user or single website.

### 5. Feature flags everywhere
Non-core capabilities are gated in [`src/lib/flags.ts`](./src/lib/flags.ts) and
ship dark by default (competitor mode, marketing generator, revenue forecasting,
PDF export, team seats, white-label, API access, multi-language). Never hardcode
"is this on?".

### 6. AI provider abstraction
Components never call a model SDK. The pipeline is
`Context Builder → Prompt Builder → AIProvider → Response Parser → Storage`.
The [`AIProvider`](./src/lib/ai/provider.ts) interface lets us swap GPT / Claude /
Gemini / DeepSeek without touching feature code.

### 7. Prompt versioning
Every prompt is versioned via the [prompt registry](./src/lib/ai/prompt-registry.ts).
The exact version used is persisted with each audit (`audits.prompt_version`,
`audit_sections.prompt_version`) for reproducibility and measured improvement.

### 8. Event logging
Every meaningful action is a typed event (audit started/finished, PDF downloaded,
competitor added, subscription purchased, generation created, …). Taxonomy in
[`src/lib/analytics/events.ts`](./src/lib/analytics/events.ts), persisted to the
`events` table and forwarded to PostHog.

### 9. Landing page converts like a product page
Apple / Linear / Vercel — not ThemeForest. Whitespace, large type, minimal copy.
Every section answers exactly one objection.

### 10. Build for the future
Multi-tenant, typed end-to-end, modular. Teams, agencies (white-label), API access
and i18n are anticipated in the schema and flags from day one.
