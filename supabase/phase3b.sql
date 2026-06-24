-- ============================================================================
-- DataPilot — Phase 3b: post-centric accounts (functional emails)
-- Run AFTER phase3.sql, once, in the Supabase SQL editor.
--
-- Rationale: the product is sold to banks, so privileged accounts should be
-- tied to a POSITION (a functional mailbox like datapilot-admin@bank.tn), not
-- to a person. When the holder leaves, the bank keeps the mailbox, resets the
-- password, and hands the same account — role and history intact — to their
-- successor. These columns let the UI describe an account by its post and let a
-- super-admin disable a leaver's personal account during off-boarding.
-- ============================================================================

-- 1. Position / title shown for the account (e.g. "Data Governance Lead").
--    Identifies the POST; the human behind the functional mailbox can change.
alter table public.profiles add column if not exists title text;

-- 2. Off-boarding flag mirrored from the auth ban state so the Users table can
--    show Active / Disabled. The actual sign-in block is enforced in auth (the
--    /api/manage-user endpoint bans the auth user); this column is for display.
alter table public.profiles add column if not exists disabled boolean not null default false;

-- 3. Carry the title (and full_name) from invite metadata into the profile when
--    the auth user is first created. inviteUserByEmail passes these in `data`.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, title)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'title'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- (Trigger on_auth_user_created from schema.sql already calls this function.)

-- ============================================================================
-- Convention (no code, but the important part):
--   • Provision each bank's Super Admin on a FUNCTIONAL mailbox the bank owns,
--     e.g. datapilot-admin@bankX.tn — never a personal address.
--   • Day-to-day analysts may keep personal accounts for accountability; a
--     super-admin disables them on departure and reassigns the work.
--   • Hand-over = super-admin sends a password reset to the functional mailbox;
--     the successor sets a new password and inherits the same account.
-- ============================================================================
