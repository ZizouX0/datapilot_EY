-- ============================================================================
-- DataPilot — Phase 3 schema (super-admin role + centralized submissions)
-- Run this AFTER phase2.sql (and phase2c.sql), once, in the Supabase SQL editor.
--
-- Adds:
--   • A third role 'superadmin' on top of the existing admin/analyst tiers.
--   • is_admin() redefined to mean "admin OR superadmin", so every existing
--     admin gate (questionnaire editing, user listing) automatically includes
--     super-admins — no other policy needs to change.
--   • is_superadmin() helper for the few super-admin-only checks.
--   • The browser-side role-UPDATE policy is REMOVED: role changes now flow
--     exclusively through the privileged /api/set-role endpoint (service_role),
--     which enforces the hierarchy. This stops a regular admin from editing the
--     profiles table directly to escalate themselves to super-admin.
--   • A `submissions` table holding each analyst's completed assessment so that
--     admins / super-admins can review and export them centrally.
-- ============================================================================

-- 1. Allow the new role value. Drop the old CHECK and add the wider one.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('superadmin', 'admin', 'analyst'));

-- 2. Role helpers. SECURITY DEFINER runs as the owner and bypasses RLS on
--    profiles, so calling them inside a profiles policy does NOT recurse.
--    is_admin() now treats super-admins as admins (capability inheritance).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'superadmin')
  );
$$;

create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'superadmin'
  );
$$;

-- 3. Lock down role writes. The Phase 2 "admins can update any profile" policy
--    let any admin change any role straight from the browser (anon key), which
--    would allow self-escalation to super-admin. Remove it; all role changes go
--    through /api/set-role, which holds the service_role key and enforces the
--    hierarchy. Read policies (own + admin-wide) from earlier phases stay.
drop policy if exists "profiles_update_admin" on public.profiles;

-- 4. Submissions — one row per completed assessment an analyst sends in.
create table if not exists public.submissions (
  id               uuid primary key default gen_random_uuid(),
  analyst_id       uuid not null references auth.users (id) on delete cascade,
  analyst_email    text,
  bank_name        text,
  respondent_name  text,
  respondent_role  text,
  assessment_date  date,
  global_score     numeric,
  maturity_level   int,
  bct_rate         int,
  target_level     int,
  dimension_scores jsonb not null default '{}'::jsonb,  -- { D1: 3.2, ... }
  answers          jsonb not null default '{}'::jsonb,  -- full answers map snapshot
  profile          jsonb not null default '{}'::jsonb,  -- bank profile snapshot
  created_at       timestamptz not null default now()
);

create index if not exists submissions_analyst_idx on public.submissions (analyst_id);
create index if not exists submissions_created_idx on public.submissions (created_at desc);

-- 5. RLS on submissions ------------------------------------------------------
alter table public.submissions enable row level security;

-- Analysts can create submissions, but only ones attributed to themselves.
drop policy if exists "submissions_insert_own" on public.submissions;
create policy "submissions_insert_own"
  on public.submissions for insert to authenticated
  with check (auth.uid() = analyst_id);

-- Each user can read their own submissions; admins / super-admins read all.
drop policy if exists "submissions_select_own" on public.submissions;
create policy "submissions_select_own"
  on public.submissions for select to authenticated
  using (auth.uid() = analyst_id);

drop policy if exists "submissions_select_admin" on public.submissions;
create policy "submissions_select_admin"
  on public.submissions for select to authenticated
  using (public.is_admin());

-- Analysts may delete their own drafts; admins may delete any submission.
drop policy if exists "submissions_delete_own" on public.submissions;
create policy "submissions_delete_own"
  on public.submissions for delete to authenticated
  using (auth.uid() = analyst_id or public.is_admin());

-- ============================================================================
-- After running this:
--   • Promote your first super-admin (replace the email):
--       update public.profiles set role = 'superadmin'
--       where id = (select id from auth.users where email = 'you@ey.com');
--   • Sign out / in. Super-admins see the Admin area, can manage admins, and
--     review every submission. Regular admins manage analysts and review
--     submissions but cannot create or modify super-admins.
--   • /api/set-role needs SUPABASE_SERVICE_ROLE_KEY (same key already used by
--     /api/invite) — no new secret required.
-- ============================================================================
