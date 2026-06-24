# Supabase Setup — Phase 1 (Auth & Roles)

This guide gets authentication and roles working. One-time setup, ~10 minutes.
Hosting decision: **Supabase managed cloud, free tier, EU region.**

---

## 1. Create the project
1. Go to <https://supabase.com> → sign in → **New project**.
2. Name it `datapilot`, choose an **EU region** (e.g. Frankfurt), set a strong
   database password (save it somewhere safe).
3. Wait ~2 minutes for it to provision.

## 2. Create the database schema
1. In the dashboard: **SQL Editor → New query**.
2. Paste the entire contents of [`supabase/schema.sql`](./supabase/schema.sql)
   and click **Run**.
3. This creates the `profiles` table, Row Level Security policies, and a trigger
   that auto-creates a profile (role `analyst`) for every new user.

## 3. Make access invite-only
1. **Authentication → Providers → Email**: keep it enabled.
2. **Authentication → Sign In / Providers** (or **Settings**): turn **OFF**
   "Allow new users to sign up". Now only invited users can get in.

## 4. Wire up the frontend
1. **Project Settings → API**, copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
2. Create a `.env` file in the project root (copy from `.env.example`):
   ```
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```
3. Restart the dev server (`npm run dev`). The login screen's "backend not
   configured" notice should disappear.

## 5. Invite users
1. **Authentication → Users → Invite user**, enter an email.
2. They receive an email to set their password, then can sign in at `/login`.
3. Every invited user starts as an **analyst** automatically.

## 6. Promote an administrator
Run in **SQL Editor** (replace the email with yours):
```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@ey.com');
```
Sign out and back in — you'll see the **Admin** tab and badge.

---

## How it works in the app
- `/login` is the only public route. Everything else requires a session
  (`RequireAuth`); `/admin` additionally requires the admin role (`RequireAdmin`).
- The signed-in user's role is read from `profiles` and drives the UI
  (admin tab, badge). Analysts never see admin surfaces.
- Roles are **not** user-writable — promotion happens only via the dashboard
  (or a future Phase 2 server endpoint using the service_role key).

## Phase 2 — editable questionnaire + user management
1. In **SQL Editor → New query**, paste all of
   [`supabase/phase2.sql`](./supabase/phase2.sql) and **Run**. This adds the
   `dimensions` and `indicators` tables, an `is_admin()` helper, and the RLS
   policies (everyone signed in can read the questionnaire; only admins can edit;
   admins can manage user roles).
2. Sign in as an admin → **Admin** tab → **Questionnaire** →
   **"Load defaults into database"**. This copies the built-in questionnaire
   (5 dimensions, 47 indicators) into the tables so you can edit it. Until you do
   this, the app simply runs on its bundled defaults — nothing breaks.
3. Edit questions, guidance, the BCT flag, 5-level rubrics, and dimension weights.
   You can also **add or remove** indicators, sub-dimensions and whole dimensions
   from the editor (deletes ask for confirmation). Changes are read by the app the
   next time the assessment loads.
4. (Optional) Run [`supabase/phase2c.sql`](./supabase/phase2c.sql) to add the
   per-dimension `description` column (a short phrase shown to users on the
   assessment). Editable in Admin → Questionnaire.
5. **Admin → Users & roles**: see everyone who has signed in, change roles
   (analyst ↔ admin), and **invite new users by email** directly from the page.

### Enabling in-app invites (the service_role key)
Inviting users creates accounts, which requires Supabase's privileged
**service_role** ("secret") key. It must stay server-side — never in the browser:
- **Local dev:** add it to your `.env` (no `VITE_` prefix):
  `SUPABASE_SERVICE_ROLE_KEY=sb_secret_...` (Dashboard → Project Settings → API
  Keys → Secret keys → reveal & copy), then restart `npm run dev`.
- **Production (Vercel/Netlify/etc.):** set `SUPABASE_SERVICE_ROLE_KEY` as a
  server environment variable in the host's dashboard.
- The endpoint verifies the caller is an admin before inviting. Without the key,
  the invite box reports "not configured" and you can fall back to the dashboard
  (Authentication → Users → Invite user).
- Invited users land on `/set-password` from the email link to choose a password,
  then join as an **analyst**.

### How content loading works (so nothing ever breaks)
- At startup the app tries to load the questionnaire from Supabase. If the tables
  are empty, not migrated, or unreachable, it silently falls back to the bundled
  default questionnaire. The app is therefore always usable, online or not.

## Phase 3 — super-admin role + centralized submissions
1. In **SQL Editor → New query**, paste all of
   [`supabase/phase3.sql`](./supabase/phase3.sql) and **Run**. This:
   - adds a third role, **`superadmin`**, on top of admin/analyst;
   - redefines `is_admin()` to mean *admin **or** superadmin*, so super-admins
     automatically get every admin surface (no other policy changes);
   - **removes the browser-side role-update policy** — role changes now go only
     through the `/api/set-role` server endpoint, which enforces the hierarchy
     (a regular admin can no longer edit the table to escalate themselves);
   - creates the **`submissions`** table + RLS (analysts insert/read their own;
     admins and super-admins read every submission).
2. Promote your first super-admin in **SQL Editor** (replace the email):
   ```sql
   update public.profiles set role = 'superadmin'
   where id = (select id from auth.users where email = 'you@ey.com');
   ```
   Sign out and back in — the badge reads **Super Admin**.

### How the three tiers work
- **Analyst** — completes the assessment and, on the Results page, clicks
  **Submit for review** to send it in. Sees only their own submissions.
- **Admin** — everything an analyst can do, plus: review **all** submissions,
  edit the questionnaire, and manage analysts (invite users, toggle
  analyst ↔ admin). Cannot grant or modify the super-admin role.
- **Super Admin** — everything an admin can do, plus grant/revoke **admin** and
  **super-admin** roles. Nobody can change their **own** role (prevents
  self-escalation and lock-out).

### Server endpoint
`/api/set-role` reuses the existing **`SUPABASE_SERVICE_ROLE_KEY`** (the same key
`/api/invite` already needs) — no new secret. Without it, role changes report
"not configured"; promote roles from the dashboard SQL editor as a fallback.

## Phase 3b — post-centric accounts (functional emails)
Banks buy the product, so privileged accounts should belong to a **position**,
not a person — when the holder leaves, the bank keeps the account and hands it
to their successor instead of losing access or migrating data.

1. Run [`supabase/phase3b.sql`](./supabase/phase3b.sql) once. It adds a
   `title` (position) column and a `disabled` flag to `profiles`, and extends
   the new-user trigger to carry the title from the invitation.
2. **Convention — use a functional mailbox for admin/super-admin posts**, e.g.
   `datapilot-admin@bankX.tn`, `data-governance@bankX.tn` — a shared mailbox the
   bank's IT owns, never `firstname.lastname@…`. The bank controls who reads it;
   password resets go there; the DataPilot account survives staff turnover.
3. **Inviting**: Admin → Users & roles → set the email **and Position/title**.
   Edit a position later with the ✎ next to it.
4. **Off-boarding (Super Admin only)**: each row has **Reset password** (sends a
   recovery email — use it to hand a functional mailbox to a successor) and
   **Disable / Re-enable** (blocks sign-in at the auth layer for a leaver's
   personal account). `/api/manage-user` powers these and reuses the same
   service-role key.

> Trade-off to keep in mind: shared accounts weaken individual audit trails.
> The mature pattern is **hybrid** — a functional mailbox for the top
> Super-Admin/owner account (so the bank never loses control) plus personal
> accounts for day-to-day analysts (so actions stay traceable), disabled on
> departure.

## Phase 3c — account page (all roles)
1. Run [`supabase/phase3c.sql`](./supabase/phase3c.sql) once. It adds a
   `language` preference column to `profiles`.
2. Every signed-in user gets a **My account** page (click their name in the top
   bar). They can edit their **display name** and **language (EN/FR)** and
   **change their password**. Email, position, role and status are read-only
   there (administered elsewhere).
3. Self-edits go through `/api/update-self`, which reuses the existing
   `SUPABASE_SERVICE_ROLE_KEY` and only ever writes a whitelist (name, language)
   on the caller's own row — `role`/`disabled`/`email` can't be changed this way.
4. Language currently localizes the app **shell** (top bar, navigation, account
   page) in English/French; translating the assessment content itself is a
   follow-up.

## Phase 3d — profile photo / avatar
1. Run [`supabase/phase3d.sql`](./supabase/phase3d.sql) once. It adds
   `profiles.avatar_url`, creates a public **`avatars`** Storage bucket, and adds
   policies so each user can upload/replace/delete only files in their own
   folder (public read so images render without signed URLs).
2. On **My account → Profile photo**, users can upload a JPG/PNG/WebP (≤ 2 MB).
   The image is stored at `avatars/<user-id>/avatar`; its URL is saved on the
   profile via `/api/update-self` (avatar_url is on the same whitelist as name
   and language). The avatar then appears in the top bar.

## Phase 3e — org bank (per-inviter) + phone
1. Run [`supabase/phase3e.sql`](./supabase/phase3e.sql) once. It adds
   `profiles.bank_name` and `profiles.phone`, and extends the `handle_new_user`
   trigger so invited users inherit the inviter's bank (passed as invite
   metadata).
2. **Set the super-admin's bank once** — either on **My account → Bank** (only a
   super-admin sees an editable field) or via SQL:
   ```sql
   update public.profiles set bank_name = 'BIAT — Banque Internationale Arabe de Tunisie'
   where id = '<super-admin-uuid>';
   ```
3. From then on the bank flows **down the invite tree**: super-admin → invited
   admins → their invited analysts all share one bank. It is read-only for
   everyone except a super-admin (enforced in `/api/update-self`), and it is the
   bank shown on the assessment and in the top bar — analysts no longer type it.
4. **Phone** is an optional recovery/contact number each user manages on their
   account (saved via `/api/update-self`; no SMS is sent).

## What's next (later phases)
- Full French translation of the assessment content and reports.
- Editable recommendation library.
