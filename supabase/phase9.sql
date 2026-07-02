-- ============================================================================
-- DataPilot — Phase 9: lock answers to draft assessments (post-finalize tamper)
-- Run AFTER phase8.sql, once, in the Supabase SQL editor. Idempotent.
--
-- Audit finding (HIGH): the assessment_answers write policies (phase6) check
-- only role + bank + department assignment — never the assessment's status. So a
-- contributor could keep inserting/updating/deleting answers on a *finalized*
-- assessment via a direct PostgREST call (or a stale tab racing Finalize),
-- silently diverging the stored answers from the submission the coordinator
-- already recomputed and issued. The only draft check lived client-side.
--
-- Fix: gate every analyst answer write on the assessment still being a draft, in
-- the database. The EY owner keeps full access (matching the owner bypass used
-- throughout). Finalize flips status to 'finalized', which now makes the rows
-- read-only for contributors at the RLS layer.
-- ============================================================================

-- Draft-status check for an assessment. SECURITY DEFINER + stable so it can be
-- used inside RLS policies without recursing through assessments' own RLS.
create or replace function public.assessment_is_draft(p_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select coalesce(
    (select status = 'draft' from public.assessments where id = p_id),
    false
  );
$$;

-- Rewrite the three answer-write policies to add the draft guard to the analyst
-- branch. Identical to phase6 except for the extra assessment_is_draft() clause.
drop policy if exists "answers_insert" on public.assessment_answers;
create policy "answers_insert" on public.assessment_answers for insert to authenticated
  with check (
    public.is_owner()
    or ( public.is_analyst()
         and public.assessment_is_draft(assessment_id)
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
         and public.assessment_is_draft(assessment_id)
         and public.assessment_bank(assessment_id) = public.my_bank()
         and exists ( select 1 from public.assessment_assignments aa
                      where aa.assessment_id = assessment_answers.assessment_id
                        and aa.dim_code = public.indicator_dim(public.assessment_bank(assessment_id), assessment_answers.indicator_id)
                        and aa.department_id = public.my_department() ) )
  )
  with check (
    public.is_owner()
    or ( public.is_analyst()
         and public.assessment_is_draft(assessment_id)
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
         and public.assessment_is_draft(assessment_id)
         and public.assessment_bank(assessment_id) = public.my_bank()
         and exists ( select 1 from public.assessment_assignments aa
                      where aa.assessment_id = assessment_answers.assessment_id
                        and aa.dim_code = public.indicator_dim(public.assessment_bank(assessment_id), assessment_answers.indicator_id)
                        and aa.department_id = public.my_department() ) )
  );
