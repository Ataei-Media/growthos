-- =============================================================================
-- GrowthOS — Initial schema (Milestone 2 architecture foundation)
--
-- Multi-tenant from day one. Every domain row is scoped to an organization.
-- Audits are reusable objects, not one-off reports:
--   audit -> audit_sections -> findings -> recommendations
--         -> revenue_opportunities
--         -> generated_assets
-- Everything remains editable. Prompt versions are stored with every audit.
--
-- Row Level Security is enabled on all tables and scoped by org membership.
-- The service role (used by the server-side audit/AI engine) bypasses RLS.
-- =============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type plan_tier as enum ('free', 'growth', 'agency', 'enterprise');
create type member_role as enum ('owner', 'admin', 'manager', 'analyst', 'viewer');
create type subscription_status as enum (
  'trialing', 'active', 'past_due', 'canceled',
  'incomplete', 'incomplete_expired', 'unpaid', 'paused'
);
create type audit_status as enum ('queued', 'crawling', 'analyzing', 'completed', 'failed');
create type severity as enum ('critical', 'high', 'medium', 'low');
create type audit_section_key as enum (
  'homepage', 'navigation', 'copywriting', 'branding', 'seo', 'trust', 'speed',
  'ads', 'email', 'retention', 'upsells', 'bundles', 'social_proof',
  'pricing_psychology', 'cta', 'mobile', 'technical'
);
create type asset_type as enum (
  'facebook_ad', 'instagram_ad', 'tiktok_ad', 'google_ad', 'pinterest_ad',
  'linkedin_ad', 'email_campaign', 'sms_campaign', 'blog_article',
  'instagram_caption', 'tiktok_hook', 'video_script', 'landing_page',
  'sales_page', 'product_description'
);

-- -----------------------------------------------------------------------------
-- Helper: keep updated_at fresh
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- users  (public profile mirror of auth.users)
-- -----------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email citext not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- organizations + membership (multi-tenant core)
-- -----------------------------------------------------------------------------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug citext not null unique,
  owner_id uuid not null references public.users (id) on delete restrict,
  plan plan_tier not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  role member_role not null default 'viewer',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

-- Membership helpers (SECURITY DEFINER to avoid RLS recursion).
create or replace function public.is_org_member(org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = org and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_org_admin(org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = org
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  );
$$;

-- -----------------------------------------------------------------------------
-- subscriptions + payments (Stripe)
-- -----------------------------------------------------------------------------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan plan_tier not null default 'free',
  status subscription_status not null default 'active',
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  stripe_payment_intent_id text,
  amount_cents bigint not null default 0,
  currency text not null default 'eur',
  status text not null default 'succeeded',
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- projects + websites
-- -----------------------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.websites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  url text not null,
  domain text,
  favicon_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- audits (reusable object graph)
-- -----------------------------------------------------------------------------
create table public.audits (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  website_id uuid not null references public.websites (id) on delete cascade,
  status audit_status not null default 'queued',
  overall_score int check (overall_score between 0 and 100),
  revenue_opportunity_cents bigint,
  screenshot_url text,
  provider text,
  model text,
  prompt_version text,
  started_at timestamptz,
  finished_at timestamptz,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_sections (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  key audit_section_key not null,
  score int check (score between 0 and 100),
  summary text,
  prompt_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.findings (
  id uuid primary key default gen_random_uuid(),
  audit_section_id uuid not null references public.audit_sections (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  current_situation text,
  problem text,
  impact text,
  severity severity not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  finding_id uuid not null references public.findings (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  how_to_fix text,
  example text,
  priority int not null default 3,
  estimated_revenue_cents bigint,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.revenue_opportunities (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  description text,
  estimated_value_cents bigint,
  confidence text,
  created_at timestamptz not null default now()
);

create table public.generated_assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  audit_id uuid references public.audits (id) on delete set null,
  recommendation_id uuid references public.recommendations (id) on delete set null,
  type asset_type not null,
  title text,
  content jsonb not null default '{}',
  provider text,
  model text,
  prompt_version text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- competitors + reports
-- -----------------------------------------------------------------------------
create table public.competitors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  website_id uuid references public.websites (id) on delete set null,
  url text not null,
  name text,
  analysis jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  audit_id uuid not null references public.audits (id) on delete cascade,
  title text not null,
  pdf_url text,
  shared_slug citext unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- events + notifications
-- -----------------------------------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  actor_id uuid references public.users (id) on delete set null,
  type text not null,
  payload jsonb not null default '{}',
  occurred_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Indexes (hot paths for 100k+ orgs)
-- -----------------------------------------------------------------------------
create index on public.organization_members (user_id);
create index on public.organization_members (organization_id);
create index on public.projects (organization_id);
create index on public.websites (organization_id);
create index on public.audits (organization_id, status);
create index on public.audits (website_id);
create index on public.audit_sections (audit_id);
create index on public.findings (audit_section_id);
create index on public.recommendations (finding_id);
create index on public.revenue_opportunities (audit_id);
create index on public.generated_assets (organization_id, type);
create index on public.competitors (organization_id);
create index on public.reports (organization_id);
create index on public.payments (organization_id);
create index on public.events (organization_id, occurred_at desc);
create index on public.events (type);
create index on public.notifications (user_id, read);

-- -----------------------------------------------------------------------------
-- updated_at triggers
-- -----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'users','organizations','subscriptions','projects','websites','audits',
    'audit_sections','findings','recommendations','generated_assets',
    'competitors','reports'
  ]
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.set_updated_at();', t
    );
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.projects enable row level security;
alter table public.websites enable row level security;
alter table public.audits enable row level security;
alter table public.audit_sections enable row level security;
alter table public.findings enable row level security;
alter table public.recommendations enable row level security;
alter table public.revenue_opportunities enable row level security;
alter table public.generated_assets enable row level security;
alter table public.competitors enable row level security;
alter table public.reports enable row level security;
alter table public.events enable row level security;
alter table public.notifications enable row level security;

-- users: only your own profile row.
create policy "users self select" on public.users
  for select using (id = auth.uid());
create policy "users self update" on public.users
  for update using (id = auth.uid());

-- organizations: members read; admins update; any authed user can create.
create policy "org member select" on public.organizations
  for select using (public.is_org_member(id));
create policy "org admin update" on public.organizations
  for update using (public.is_org_admin(id));
create policy "org insert" on public.organizations
  for insert with check (owner_id = auth.uid());

-- organization_members: members read; admins manage.
create policy "members select" on public.organization_members
  for select using (public.is_org_member(organization_id));
create policy "members admin write" on public.organization_members
  for all using (public.is_org_admin(organization_id))
  with check (public.is_org_admin(organization_id));

-- subscriptions & payments: members read only (writes come from webhooks / service role).
create policy "subscriptions member select" on public.subscriptions
  for select using (public.is_org_member(organization_id));
create policy "payments member select" on public.payments
  for select using (public.is_org_member(organization_id));

-- Uniform org-scoped CRUD for the remaining domain tables.
do $$
declare t text;
begin
  foreach t in array array[
    'projects','websites','audits','audit_sections','findings',
    'recommendations','revenue_opportunities','generated_assets',
    'competitors','reports','events'
  ]
  loop
    execute format(
      'create policy "%1$s org member all" on public.%1$s
         for all using (public.is_org_member(organization_id))
         with check (public.is_org_member(organization_id));', t
    );
  end loop;
end;
$$;

-- notifications: scoped to the recipient user.
create policy "notifications own select" on public.notifications
  for select using (user_id = auth.uid() and public.is_org_member(organization_id));
create policy "notifications own update" on public.notifications
  for update using (user_id = auth.uid());
