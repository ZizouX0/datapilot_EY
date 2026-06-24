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
