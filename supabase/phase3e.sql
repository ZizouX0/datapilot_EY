-- ============================================================================
-- DataPilot — Phase 3e: org bank (per-inviter inheritance) + phone
-- Run AFTER phase3d.sql, once, in the Supabase SQL editor.
--
-- • bank_name: every user belongs to one bank. A super-admin sets their own
--   bank; when they invite an admin, and that admin invites an analyst, the
--   invitee inherits the inviter's bank automatically (passed as invite
--   metadata and copied by the handle_new_user trigger below). Only a
--   super-admin can change a bank (enforced in /api/update-self); for everyone
--   else it is read-only.
-- • phone: optional recovery/contact number a user can manage on their account.
-- ============================================================================

alter table public.profiles add column if not exists bank_name text;
alter table public.profiles add column if not exists phone text;

-- Carry full_name, title, bank_name and phone from invite metadata into the new
-- profile. Extends the phase3b trigger (which already copied full_name + title).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, title, bank_name, phone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'title',
    new.raw_user_meta_data ->> 'bank_name',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Make the new columns visible to PostgREST immediately.
notify pgrst, 'reload schema';

-- ============================================================================
-- After running this: set the super-admin's bank once (My account → Bank, or
--   update public.profiles set bank_name = 'BIAT — Banque Internationale Arabe de Tunisie'
--   where id = '<super-admin-uuid>';).
-- New invites then inherit it down the tree automatically.
-- ============================================================================
