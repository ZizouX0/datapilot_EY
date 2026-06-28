-- ============================================================================
-- DataPilot — Phase 7: hardening fixes from the multi-agent audit
-- Run AFTER phase6.sql, once, in the Supabase SQL editor. Idempotent.
--
--   • CRITICAL: restore "on conflict (id) do nothing" in handle_new_user — phase3e
--     and phase5 dropped it, so any pre-existing profile row makes the trigger
--     throw and the whole auth-user INSERT (invite / seed) fails.
--   • submissions INSERT: stop trusting client bank_name (forgeable). A row must
--     be attributed to the caller's own bank (owner exempt).
--   • avatars UPDATE storage policy: add the missing WITH CHECK so a user can't
--     move their object into someone else's folder.
--   • assessment_assignments.department_id: ON DELETE CASCADE (delete the mapping
--     row) instead of SET NULL (which left a NULL row that nobody could fill).
--   • assessment_answers.answered_by is forced to auth.uid() server-side.
-- ============================================================================

-- 1. handle_new_user — definitive version (idempotent insert + department_id).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, title, bank_name, phone, department_id)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'title',
    new.raw_user_meta_data ->> 'bank_name',
    new.raw_user_meta_data ->> 'phone',
    nullif(new.raw_user_meta_data ->> 'department_id', '')::uuid
  )
  on conflict (id) do nothing;   -- never break the auth INSERT on a pre-existing row
  return new;
end;
$$;

-- 2. submissions INSERT — attribute to the caller's own bank (no client forging).
drop policy if exists "submissions_insert_own" on public.submissions;
create policy "submissions_insert_own"
  on public.submissions for insert to authenticated
  with check (
    auth.uid() = analyst_id
    and ( public.is_owner()
          or coalesce(bank_name, '') = coalesce(public.my_bank(), '') )
  );

-- 3. avatars UPDATE — gate the NEW row's folder too, not just the targeted row.
drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
  on storage.objects for update to authenticated
  using ( bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text )
  with check ( bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text );

-- 4. Deleting a department removes its dimension assignments (clean "unassigned"),
--    instead of leaving a NULL-department row that no analyst can write.
alter table public.assessment_assignments
  drop constraint if exists assessment_assignments_department_id_fkey;
alter table public.assessment_assignments
  add constraint assessment_assignments_department_id_fkey
  foreign key (department_id) references public.departments (id) on delete cascade;

-- 5. Force answered_by to the real caller (was client-supplied). Extends the
--    phase6 set_answer_dim trigger so dim_code AND answered_by are authoritative.
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
  NEW.dim_code := v_dim;          -- authoritative dimension
  NEW.answered_by := auth.uid();  -- authoritative author
  return NEW;
end;
$$;

notify pgrst, 'reload schema';
