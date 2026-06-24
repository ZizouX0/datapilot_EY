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

## What's next (later phases)
- Editable recommendation library.
