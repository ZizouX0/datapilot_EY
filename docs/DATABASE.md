# Database & security model

DataPilot runs on **Supabase Postgres** with **Row Level Security (RLS)** enforcing per‑bank multi‑tenancy. This document describes the tables, the RLS approach, the `SECURITY DEFINER` helper functions, and the migration history.

> For how to apply the migrations, see [SETUP.md](SETUP.md). For the role rules, see [ROLES.md](ROLES.md).

---

## Multi‑tenancy in one idea

Every tenant‑scoped row carries a **`bank_name`** and is only visible/writable to users in that bank. The check is centralised in `SECURITY DEFINER` helper functions so policies stay short and consistent:

```
USING ( bank_name = public.my_bank() )      -- or assessment_bank(...) = my_bank(), etc.
```

EY **owners** bypass the bank scope (`is_owner()`), giving them cross‑bank access by design.

---

## Tables

| Table | Purpose | Key columns |
| ----- | ------- | ----------- |
| `profiles` | One row per auth user. The source of truth for role, identity and tenancy. | `id` (=auth uid), `role`, `full_name`, `title`, `bank_name`, `department_id`, `phone`, `language`, `avatar_url`, `disabled`, `invited_by` |
| `dimensions` | Per‑bank questionnaire dimensions (editable). | PK `(bank_name, code)`, `name`, `weight`, `description` |
| `indicators` | Per‑bank questionnaire indicators. | PK `(bank_name, id)`, `dim`, `sub`, `q`, `hint`, `rubric`, `bct` |
| `submissions` | Finalised assessment results (solo and group). | `analyst_id`, `bank_name`, scores, `dimension_scores`, `answers`, `target_level`, `bct_rate` |
| `departments` | A bank's org units (Model B). | `id`, `bank_name`, `name` |
| `assessments` | One shared group draft per bank (Model B). | `id`, `bank_name`, `status` (draft/finalized), `target_level`, `submission_id` |
| `assessment_assignments` | Maps a dimension → a department on an assessment. | `assessment_id`, `dim_code`, `department_id` |
| `assessment_answers` | Each indicator answer on a shared draft. | `assessment_id`, `indicator_id`, `dim_code`, `score`, `evidence`, `skipped`, `answered_by` |

The master questionnaire template lives under `bank_name = ''` (empty string); a bank with no own copy reads the template until an admin copies it.

---

## `SECURITY DEFINER` helper functions

These run with the definer's privileges (so they can read `profiles` under RLS), pin `search_path = public`, and are declared `stable`. They are the building blocks of every policy:

| Function | Returns |
| -------- | ------- |
| `my_bank()` | The caller's `bank_name`. |
| `bank_of(uid)` | A given user's bank. |
| `my_department()` | The caller's `department_id`. |
| `is_owner()` / `is_admin()` / `is_superadmin()` | Role predicates (with inheritance: admin ⊆ superadmin ⊆ owner where appropriate). |
| `is_bank_admin()` | Admin **of the caller's own bank**. |
| `assessment_bank(id)` | The bank that owns an assessment. |
| `indicator_dim(bank, id)` | The **true** dimension of an indicator (used to authorise answer writes server‑side). |

---

## RLS, table by table (summary)

- **`profiles`** — a user reads their own row; admins read their bank's rows; owners read all. **Roles are not client‑writable** — there is no browser UPDATE policy for `role`; all role/department/title changes go through the serverless endpoints with the service‑role key.
- **`dimensions` / `indicators`** — any signed‑in user reads their bank's questionnaire (or the master template); only admins of that bank may edit.
- **`submissions`** — an analyst inserts/reads **their own**; admins and owners read all of their bank's. No UPDATE policy (submissions are immutable once written).
- **`departments`** — read by the bank; managed by Admin/Super Admin of that bank.

### Model B tables & policies

The Model B answer‑write path is the security‑sensitive part and is hardened specifically:

- **`assessment_answers` writes** are authorised on the indicator's *true* dimension via `indicator_dim(...)`, **not** on the client‑supplied `dim_code`. An analyst may only write answers for indicators whose dimension is assigned to **their** department.
- A **`BEFORE` trigger (`set_answer_dim`)** forces the stored `dim_code` from the `indicators` table and sets `answered_by = auth.uid()`, so a client can neither mislabel an answer's dimension nor spoof authorship.
- A **partial unique index** enforces **at most one open draft per bank** (`assessments(bank_name) WHERE status = 'draft'`).
- `CHECK` constraints bound the data: `assessment_answers.score ∈ 1..5` (or null), `assessments.target_level ∈ 1..5`, `dimensions.weight ≥ 0`.
- Foreign keys cascade owned children (answers, assignments) and `SET NULL` on soft references (`created_by`, `invited_by`, `department_id`).

---

## Migration history

The schema grew through hand‑numbered phase files. Applied **in order**, they produce the current schema:

| File | Adds |
| ---- | ---- |
| `schema.sql` | `profiles`, base RLS, the new‑user trigger (every new user → `analyst`). |
| `phase2.sql`, `phase2c.sql` | `dimensions` + `indicators` (editable questionnaire), `is_admin()`, dimension `description`. |
| `phase3.sql` | The `superadmin` role; `submissions`; removes the browser‑side role‑update policy. |
| `phase3b.sql` | `title` (position) + `disabled` flag. |
| `phase3c.sql` | `language` preference. |
| `phase3d.sql` | `avatar_url` + the `avatars` Storage bucket and policies. |
| `phase3e.sql` | `bank_name` + `phone`; invited users inherit the inviter's bank. |
| `phase3f.sql` | The **`owner`** (EY) role (widens the role CHECK). *(SMS MFA is dashboard config, no SQL.)* |
| `phase3g.sql`, `phase3h.sql` | Bank‑scoped read policies; per‑bank questionnaire PKs `(bank_name, code/id)`. |
| `phase4.sql` | Model B: `departments`, `assessments`, `assessment_assignments`, `assessment_answers`; `my_department()`, `assessment_bank()`; RLS. |
| `phase5.sql` | Department inheritance on invite. |
| `phase6.sql` | **Security fix:** `indicator_dim()`, the `set_answer_dim` trigger, answer‑write RLS on the true dimension, one‑open‑draft unique index. |
| `phase7.sql` | `handle_new_user` made idempotent (`on conflict do nothing`); forged‑`bank_name` guard on submissions; avatar `WITH CHECK`; `answered_by` forced. |
| `phase8.sql` | `CHECK` constraints (score range, target level, non‑negative weight). |

> **Important:** apply the phases **individually, in order**. `supabase/setup_all_and_seed.sql` is a convenience one‑shot that consolidates only through phase 3 and can re‑narrow the role CHECK or ship an older trigger — it is **not** the canonical install path. The `seed_*.sql` files contain **default test credentials and are for local development only**; never run them against production. See [SETUP.md](SETUP.md).

---

## What's solid, and what to improve

**Solid:** default‑deny RLS with per‑bank scoping; `search_path`‑pinned `SECURITY DEFINER` helpers; the service‑role key never reaching the browser; server‑forced `dim_code`/`answered_by`; the atomic one‑open‑draft constraint.

**Improvement backlog (tracked, not yet done):**
- Add indexes on the RLS/FK filter columns (`profiles.bank_name`, `profiles.department_id`, `departments.bank_name`, `assessment_assignments.department_id`, `assessment_answers.answered_by`).
- Move to a single versioned migration chain (e.g. `supabase` CLI) instead of hand‑numbered phases.
- Consider a real `banks(id)` table with a foreign key, replacing the free‑text `bank_name` tenant key (typos currently create distinct tenants).
- Validate `assessment_assignments.dim_code` (it has no FK/trigger, unlike `assessment_answers`).
