-- ============================================================================
-- DataPilot — Phase 3f: EY platform tier ('owner') above bank super-admins
-- Run AFTER phase3e.sql, once, in the Supabase SQL editor.
--
-- Adds a 4th, highest role 'owner' (shown as "EY Admin" in the UI): EY platform
-- staff who onboard banks. The hierarchy is now:
--     owner (EY)  >  superadmin (bank)  >  admin  >  analyst
-- An owner is not tied to a bank; when they invite someone into a bank they
-- specify the bank. Owners inherit all admin/super-admin capabilities, so every
-- existing admin/super-admin gate (is_admin / is_superadmin) includes them and
-- no other policy needs to change.
-- ============================================================================

-- 1. Allow the new role value. Widen the CHECK to include 'owner'.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('owner', 'superadmin', 'admin', 'analyst'));

-- 2. Capability inheritance. is_admin() / is_superadmin() now treat owners as
--    (super-)admins, so admin- and super-admin-gated surfaces stay open to EY.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'superadmin', 'owner')
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
    where id = auth.uid() and role in ('superadmin', 'owner')
  );
$$;

-- 3. is_owner() helper for the few EY-only checks.
create or replace function public.is_owner()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner'
  );
$$;

-- Make the change visible to PostgREST immediately.
notify pgrst, 'reload schema';

-- ============================================================================
-- After running this: promote your EY account once (replace the email):
--   update public.profiles set role = 'owner'
--   where id = (select id from auth.users where email = 'you@ey.com');
-- An owner can then invite a bank's Super Admin (typing that bank's name) from
-- Admin → Users & roles; the Super Admin builds their own team from there.
-- ============================================================================
