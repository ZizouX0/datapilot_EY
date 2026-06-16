-- ============================================================================
-- DataPilot — Phase 1 auth schema
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query).
-- It creates the profiles table, locks it down with Row Level Security, and
-- auto-creates a profile row (defaulting to the 'analyst' role) for every new
-- auth user.
--
-- Plain idempotent DDL: no enum / no DO block (Supabase's SQL editor rejects
-- CREATE TYPE there). The role is a text column guarded by a CHECK constraint,
-- which is also easier to extend with new roles later.
-- ============================================================================

-- 1. Profiles table — one row per auth user, holding the role.
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  full_name  text,
  role       text not null default 'analyst' check (role in ('admin', 'analyst')),
  created_at timestamptz not null default now()
);

-- 2. Row Level Security — every access must pass an explicit policy.
alter table public.profiles enable row level security;

-- Users may read their own profile (this is how the app loads its role).
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Note: roles are intentionally NOT user-writable. Promotion to 'admin' is done
-- by a privileged operator in the dashboard (or via the service_role key in a
-- Phase 2 server endpoint), so no INSERT/UPDATE policy is granted to end users.
--
-- An "admins can read every profile" policy is deliberately deferred to Phase 2:
-- writing it naively (selecting profiles from inside a policy ON profiles) causes
-- infinite recursion, so it needs a SECURITY DEFINER helper. Phase 1 only needs
-- each user to read their own role, covered by the policy above.

-- 3. Auto-provision a profile whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- After running this:
--   • Dashboard → Authentication → Providers → Email: keep "Confirm email" on,
--     and turn OFF "Allow new users to sign up" (invite-only access).
--   • Invite users: Authentication → Users → "Invite user" (sends a set-password
--     email). Each invited user gets an 'analyst' profile automatically.
--   • Promote an admin (replace the email):
--       update public.profiles set role = 'admin'
--       where id = (select id from auth.users where email = 'you@ey.com');
-- ============================================================================
