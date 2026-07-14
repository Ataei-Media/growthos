-- =============================================================================
-- GrowthOS — Milestone 3
-- Auth provisioning, teams & invitations, AI memory, and the Opportunity Engine.
--
-- New objects here reflect the "AI Chief Revenue Officer" vision:
--   * organization_memory — persistent per-org AI context (never ask twice)
--   * opportunities        — the core object everything becomes
--   * invitations          — team collaboration
--   * audit_logs           — security trail (distinct from analytics `events`)
-- =============================================================================

create type invitation_status as enum ('pending', 'accepted', 'revoked', 'expired');
create type opportunity_status as enum ('open', 'in_progress', 'done', 'dismissed');
create type opportunity_difficulty as enum ('easy', 'medium', 'hard');
create type opportunity_action as enum ('fix', 'generate', 'create_flow', 'review');

-- -----------------------------------------------------------------------------
-- Auto-provision public.users from auth.users (source of truth = Supabase Auth)
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.users.full_name, excluded.full_name),
        avatar_url = coalesce(public.users.avatar_url, excluded.avatar_url);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- organization_memory — persistent AI context
-- -----------------------------------------------------------------------------
create table public.organization_memory (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  brand_voice text,
  audience text,
  country text,
  industry text,
  average_order_value_cents bigint,
  currency text not null default 'eur',
  -- Free-form learned facts the AI accumulates over time.
  facts jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on public.organization_memory
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- opportunities — the Opportunity Engine core object
-- -----------------------------------------------------------------------------
create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  audit_id uuid references public.audits (id) on delete set null,
  finding_id uuid references public.findings (id) on delete set null,
  title text not null,
  area audit_section_key,
  potential_monthly_cents bigint,
  difficulty opportunity_difficulty not null default 'medium',
  estimated_minutes int,
  confidence int check (confidence between 0 and 100),
  action opportunity_action not null default 'fix',
  status opportunity_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.opportunities (organization_id, status);
create index on public.opportunities (audit_id);

create trigger set_updated_at before update on public.opportunities
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- invitations — team collaboration
-- -----------------------------------------------------------------------------
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email citext not null,
  role member_role not null default 'analyst',
  token text not null unique,
  status invitation_status not null default 'pending',
  invited_by uuid references public.users (id) on delete set null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, email)
);

create index on public.invitations (organization_id);
create index on public.invitations (email);

-- -----------------------------------------------------------------------------
-- audit_logs — security trail
-- -----------------------------------------------------------------------------
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  actor_id uuid references public.users (id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  ip inet,
  user_agent text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index on public.audit_logs (organization_id, created_at desc);
create index on public.audit_logs (actor_id);

-- -----------------------------------------------------------------------------
-- RPCs: safe org creation + invitation acceptance (SECURITY DEFINER)
-- -----------------------------------------------------------------------------
create or replace function public.create_organization(org_name text, org_slug text)
returns public.organizations language plpgsql security definer set search_path = public as $$
declare
  new_org public.organizations;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  insert into public.organizations (name, slug, owner_id)
  values (org_name, org_slug, auth.uid())
  returning * into new_org;

  insert into public.organization_members (organization_id, user_id, role)
  values (new_org.id, auth.uid(), 'owner');

  insert into public.organization_memory (organization_id)
  values (new_org.id);

  return new_org;
end;
$$;

create or replace function public.accept_invitation(invite_token text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  inv public.invitations;
  uid uuid := auth.uid();
  uemail citext;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  select email into uemail from public.users where id = uid;
  select * into inv from public.invitations where token = invite_token;

  if inv.id is null then
    raise exception 'invitation not found';
  end if;
  if inv.status <> 'pending' then
    raise exception 'invitation is no longer valid';
  end if;
  if inv.expires_at < now() then
    update public.invitations set status = 'expired' where id = inv.id;
    raise exception 'invitation expired';
  end if;
  if lower(inv.email) <> lower(uemail) then
    raise exception 'invitation was sent to a different email';
  end if;

  insert into public.organization_members (organization_id, user_id, role)
  values (inv.organization_id, uid, inv.role)
  on conflict (organization_id, user_id) do update set role = excluded.role;

  update public.invitations
    set status = 'accepted', accepted_at = now()
    where id = inv.id;

  return inv.organization_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.organization_memory enable row level security;
alter table public.opportunities enable row level security;
alter table public.invitations enable row level security;
alter table public.audit_logs enable row level security;

create policy "memory member select" on public.organization_memory
  for select using (public.is_org_member(organization_id));
create policy "memory admin write" on public.organization_memory
  for all using (public.is_org_admin(organization_id))
  with check (public.is_org_admin(organization_id));

create policy "opportunities member all" on public.opportunities
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "invitations member select" on public.invitations
  for select using (public.is_org_member(organization_id));
create policy "invitations admin write" on public.invitations
  for all using (public.is_org_admin(organization_id))
  with check (public.is_org_admin(organization_id));

-- Security trail is admin-readable; writes come from the service role.
create policy "audit_logs admin select" on public.audit_logs
  for select using (organization_id is not null and public.is_org_admin(organization_id));
