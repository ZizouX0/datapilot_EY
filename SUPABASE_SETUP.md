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

## What's next (Phase 2)
- Move the questionnaire (indicators / rubrics / weights) into Supabase and
  build the admin editor.
- Build the in-app **Users & roles** management screen (invite + promote).
