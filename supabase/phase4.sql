-- ============================================================================
-- DataPilot — Phase 4: departments + shared multi-department assessment (Model B)
-- Run AFTER phase3h.sql, once, in the Supabase SQL editor. Idempotent & re-runnable.
--
-- Model B in one line:
--   ONE shared assessment per bank. A coordinator (owner / super-admin / admin)
--   assigns each DIMENSION to a DEPARTMENT. Members of that department fill the
--   indicators of their assigned dimension(s) on the shared draft. The
--   coordinator reviews everything and FINALIZES it into a `submissions` row
--   (the existing review/export pipeline is left untouched).
--
-- Adds:
--   • departments              — named departments, scoped per bank
--   • profiles.department_id    — which department a user belongs to
--   • assessments              — the shared draft/finalized assessment per bank
--   • assessment_assignments   — dimension -> department mapping, per assessment
--   • assessment_answers       — the shared, server-side answers (score/evidence)
--   • helpers + RLS that scope every table by bank. Answer WRITES are limited
--     to an ANALYST whose department is assigned that dimension — coordinators
--     (admin / superadmin) never enter scores; only the EY owner may override.
--
-- Reuses existing helpers from earlier phases: my_bank(), bank_of(), is_owner(),
-- is_admin() (= admin/superadmin/owner), is_superadmin(), is_bank_admin().
-- ============================================================================

-- 0. Helper: the caller's own department -------------------------------------
--    SECURITY DEFINER so it can be called inside a policy without recursing on
--    the profiles RLS (same pattern as my_bank()).
create or replace function public.my_department()
returns uuid language sql stable security definer set search_path = public
as $$ select department_id from public.profiles where id = auth.uid(); $$;

-- Only analysts enter scores. Coordinators (admin / superadmin) configure,
-- monitor and finalize but never fill; the EY owner can override separately.
create or replace function public.is_analyst()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (
  select 1 from public.profiles where id = auth.uid() and role = 'analyst'
); $$;

-- 1. departments -------------------------------------------------------------
create table if not exists public.departments (
  id         uuid primary key default gen_random_uuid(),
  bank_name  text not null,
  name       text not null,
  created_at timestamptz not null default now(),
  unique (bank_name, name)
);

alter table public.departments enable row level security;

-- Read: everyone in the bank (and owners) can see the bank's departments.
drop policy if exists "departments_read" on public.departments;
create policy "departments_read" on public.departments for select to authenticated
  using ( public.is_owner() or bank_name = public.my_bank() );

-- Write: owners, or a bank admin/super-admin acting on their OWN bank.
drop policy if exists "departments_write" on public.departments;
create policy "departments_write" on public.departments for all to authenticated
  using ( public.is_owner() or (public.is_admin() and bank_name = public.my_bank()) )
  with check ( public.is_owner() or (public.is_admin() and bank_name = public.my_bank()) );

-- 2. profiles.department_id --------------------------------------------------
--    Nullable: a user may have no department yet. ON DELETE SET NULL so removing
--    a department doesn't delete its members — they just become unassigned.
--    (Writes to profiles still flow through the privileged /api endpoints; this
--    column is assigned there, never from the browser anon key.)
alter table public.profiles
  add column if not exists department_id uuid references public.departments (id) on delete set null;

-- 3. assessments — one shared draft (then finalized) per bank -----------------
create table if not exists public.assessments (
  id            uuid primary key default gen_random_uuid(),
  bank_name     text not null,
  title         text,
  status        text not null default 'draft' check (status in ('draft', 'finalized')),
  target_level  int  not null default 3,
  created_by    uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now(),
  finalized_at  timestamptz,
  submission_id uuid references public.submissions (id) on delete set null
);
create index if not exists assessments_bank_idx on public.assessments (bank_name);

-- 4. assessment_assignments — which department owns which dimension ----------
create table if not exists public.assessment_assignments (
  assessment_id uuid not null references public.assessments (id) on delete cascade,
  dim_code      text not null,
  department_id uuid references public.departments (id) on delete set null,
  primary key (assessment_id, dim_code)
);

-- 5. assessment_answers — the shared, server-side answers --------------------
create table if not exists public.assessment_answers (
  assessment_id uuid not null references public.assessments (id) on delete cascade,
  indicator_id  text not null,
  dim_code      text not null,
  score         int,
  evidence      text,
  skipped       boolean not null default false,
  answered_by   uuid references auth.users (id) on delete set null,
  updated_at    timestamptz not null default now(),
  primary key (assessment_id, indicator_id)
);

-- 6. Helper: the bank that owns an assessment (for the policies below) -------
--    Defined AFTER assessments exists. SECURITY DEFINER bypasses RLS on
--    assessments so it can be used inside other tables' policies.
create or replace function public.assessment_bank(aid uuid)
returns text language sql stable security definer set search_path = public
as $$ select bank_name from public.assessments where id = aid; $$;

-- 7. RLS: assessments --------------------------------------------------------
alter table public.assessments enable row level security;

-- Read: any signed-in member of the bank (so contributors see the shared draft).
drop policy if exists "assessments_read" on public.assessments;
create policy "assessments_read" on public.assessments for select to authenticated
  using ( public.is_owner() or bank_name = public.my_bank() );

-- Write (create / configure / finalize): coordinators only — owners, or a bank
-- admin/super-admin on their own bank. Contributors never create assessments.
drop policy if exists "assessments_write" on public.assessments;
create policy "assessments_write" on public.assessments for all to authenticated
  using ( public.is_owner() or (public.is_admin() and bank_name = public.my_bank()) )
  with check ( public.is_owner() or (public.is_admin() and bank_name = public.my_bank()) );

-- 8. RLS: assessment_assignments --------------------------------------------
alter table public.assessment_assignments enable row level security;

-- Read: every member of the assessment's bank (contributors need to know which
-- dimensions belong to their department).
drop policy if exists "assignments_read" on public.assessment_assignments;
create policy "assignments_read" on public.assessment_assignments for select to authenticated
  using ( public.is_owner() or public.assessment_bank(assessment_id) = public.my_bank() );

-- Write: coordinators of the assessment's bank only.
drop policy if exists "assignments_write" on public.assessment_assignments;
create policy "assignments_write" on public.assessment_assignments for all to authenticated
  using ( public.is_owner()
          or (public.is_admin() and public.assessment_bank(assessment_id) = public.my_bank()) )
  with check ( public.is_owner()
          or (public.is_admin() and public.assessment_bank(assessment_id) = public.my_bank()) );

-- 9. RLS: assessment_answers — the crux -------------------------------------
alter table public.assessment_answers enable row level security;

-- Read: any member of the assessment's bank sees the WHOLE shared draft (not
-- just their own dimension) so progress and scores are visible to everyone.
drop policy if exists "answers_read" on public.assessment_answers;
create policy "answers_read" on public.assessment_answers for select to authenticated
  using ( public.is_owner() or public.assessment_bank(assessment_id) = public.my_bank() );

-- Write is split into insert/update/delete so each carries the right check.
-- Only an ANALYST may enter scores, and only for a dimension assigned to their
-- department, within the assessment's bank. Coordinators (admin / superadmin)
-- do NOT fill — they configure, monitor and finalize. The EY owner may override.
drop policy if exists "answers_insert" on public.assessment_answers;
create policy "answers_insert" on public.assessment_answers for insert to authenticated
  with check (
    public.is_owner()
    or ( public.is_analyst()
         and public.assessment_bank(assessment_id) = public.my_bank()
         and exists ( select 1 from public.assessment_assignments aa
                      where aa.assessment_id = assessment_answers.assessment_id
                        and aa.dim_code = assessment_answers.dim_code
                        and aa.department_id = public.my_department() ) )
  );

drop policy if exists "answers_update" on public.assessment_answers;
create policy "answers_update" on public.assessment_answers for update to authenticated
  using (
    public.is_owner()
    or ( public.is_analyst()
         and public.assessment_bank(assessment_id) = public.my_bank()
         and exists ( select 1 from public.assessment_assignments aa
                      where aa.assessment_id = assessment_answers.assessment_id
                        and aa.dim_code = assessment_answers.dim_code
                        and aa.department_id = public.my_department() ) )
  )
  with check (
    public.is_owner()
    or ( public.is_analyst()
         and public.assessment_bank(assessment_id) = public.my_bank()
         and exists ( select 1 from public.assessment_assignments aa
                      where aa.assessment_id = assessment_answers.assessment_id
                        and aa.dim_code = assessment_answers.dim_code
                        and aa.department_id = public.my_department() ) )
  );

drop policy if exists "answers_delete" on public.assessment_answers;
create policy "answers_delete" on public.assessment_answers for delete to authenticated
  using (
    public.is_owner()
    or ( public.is_analyst()
         and public.assessment_bank(assessment_id) = public.my_bank()
         and exists ( select 1 from public.assessment_assignments aa
                      where aa.assessment_id = assessment_answers.assessment_id
                        and aa.dim_code = assessment_answers.dim_code
                        and aa.department_id = public.my_department() ) )
  );

-- Make the new tables/columns visible to PostgREST immediately.
notify pgrst, 'reload schema';

-- ============================================================================
-- After running this (smoke test in the SQL editor):
--   • Create a couple of departments for your bank:
--       insert into public.departments (bank_name, name) values
--         ('Banque Test', 'IT'), ('Banque Test', 'Risk & Compliance');
--   • Confirm the new tables exist and RLS is on:
--       select table_name from information_schema.tables
--       where table_schema='public'
--         and table_name in ('departments','assessments',
--           'assessment_assignments','assessment_answers');
--   • The frontend (Stages 2–3) will create the draft assessment, let a
--     coordinator map dimensions to departments, and gate each contributor to
--     their assigned dimensions. Nothing here changes the existing single-user
--     assessment or `submissions` flow — Model B runs alongside it until wired up.
-- ============================================================================
