-- ============================================================================
-- DataPilot — TEST SEED: one analyst per department (password: 12345)
-- Run in the Supabase SQL editor AFTER you've created your departments
-- (Admin → Departments → "Use standard Tunisian departments", or add your own).
--
-- For every department in your bank, this creates an analyst account already
-- assigned to that department, so you can sign in as each and test the group
-- (Model B) flow end to end. Idempotent: re-running skips accounts that exist
-- and just re-applies their role / bank / department.
--
-- Logins it creates:  analyst1@datapilot.test, analyst2@datapilot.test, …
-- Password for all:   12345
-- (Sign-in doesn't enforce a minimum length, so 12345 works to log in. If your
--  project rejects it, change '12345' below to a 6+ character password.)
-- ============================================================================
do $$
declare
  v_bank  text;
  d       record;
  u       uuid;
  i       int := 0;
  v_email text;
begin
  -- Seed into the bank of an existing Super Admin. Adjust the WHERE if you have
  -- more than one bank and want a specific one (e.g. and bank_name = 'BIAT').
  select bank_name into v_bank
    from public.profiles
   where role = 'superadmin' and bank_name is not null and bank_name <> ''
   order by created_at
   limit 1;

  if v_bank is null then
    raise exception 'No Super Admin with a bank found — set your bank first.';
  end if;

  for d in
    select id, name from public.departments where bank_name = v_bank order by name
  loop
    i := i + 1;
    v_email := 'analyst' || i || '@datapilot.test';

    -- Already exists → just (re)apply role / bank / department and continue.
    if exists (select 1 from auth.users where email = v_email) then
      update public.profiles p
         set role = 'analyst', bank_name = v_bank, department_id = d.id,
             full_name = 'Analyste — ' || d.name
       where p.email = v_email;
      continue;
    end if;

    u := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change,
      email_change_token_new, email_change_token_current,
      phone_change, phone_change_token, reauthentication_token
    ) values (
      '00000000-0000-0000-0000-000000000000', u, 'authenticated', 'authenticated',
      v_email, crypt('12345', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Analyste — ' || d.name),
      '', '', '', '', '', '', '', ''
    );

    insert into auth.identities (
      id, provider_id, user_id, identity_data, provider,
      created_at, updated_at, last_sign_in_at
    ) values (
      gen_random_uuid(), u::text, u,
      jsonb_build_object('sub', u::text, 'email', v_email, 'email_verified', true),
      'email', now(), now(), now()
    );

    -- The handle_new_user trigger created the profile row; set its role, bank
    -- and department (the analyst's department_id is what gates what they fill).
    update public.profiles p
       set role = 'analyst', bank_name = v_bank, department_id = d.id,
           full_name = 'Analyste — ' || d.name
     where p.id = u;
  end loop;

  raise notice 'Seeded % analyst(s) into bank "%".', i, v_bank;
end $$;

-- Show what was created (email · name · department).
select p.email, p.full_name, p.role, d.name as department
  from public.profiles p
  left join public.departments d on d.id = p.department_id
 where p.email like 'analyst%@datapilot.test'
 order by p.email;
