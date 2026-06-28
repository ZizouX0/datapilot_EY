-- ============================================================================
-- DataPilot — Phase 5: department inheritance down the invite chain
-- Run AFTER phase4.sql, once, in the Supabase SQL editor. Idempotent.
--
-- Lets a department cascade with invitations, the same way bank_name already
-- does: when a Super Admin invites an Admin they pick the admin's department,
-- and when that Admin invites Analysts the analysts inherit the admin's
-- department automatically. The /api/invite endpoint passes the department id as
-- invite metadata; this trigger copies it onto the new profile.
-- ============================================================================

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
  on conflict (id) do nothing;
  return new;
end;
$$;

-- (Trigger on_auth_user_created already calls handle_new_user — see phase3e.)
notify pgrst, 'reload schema';
