-- ============================================================================
-- DataPilot — Phase 2 schema (editable content + user management)
-- Run this AFTER schema.sql, once, in the Supabase SQL editor.
--
-- Adds:
--   • is_admin() helper (SECURITY DEFINER) — checks the caller's role without
--     causing RLS recursion on the profiles table.
--   • dimensions + indicators tables holding the editable questionnaire.
--   • RLS: any signed-in user can READ the questionnaire; only admins can WRITE.
--   • Admin policies on profiles so admins can list users and change roles.
-- ============================================================================

-- 1. Admin check. SECURITY DEFINER runs as the function owner and bypasses RLS
--    on profiles, so using it inside a profiles policy does NOT recurse.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 2. Admin access to profiles (user management). Self-read already exists from
--    schema.sql; these add admin-wide read and the ability to change roles.
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select to authenticated
  using (public.is_admin());

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 3. Questionnaire content tables -------------------------------------------
create table if not exists public.dimensions (
  code       text primary key,            -- e.g. 'D1'
  name       text not null,
  weight     numeric not null default 0,  -- relative weight (need not sum to 1)
  color      text,
  proxy      boolean not null default false,
  sort_order int not null default 0
);

create table if not exists public.indicators (
  id         text primary key,            -- e.g. 'D1.1-01'
  dim        text not null references public.dimensions (code) on delete cascade,
  sub        text not null,               -- e.g. '1.1'
  sub_name   text,
  bct        boolean not null default false,
  q          text not null,               -- the question
  hint       text,
  rubric     jsonb not null default '[]'::jsonb,  -- array of 5 level descriptions
  sort_order int not null default 0
);

create index if not exists indicators_dim_idx on public.indicators (dim);

-- 4. RLS: read = any authenticated user, write = admins only -----------------
alter table public.dimensions enable row level security;
alter table public.indicators enable row level security;

drop policy if exists "dimensions_read" on public.dimensions;
create policy "dimensions_read"
  on public.dimensions for select to authenticated using (true);

drop policy if exists "dimensions_admin_write" on public.dimensions;
create policy "dimensions_admin_write"
  on public.dimensions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "indicators_read" on public.indicators;
create policy "indicators_read"
  on public.indicators for select to authenticated using (true);

drop policy if exists "indicators_admin_write" on public.indicators;
create policy "indicators_admin_write"
  on public.indicators for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- After running this:
--   • The tables start EMPTY. The app keeps working on its built-in defaults.
--   • Sign in as an admin → Admin → Questionnaire → "Load defaults into
--     database" to seed these tables, then edit questions / rubrics / weights.
-- ============================================================================
