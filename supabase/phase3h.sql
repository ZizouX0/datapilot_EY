-- ============================================================================
-- DataPilot — Phase 3h: per-bank questionnaire
-- Run AFTER phase3g.sql, once, in the Supabase SQL editor.
--
-- Each bank gets its OWN copy of the questionnaire so a bank Admin can tailor it
-- without affecting other banks. EY maintains a single master TEMPLATE; a bank's
-- copy is seeded from that master and edited independently.
--
--   • bank_name = ''  → the EY master template (edited by EY/owner only).
--   • bank_name = 'BIAT' (etc.) → that bank's own copy (edited by its Admins).
--   • Super Admins read their bank's copy but cannot edit it.
--
-- The primary key becomes (bank_name, code/id) so the same codes can coexist
-- across banks. NULL is not allowed in a primary key, so the master uses '' .
-- ============================================================================

-- 1. Tenant column on both content tables ('' = EY master template).
alter table public.dimensions add column if not exists bank_name text not null default '';
alter table public.indicators add column if not exists bank_name text not null default '';

-- 2. Rebuild the keys to be per-bank. Drop the FK first, then the PKs, then add
--    the composite versions back.
alter table public.indicators drop constraint if exists indicators_dim_fkey;
alter table public.dimensions drop constraint if exists dimensions_pkey;
alter table public.indicators drop constraint if exists indicators_pkey;

alter table public.dimensions add constraint dimensions_pkey primary key (bank_name, code);
alter table public.indicators add constraint indicators_pkey primary key (bank_name, id);
alter table public.indicators
  add constraint indicators_dim_fkey
  foreign key (bank_name, dim) references public.dimensions (bank_name, code) on delete cascade;

-- 3. Helper: a "bank admin" is exactly role='admin' (NOT super-admin or owner),
--    i.e. the tier that may edit its own bank's questionnaire.
create or replace function public.is_bank_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'); $$;

-- 4. RLS.
--    READ: the EY master ('') is readable by all (it's the template to seed
--    from); otherwise you only see your own bank's copy; owner sees everything.
--    WRITE: owner edits anything (incl. the master); a bank Admin edits only
--    their own bank's rows; Super Admins get no write (read-only).
drop policy if exists "dimensions_read" on public.dimensions;
create policy "dimensions_read" on public.dimensions for select to authenticated
  using ( bank_name = '' or public.is_owner() or bank_name = public.my_bank() );

drop policy if exists "dimensions_admin_write" on public.dimensions;
create policy "dimensions_admin_write" on public.dimensions for all to authenticated
  using ( public.is_owner() or (public.is_bank_admin() and bank_name = public.my_bank()) )
  with check ( public.is_owner() or (public.is_bank_admin() and bank_name = public.my_bank()) );

drop policy if exists "indicators_read" on public.indicators;
create policy "indicators_read" on public.indicators for select to authenticated
  using ( bank_name = '' or public.is_owner() or bank_name = public.my_bank() );

drop policy if exists "indicators_admin_write" on public.indicators;
create policy "indicators_admin_write" on public.indicators for all to authenticated
  using ( public.is_owner() or (public.is_bank_admin() and bank_name = public.my_bank()) )
  with check ( public.is_owner() or (public.is_bank_admin() and bank_name = public.my_bank()) );

notify pgrst, 'reload schema';

-- ============================================================================
-- After running this:
--   • EY (owner) → Admin → Questionnaire → "Load defaults into master" once.
--   • Each bank's Admin → Questionnaire → "Create your bank's copy from the EY
--     master", then tailor it. Their analysts' assessment uses that copy; if a
--     bank has no copy yet, the app falls back to the master, then to the
--     app's built-in defaults — so the assessment always works.
-- ============================================================================
