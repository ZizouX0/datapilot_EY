-- ============================================================================
-- DataPilot — Phase 1 auth schema
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query).
-- It creates the profiles table, locks it down with Row Level Security, and
-- auto-creates a profile row (defaulting to the 'analyst' role) for every new
-- auth user.
-- ============================================================================

-- 1. Role type — exactly two roles for now.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('admin', 'analyst');
  end if;
end$$;

-- 2. Profiles table — one row per auth user, holding the role.
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  full_name  text,
  role       public.user_role not null default 'analyst',
  created_at timestamptz not null default now()
);

-- 3. Row Level Security — every access must pass an explicit policy.
alter table public.profiles enable row level security;

-- Users may read their own profile (this is how the app loads its role).
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Admins may read every profile (needed for the Phase 2 user-management screen).
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Note: roles are intentionally NOT user-writable. Promotion to 'admin' is done
-- by a privileged operator in the dashboard (or via the service_role key in a
-- Phase 2 server endpoint), so no INSERT/UPDATE policy is granted to end users.

-- 4. Auto-provision a profile whenever a new auth user is created.
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
