-- =============================================================================
-- GrowthOS — Grants
--
-- Ensure the Supabase API roles have table/sequence privileges on the public
-- schema. Supabase normally applies these automatically, but tables created via
-- the SQL editor / manual migrations can miss them, causing
-- "permission denied for table ..." at runtime. Row Level Security still guards
-- every row; these grants only provide the baseline access RLS then filters.
-- =============================================================================

grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
