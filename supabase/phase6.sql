-- ============================================================================
-- DataPilot — Phase 6: audit fixes (answer-dimension integrity + hardening)
-- Run AFTER phase5.sql, once, in the Supabase SQL editor. Idempotent.
--
-- Fixes found in the security/logic audit:
--   • CRITICAL: assessment_answers.dim_code was trusted from the client, so an
--     analyst could write an answer for an indicator outside their assigned
--     dimension by sending a different dim_code. We now (a) derive dim_code from
--     the indicators table in a BEFORE trigger (client value ignored) and
--     (b) gate the RLS write on the indicator's TRUE dimension, independent of
--     trigger ordering. Cross-department spoofing is no longer possible.
--   • One open draft assessment per bank (prevents duplicate/stranded drafts).
--   • Re-assert the widest role CHECK so re-running earlier phases can't narrow
--     it and reject existing owner/superadmin rows.
-- ============================================================================

-- 0. True dimension of an indicator for a bank (its own copy, else the EY
--    master template ''). SECURITY DEFINER so it can be used inside policies.
create or replace function public.indicator_dim(p_bank text, p_id text)
returns text language sql stable security definer set search_path = public
as $$
  select coalesce(
    (select dim from public.indicators where bank_name = p_bank and id = p_id),
    (select dim from public.indicators where bank_name = ''     and id = p_id)
  );
$$;

-- 1. Force assessment_answers.dim_code to the indicator's real dimension on every
--    write, ignoring whatever the client sent, and reject unknown indicators.
create or replace function public.set_answer_dim()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  v_dim text;
begin
  v_dim := public.indicator_dim(public.assessment_bank(NEW.assessment_id), NEW.indicator_id);
  if v_dim is null then
    raise exception 'Unknown indicator "%" for this assessment.', NEW.indicator_id;
  end if;
  NEW.dim_code := v_dim;   -- authoritative; client value is overwritten
  return NEW;
end;
$$;

drop trigger if exists trg_set_answer_dim on public.assessment_answers;
create trigger trg_set_answer_dim
  before insert or update on public.assessment_answers
  for each row execute function public.set_answer_dim();

-- 2. Rewrite the answer write policies to authorize on the indicator's TRUE
--    dimension (via indicator_dim), not the client-supplied dim_code. This holds
--    regardless of BEFORE-trigger vs RLS ordering.
drop policy if exists "answers_insert" on public.assessment_answers;
create policy "answers_insert" on public.assessment_answers for insert to authenticated
  with check (
    public.is_owner()
    or ( public.is_analyst()
         and public.assessment_bank(assessment_id) = public.my_bank()
         and exists ( select 1 from public.assessment_assignments aa
                      where aa.assessment_id = assessment_answers.assessment_id
                        and aa.dim_code = public.indicator_dim(public.assessment_bank(assessment_id), assessment_answers.indicator_id)
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
                        and aa.dim_code = public.indicator_dim(public.assessment_bank(assessment_id), assessment_answers.indicator_id)
                        and aa.department_id = public.my_department() ) )
  )
  with check (
    public.is_owner()
    or ( public.is_analyst()
         and public.assessment_bank(assessment_id) = public.my_bank()
         and exists ( select 1 from public.assessment_assignments aa
                      where aa.assessment_id = assessment_answers.assessment_id
                        and aa.dim_code = public.indicator_dim(public.assessment_bank(assessment_id), assessment_answers.indicator_id)
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
                        and aa.dim_code = public.indicator_dim(public.assessment_bank(assessment_id), assessment_answers.indicator_id)
                        and aa.department_id = public.my_department() ) )
  );

-- 3. At most one OPEN DRAFT assessment per bank (stops duplicate/stranded drafts
--    when "create" is clicked twice or by two coordinators). First close out any
--    pre-existing duplicate drafts (keep the newest per bank) so the unique index
--    below can actually be created.
delete from public.assessments a
 using (
   select id, row_number() over (partition by bank_name order by created_at desc) as rn
     from public.assessments where status = 'draft'
 ) d
 where a.id = d.id and d.rn > 1;

create unique index if not exists assessments_one_open_draft
  on public.assessments (bank_name) where status = 'draft';

-- 4. Re-assert the widest role set so an out-of-order re-run of phase3/phase3f
--    can't narrow the constraint and reject existing owner/superadmin rows.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('owner', 'superadmin', 'admin', 'analyst'));

notify pgrst, 'reload schema';
