-- ============================================================================
-- DataPilot — Phase 3g: strict per-bank isolation + invite lineage
-- Run AFTER phase3f.sql, once, in the Supabase SQL editor.
--
-- Turns the app into a proper multi-tenant tree:
--   • invited_by records exactly who invited each user (org tree per bank).
--   • A Super Admin / Admin can see ONLY their own bank's users and submissions;
--     an EY owner sees every bank. Enforced in the database via RLS, so the
--     isolation holds no matter what the client asks for.
--   • The questionnaire stays a single shared definition, but only EY (owner)
--     may edit it — Super Admins / Admins read it, they can't change it.
-- ============================================================================

-- 1. Lineage — who invited this account (null for the very first EY owners and
--    any pre-existing accounts). Drawn as the org tree in Admin → Users.
alter table public.profiles
  add column if not exists invited_by uuid references auth.users (id) on delete set null;

-- 2. Bank helpers (SECURITY DEFINER so they bypass RLS and never recurse when
--    used inside a policy).
create or replace function public.my_bank()
returns text language sql stable security definer set search_path = public
as $$ select bank_name from public.profiles where id = auth.uid(); $$;

-- The bank of an arbitrary user — used to scope submissions by the ANALYST's
-- current bank (spoof-proof: ignores any bank_name stored on the row).
create or replace function public.bank_of(uid uuid)
returns text language sql stable security definer set search_path = public
as $$ select bank_name from public.profiles where id = uid; $$;

-- 3. PROFILES — admins/super-admins see only their own bank; owner sees all.
--    (profiles_select_own from schema.sql still lets everyone read their own row.)
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select to authenticated
  using ( public.is_owner() or (public.is_admin() and bank_name = public.my_bank()) );

-- 4. SUBMISSIONS — admin read/delete scoped to the analyst's bank; owner sees all.
--    (submissions_select_own / submissions_insert_own from phase3.sql unchanged.)
drop policy if exists "submissions_select_admin" on public.submissions;
create policy "submissions_select_admin"
  on public.submissions for select to authenticated
  using ( public.is_owner() or (public.is_admin() and public.bank_of(analyst_id) = public.my_bank()) );

drop policy if exists "submissions_delete_own" on public.submissions;
create policy "submissions_delete_own"
  on public.submissions for delete to authenticated
  using (
    auth.uid() = analyst_id
    or public.is_owner()
    or (public.is_admin() and public.bank_of(analyst_id) = public.my_bank())
  );

-- 5. QUESTIONNAIRE — only EY (owner) may write dimensions/indicators. Everyone
--    keeps read access (the assessment needs it).
drop policy if exists "dimensions_admin_write" on public.dimensions;
create policy "dimensions_admin_write"
  on public.dimensions for all to authenticated
  using ( public.is_owner() ) with check ( public.is_owner() );

drop policy if exists "indicators_admin_write" on public.indicators;
create policy "indicators_admin_write"
  on public.indicators for all to authenticated
  using ( public.is_owner() ) with check ( public.is_owner() );

-- Make everything visible to PostgREST immediately.
notify pgrst, 'reload schema';

-- ============================================================================
-- Invite cascade after this: EY owner invites a bank's Super Admin (naming the
-- bank) → Super Admin invites Admins → Admins invite Analysts. invited_by is set
-- by /api/invite at each step, so Admin → Users renders the exact tree, scoped
-- to the bank(s) the viewer is allowed to see.
-- ============================================================================
