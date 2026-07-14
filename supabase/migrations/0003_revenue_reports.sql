-- =============================================================================
-- GrowthOS — Milestone 4
-- Standalone Revenue Reports for the pay-to-unlock acquisition flow.
--
-- Buyers are strangers (no account). Reports are keyed by a random id and
-- accessed server-side via the service role. RLS is enabled with NO policies,
-- so anon/authenticated clients can read nothing directly — only trusted
-- server code (service role) touches this table.
-- =============================================================================

create table public.revenue_reports (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  domain text,
  brand_name text,
  status text not null default 'generating', -- generating | ready | failed
  report jsonb,
  screenshot_url text,
  overall_score int,
  opportunity_low_cents bigint,
  opportunity_high_cents bigint,
  provider text,
  model text,
  prompt_version text,
  error text,

  -- Commerce
  paid boolean not null default false,
  email citext,
  amount_cents int,
  currency text not null default 'eur',
  stripe_session_id text,
  stripe_payment_intent text,
  paid_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.revenue_reports (stripe_session_id);
create index on public.revenue_reports (created_at desc);

create trigger set_updated_at before update on public.revenue_reports
  for each row execute function public.set_updated_at();

-- Lock the table down: enabled RLS + no policies => only the service role
-- (which bypasses RLS) can access it.
alter table public.revenue_reports enable row level security;
