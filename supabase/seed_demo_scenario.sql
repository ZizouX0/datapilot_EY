-- ============================================================================
-- DataPilot — DEMO SCENARIO SEED (ready-to-test group assessment)
-- Run in the Supabase SQL editor AFTER phases 4–8. Idempotent & re-runnable.
--
-- Builds a complete, named demo for the signed-in Super Admin's bank:
--   • the 5 standard Tunisian departments (created if missing)
--   • 5 analyst accounts, each assigned to one department (password: 12345)
--   • one draft group assessment with every dimension already mapped to its
--     department (D1→Gouvernance, D2→Qualité, D3→DSI, D4→Pilotage, D5→RH)
--
-- After running, each analyst below signs in and immediately sees ONLY their
-- department's dimension to fill; the Admin can watch progress and finalize.
--
--   analyst.gouvernance@datapilot.test  → Pôle Gouvernance & Conformité (D1)
--   analyst.qualite@datapilot.test      → Direction Qualité (D2)
--   analyst.dsi@datapilot.test          → Direction Systèmes d'Information (D3)
--   analyst.pilotage@datapilot.test     → Direction Pilotage & Stratégie (D4)
--   analyst.rh@datapilot.test           → Direction Ressources Humaines (D5)
-- Password for all five: 12345
-- ============================================================================
do $$
declare
  v_bank       text;
  v_assessment uuid;
  rec          record;
  u            uuid;
  v_dept       uuid;
  pairs constant jsonb := '[
    {"email":"analyst.gouvernance@datapilot.test","dept":"Pôle Gouvernance & Conformité","dim":"D1","name":"Analyste Gouvernance"},
    {"email":"analyst.qualite@datapilot.test","dept":"Direction Qualité","dim":"D2","name":"Analyste Qualité"},
    {"email":"analyst.dsi@datapilot.test","dept":"Direction Systèmes d''Information (DSI)","dim":"D3","name":"Analyste DSI"},
    {"email":"analyst.pilotage@datapilot.test","dept":"Direction Pilotage & Stratégie","dim":"D4","name":"Analyste Pilotage"},
    {"email":"analyst.rh@datapilot.test","dept":"Direction Ressources Humaines","dim":"D5","name":"Analyste RH"}
  ]'::jsonb;
begin
  -- The bank to seed into = the bank of the first Super Admin.
  select bank_name into v_bank from public.profiles
   where role = 'superadmin' and bank_name is not null and bank_name <> ''
   order by created_at limit 1;
  if v_bank is null then
    raise exception 'No Super Admin with a bank found — set your bank first.';
  end if;

  -- One open draft assessment for the bank (reuse if one already exists).
  select id into v_assessment from public.assessments
   where bank_name = v_bank and status = 'draft' order by created_at desc limit 1;
  if v_assessment is null then
    insert into public.assessments (bank_name, title, status, target_level)
    values (v_bank, 'Évaluation de démonstration', 'draft', 3)
    returning id into v_assessment;
  end if;

  for rec in select value as v from jsonb_array_elements(pairs) loop
    -- Department (create if missing).
    insert into public.departments (bank_name, name)
    values (v_bank, rec.v ->> 'dept')
    on conflict (bank_name, name) do nothing;
    select id into v_dept from public.departments
     where bank_name = v_bank and name = rec.v ->> 'dept';

    -- Analyst account (create if missing).
    if not exists (select 1 from auth.users where email = rec.v ->> 'email') then
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
        rec.v ->> 'email', crypt('12345', gen_salt('bf')),
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
    else
      select id into u from auth.users where email = rec.v ->> 'email';
    end if;

    -- Role + bank + department on the profile.
    update public.profiles
       set role = 'analyst', bank_name = v_bank, department_id = v_dept,
           full_name = rec.v ->> 'name'
     where id = u;

    -- Map this dimension to this department on the demo assessment.
    insert into public.assessment_assignments (assessment_id, dim_code, department_id)
    values (v_assessment, rec.v ->> 'dim', v_dept)
    on conflict (assessment_id, dim_code) do update set department_id = excluded.department_id;
  end loop;

  raise notice 'Demo ready: assessment % in bank "%" with 5 dept analysts.', v_assessment, v_bank;
end $$;

-- Show the ready-to-use logins.
select p.email, '12345' as password, p.full_name, d.name as department
  from public.profiles p
  join public.departments d on d.id = p.department_id
 where p.email like 'analyst.%@datapilot.test'
 order by d.name;
