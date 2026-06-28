-- ============================================================================
-- DataPilot — Phase 8: defensive value constraints (from the detail audit)
-- Run AFTER phase7.sql, once, in the Supabase SQL editor. Idempotent.
--
-- Backstops the client validation at the database level so out-of-range values
-- can't be stored even via a crafted/direct call:
--   • assessment_answers.score  ∈ {1..5} (or NULL = skipped/unanswered)
--   • assessments.target_level  ∈ {1..5}
--   • dimensions.weight         ≥ 0
-- ============================================================================

alter table public.assessment_answers
  drop constraint if exists assessment_answers_score_chk;
alter table public.assessment_answers
  add constraint assessment_answers_score_chk
  check (score is null or (score between 1 and 5));

alter table public.assessments
  drop constraint if exists assessments_target_level_chk;
alter table public.assessments
  add constraint assessments_target_level_chk
  check (target_level between 1 and 5);

alter table public.dimensions
  drop constraint if exists dimensions_weight_chk;
alter table public.dimensions
  add constraint dimensions_weight_chk
  check (weight >= 0);

notify pgrst, 'reload schema';
