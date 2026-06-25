-- ============================================================================
-- DataPilot — ONE-SHOT SETUP + TEST USERS
-- Run this whole file ONCE in the DataPilot Supabase SQL editor.
-- It applies phase3 → phase3b → phase3c → phase3d → phase3e → phase3f → phase3g
-- (in order), then seeds 3 test accounts (superadmin / admin / analyst).
-- Safe to re-run: every step is idempotent and the seed skips existing users.
--
-- Test logins (password is the same for all three):  Test1234!
--   super@datapilot.test     → superadmin
--   admin@datapilot.test     → admin
--   analyst@datapilot.test   → analyst
-- ============================================================================


-- ##########################################################################
-- ## STEP 1 / 6 — phase3.sql
-- ##########################################################################
-- ============================================================================
-- DataPilot — Phase 3 schema (super-admin role + centralized submissions)
-- Run this AFTER phase2.sql (and phase2c.sql), once, in the Supabase SQL editor.
--
-- Adds:
--   • A third role 'superadmin' on top of the existing admin/analyst tiers.
--   • is_admin() redefined to mean "admin OR superadmin", so every existing
--     admin gate (questionnaire editing, user listing) automatically includes
--     super-admins — no other policy needs to change.
--   • is_superadmin() helper for the few super-admin-only checks.
--   • The browser-side role-UPDATE policy is REMOVED: role changes now flow
--     exclusively through the privileged /api/set-role endpoint (service_role),
--     which enforces the hierarchy. This stops a regular admin from editing the
--     profiles table directly to escalate themselves to super-admin.
--   • A `submissions` table holding each analyst's completed assessment so that
--     admins / super-admins can review and export them centrally.
-- ============================================================================

-- 1. Allow the new role value. Drop the old CHECK and add the wider one.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('superadmin', 'admin', 'analyst'));

-- 2. Role helpers. SECURITY DEFINER runs as the owner and bypasses RLS on
--    profiles, so calling them inside a profiles policy does NOT recurse.
--    is_admin() now treats super-admins as admins (capability inheritance).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'superadmin')
  );
$$;

create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'superadmin'
  );
$$;

-- 3. Lock down role writes. The Phase 2 "admins can update any profile" policy
--    let any admin change any role straight from the browser (anon key), which
--    would allow self-escalation to super-admin. Remove it; all role changes go
--    through /api/set-role, which holds the service_role key and enforces the
--    hierarchy. Read policies (own + admin-wide) from earlier phases stay.
drop policy if exists "profiles_update_admin" on public.profiles;

-- 4. Submissions — one row per completed assessment an analyst sends in.
create table if not exists public.submissions (
  id               uuid primary key default gen_random_uuid(),
  analyst_id       uuid not null references auth.users (id) on delete cascade,
  analyst_email    text,
  bank_name        text,
  respondent_name  text,
  respondent_role  text,
  assessment_date  date,
  global_score     numeric,
  maturity_level   int,
  bct_rate         int,
  target_level     int,
  dimension_scores jsonb not null default '{}'::jsonb,  -- { D1: 3.2, ... }
  answers          jsonb not null default '{}'::jsonb,  -- full answers map snapshot
  profile          jsonb not null default '{}'::jsonb,  -- bank profile snapshot
  created_at       timestamptz not null default now()
);

create index if not exists submissions_analyst_idx on public.submissions (analyst_id);
create index if not exists submissions_created_idx on public.submissions (created_at desc);

-- 5. RLS on submissions ------------------------------------------------------
alter table public.submissions enable row level security;

-- Analysts can create submissions, but only ones attributed to themselves.
drop policy if exists "submissions_insert_own" on public.submissions;
create policy "submissions_insert_own"
  on public.submissions for insert to authenticated
  with check (auth.uid() = analyst_id);

-- Each user can read their own submissions; admins / super-admins read all.
drop policy if exists "submissions_select_own" on public.submissions;
create policy "submissions_select_own"
  on public.submissions for select to authenticated
  using (auth.uid() = analyst_id);

drop policy if exists "submissions_select_admin" on public.submissions;
create policy "submissions_select_admin"
  on public.submissions for select to authenticated
  using (public.is_admin());

-- Analysts may delete their own drafts; admins may delete any submission.
drop policy if exists "submissions_delete_own" on public.submissions;
create policy "submissions_delete_own"
  on public.submissions for delete to authenticated
  using (auth.uid() = analyst_id or public.is_admin());

-- ============================================================================
-- After running this:
--   • Promote your first super-admin (replace the email):
--       update public.profiles set role = 'superadmin'
--       where id = (select id from auth.users where email = 'you@ey.com');
--   • Sign out / in. Super-admins see the Admin area, can manage admins, and
--     review every submission. Regular admins manage analysts and review
--     submissions but cannot create or modify super-admins.
--   • /api/set-role needs SUPABASE_SERVICE_ROLE_KEY (same key already used by
--     /api/invite) — no new secret required.
-- ============================================================================


-- ##########################################################################
-- ## STEP 2 / 6 — phase3b.sql
-- ##########################################################################
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


-- ##########################################################################
-- ## STEP 3 / 6 — phase3c.sql
-- ##########################################################################
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


-- ##########################################################################
-- ## STEP 4 / 6 — phase3d.sql
-- ##########################################################################
-- ============================================================================
-- DataPilot — Phase 3d: profile photo / avatar
-- Run AFTER phase3c.sql, once, in the Supabase SQL editor.
--
-- Adds an avatar_url to profiles and an `avatars` Storage bucket. Each user can
-- upload/replace/delete only files under their own folder (named by their uid);
-- the bucket is public-read so the image renders without signed URLs. The
-- avatar_url itself is saved on the profile through /api/update-self (whitelist).
-- ============================================================================

-- 1. Column holding the public URL of the user's avatar (nullable = no photo).
alter table public.profiles add column if not exists avatar_url text;

-- 2. Public bucket for avatars.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 3. Storage policies on storage.objects (RLS is already enabled by Supabase).
--    Read is public; writes are restricted to the owner's own folder, i.e. the
--    first path segment must equal the caller's uid (paths look like "<uid>/avatar").
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
  on storage.objects for insert to authenticated
  with check ( bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text );

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
  on storage.objects for update to authenticated
  using ( bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text );

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
  on storage.objects for delete to authenticated
  using ( bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text );

-- ============================================================================
-- After running this: users get a "Change photo" control on their account page.
-- ============================================================================


-- ##########################################################################
-- ## STEP 5 / 6 — phase3e.sql
-- ##########################################################################
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


-- ##########################################################################
-- ## STEP 6 / 7 — phase3f.sql (EY 'owner' tier above bank super-admins)
-- ##########################################################################
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('owner', 'superadmin', 'admin', 'analyst'));

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles
  where id = auth.uid() and role in ('admin', 'superadmin', 'owner')); $$;

create or replace function public.is_superadmin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles
  where id = auth.uid() and role in ('superadmin', 'owner')); $$;

create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles
  where id = auth.uid() and role = 'owner'); $$;

notify pgrst, 'reload schema';


-- ##########################################################################
-- ## STEP 7 / 8 — phase3g.sql (strict per-bank isolation + invite lineage)
-- ##########################################################################
alter table public.profiles
  add column if not exists invited_by uuid references auth.users (id) on delete set null;

create or replace function public.my_bank()
returns text language sql stable security definer set search_path = public
as $$ select bank_name from public.profiles where id = auth.uid(); $$;

create or replace function public.bank_of(uid uuid)
returns text language sql stable security definer set search_path = public
as $$ select bank_name from public.profiles where id = uid; $$;

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles for select to authenticated
  using ( public.is_owner() or (public.is_admin() and bank_name = public.my_bank()) );

drop policy if exists "submissions_select_admin" on public.submissions;
create policy "submissions_select_admin" on public.submissions for select to authenticated
  using ( public.is_owner() or (public.is_admin() and public.bank_of(analyst_id) = public.my_bank()) );

drop policy if exists "submissions_delete_own" on public.submissions;
create policy "submissions_delete_own" on public.submissions for delete to authenticated
  using ( auth.uid() = analyst_id or public.is_owner()
          or (public.is_admin() and public.bank_of(analyst_id) = public.my_bank()) );

drop policy if exists "dimensions_admin_write" on public.dimensions;
create policy "dimensions_admin_write" on public.dimensions for all to authenticated
  using ( public.is_owner() ) with check ( public.is_owner() );

drop policy if exists "indicators_admin_write" on public.indicators;
create policy "indicators_admin_write" on public.indicators for all to authenticated
  using ( public.is_owner() ) with check ( public.is_owner() );

notify pgrst, 'reload schema';


-- ##########################################################################
-- ## STEP 8 / 8 — seed 3 test accounts (superadmin / admin / analyst)
-- ##########################################################################
-- Creates auto-confirmed auth users + identities, then sets role + bank on the
-- profile rows the handle_new_user trigger creates. Re-running skips existing
-- users. Password for all three: Test1234!
do $$
declare
  u uuid;
  rec record;
  accts constant jsonb := '[
    {"email":"super@datapilot.test",  "role":"superadmin","name":"Test SuperAdmin","title":"Super Admin"},
    {"email":"admin@datapilot.test",  "role":"admin",     "name":"Test Admin",     "title":"Admin"},
    {"email":"analyst@datapilot.test","role":"analyst",   "name":"Test Analyst",   "title":"Analyst"}
  ]'::jsonb;
begin
  for rec in select value as v from jsonb_array_elements(accts) loop
    if exists (select 1 from auth.users where email = rec.v ->> 'email') then
      continue;  -- already created on a previous run
    end if;

    u := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      -- GoTrue reads these token columns as text and 500s on NULL during
      -- login, so seed them as '' (empty string) rather than leaving NULL.
      confirmation_token, recovery_token, email_change,
      email_change_token_new, email_change_token_current,
      phone_change, phone_change_token, reauthentication_token
    ) values (
      '00000000-0000-0000-0000-000000000000', u, 'authenticated', 'authenticated',
      rec.v ->> 'email', crypt('Test1234!', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', rec.v ->> 'name'),
      '', '', '', '', '', '', '', ''
    );

    insert into auth.identities (
      id, provider_id, user_id, identity_data, provider,
      created_at, updated_at, last_sign_in_at
    ) values (
      gen_random_uuid(), u::text, u,
      jsonb_build_object('sub', u::text, 'email', rec.v ->> 'email', 'email_verified', true),
      'email', now(), now(), now()
    );
  end loop;

  -- Heal any rows seeded before this fix: NULL token columns make GoTrue 500
  -- on login. Coalesce them to '' for the test accounts.
  update auth.users
     set confirmation_token         = coalesce(confirmation_token, ''),
         recovery_token             = coalesce(recovery_token, ''),
         email_change               = coalesce(email_change, ''),
         email_change_token_new     = coalesce(email_change_token_new, ''),
         email_change_token_current = coalesce(email_change_token_current, ''),
         phone_change               = coalesce(phone_change, ''),
         phone_change_token         = coalesce(phone_change_token, ''),
         reauthentication_token     = coalesce(reauthentication_token, '')
   where email like '%@datapilot.test';

  -- Set role + bank + names on the profiles the trigger just created.
  update public.profiles p
     set role      = a.v ->> 'role',
         bank_name = 'Banque Test',
         full_name = a.v ->> 'name',
         title     = a.v ->> 'title'
    from (select value as v from jsonb_array_elements(accts)) a
   where p.email = a.v ->> 'email';
end $$;

-- Show what we created.
select email, role, bank_name, title
  from public.profiles
 where email like '%@datapilot.test'
 order by role;
