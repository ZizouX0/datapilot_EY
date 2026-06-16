-- ============================================================================
-- DataPilot — Phase 2c: per-dimension description
-- Run AFTER phase2.sql, once, in the Supabase SQL editor.
-- Adds a short explanatory phrase shown to users for each dimension.
-- ============================================================================

alter table public.dimensions
  add column if not exists description text;

-- If you've already seeded the defaults, you can backfill the descriptions in
-- one go (optional — you can also edit them in Admin → Questionnaire):
update public.dimensions set description = 'How data is steered — strategy, ownership, accountability and regulatory compliance.' where code = 'D1' and (description is null or description = '');
update public.dimensions set description = 'How accurate, complete, timely and traceable the bank''s data is.' where code = 'D2' and (description is null or description = '');
update public.dimensions set description = 'How data is centralised, integrated and made available through pipelines and controlled access.' where code = 'D3' and (description is null or description = '');
update public.dimensions set description = 'The maturity of analytics/BI tools and how far decisions are genuinely driven by data.' where code = 'D4' and (description is null or description = '');
update public.dimensions set description = 'The people side — data skills, talent and a data-driven culture (assessed via proxy signals).' where code = 'D5' and (description is null or description = '');
