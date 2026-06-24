-- ============================================================================
-- DataPilot — Phase 3c: per-user account preferences
-- Run AFTER phase3b.sql, once, in the Supabase SQL editor.
--
-- Adds a UI language preference to each profile. Self-service edits to a user's
-- own name/language go through the /api/update-self endpoint (service_role), so
-- the profiles table stays NOT client-writable (no risk of role self-escalation).
-- ============================================================================

alter table public.profiles
  add column if not exists language text not null default 'en'
  check (language in ('en', 'fr'));

-- (full_name already exists from schema.sql; no change needed for the display
--  name. Email stays read-only on the profile page — changing the login email
--  is treated as re-provisioning and handled by an admin.)
