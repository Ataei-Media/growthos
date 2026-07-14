-- =============================================================================
-- GrowthOS — Milestone 5 (conversion + revenue instrumentation)
--   * Onboarding context on each report (personalises every AI generation)
--   * ai_generations: per-generation cost & quality log
-- =============================================================================

-- Onboarding answers captured before analysis.
alter table public.revenue_reports
  add column industry text,
  add column country text,
  add column average_order_value_cents bigint,
  add column main_goal text,
  add column biggest_challenge text;

-- Per-generation observability: tokens, model, duration, cost, success.
create table public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.revenue_reports (id) on delete set null,
  provider text not null,
  model text not null,
  prompt_version text,
  prompt_tokens int not null default 0,
  completion_tokens int not null default 0,
  total_tokens int not null default 0,
  -- Cost stored in micro-USD (1e-6 USD) to stay integer-precise.
  cost_micros bigint not null default 0,
  duration_ms int not null default 0,
  success boolean not null default true,
  error text,
  created_at timestamptz not null default now()
);

create index on public.ai_generations (created_at desc);
create index on public.ai_generations (model);

-- Service-role only (internal observability).
alter table public.ai_generations enable row level security;
