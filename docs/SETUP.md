# Setup guide

How to stand up DataPilot from a clean checkout: environment, database migrations, the first EY owner account, and deployment. Takes ~20 minutes.

> This supersedes the historical phase‑by‑phase narrative in [`SUPABASE_SETUP.md`](../SUPABASE_SETUP.md), which is kept for context on how the schema grew.

---

## 0. Prerequisites

- Node.js ≥ 20 and npm.
- A free [Supabase](https://supabase.com) project (Postgres + Auth + Storage). EU region recommended for Tunisian data residency.

---

## 1. Install & configure

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Where it's used | Public? |
| -------- | --------------- | ------- |
| `VITE_SUPABASE_URL` | Browser + server | **Public** (safe in the bundle) |
| `VITE_SUPABASE_ANON_KEY` | Browser | **Public** (RLS protects data) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only (`api/`) | **SECRET — never prefix with `VITE_`** |
| `GEMINI_API_KEY` (or `AI_API_KEY` + `AI_BASE_URL` + `AI_MODEL`) | Server only (AI roadmap) | **SECRET** |

- The **anon key** is meant to be public — Row Level Security is what protects the data.
- The **service‑role key** bypasses all security and powers the privileged `api/` endpoints (invites, role changes). It must stay server‑side. Without it, in‑app invites/role changes are disabled and you fall back to the Supabase dashboard.
- The **AI key** enables the personalised roadmap; without it, the app uses its built‑in static recommendations. The AI layer is provider‑agnostic (any OpenAI‑compatible endpoint); Gemini's free tier is the default. See `.env.example` for Groq/OpenRouter examples.

---

## 2. Make access invite‑only

In the Supabase dashboard:

1. **Authentication → Providers → Email** — keep enabled.
2. **Authentication → Sign In / Providers** — turn **OFF** "Allow new users to sign up". Only invited users can now get in.

---

## 3. Run the database migrations (in order)

Open **SQL Editor → New query** and run each file's full contents, **in this exact order**:

```
schema.sql
phase2.sql
phase2c.sql
phase3.sql
phase3b.sql
phase3c.sql
phase3d.sql
phase3e.sql
phase3f.sql
phase3g.sql
phase3h.sql
phase4.sql
phase5.sql
phase6.sql
phase7.sql
phase8.sql
phase9.sql
```

What each phase adds is summarised in [DATABASE.md → Migration history](DATABASE.md#migration-history).

> ⚠️ **Do not** use `setup_all_and_seed.sql` for a real install. It is a convenience bootstrap that only consolidates through phase 3, can re‑narrow the role CHECK constraint, and seeds **default test accounts with known passwords**. Apply the individual phases above instead. The `seed_*.sql` files are **local‑development only** — never run them against production.

After phase 8 your schema includes: profiles & roles, the editable questionnaire, submissions, Storage avatars, departments and the full Model B group‑assessment layer, with all the security hardening.

---

## 4. Load the questionnaire (optional but recommended)

The app ships with the full questionnaire as bundled defaults, so it works immediately. To make it **editable per bank**, sign in as an owner/admin → **Admin → Questionnaire → "Load defaults into database"**. This copies the 5 dimensions / 47 indicators into the `dimensions`/`indicators` tables so you can edit questions, hints, rubrics, the BCT flag and weights.

---

## 5. Create the first EY owner

There is no one above EY to invite the first owner, so create it once manually:

1. **Authentication → Users → Invite user** (or Add user) — create your EY account and set a password.
2. Promote it to `owner` in **SQL Editor** (replace the email):

   ```sql
   update public.profiles set role = 'owner'
   where id = (select id from auth.users where email = 'you@ey.com');
   ```

3. Sign out and back in — you'll see the **Admin** area with the owner badge.

From here, **everything is invite‑driven**: the owner invites each bank's Super Admin, who invites Admins, who invite Analysts. See [ROLES.md](ROLES.md) for the full chain.

---

## 6. (Optional) SMS verification on password change

This uses **Supabase Phone MFA** — credentials live in the Supabase dashboard, not in code. No migration to run:

1. **Authentication → Providers → Phone** — enable and connect an SMS provider (e.g. Twilio).
2. **Authentication → Multi‑Factor Auth** — turn on the **Phone** factor.
3. In the app: **My account → Security → SMS verification** — a user enrols their mobile; once on, changing the password requires a texted code.

Until a provider is configured, the UI shows "SMS verification isn't available yet" and password changes work without a code (no lock‑out).

---

## 7. Run it

```bash
npm run dev        # http://localhost:5173
```

The "backend not configured" notice on the login screen disappears once `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are set.

---

## 8. Deploy

DataPilot is a static SPA plus the `api/` serverless functions; it deploys cleanly to **Vercel** (or any host that supports serverless functions).

```bash
npm run build      # outputs dist/
```

Set the environment variables in the host's dashboard:

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — build‑time (browser).
- `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY` (and any `AI_*` overrides) — **server‑side environment variables only**.

In the Supabase dashboard, lock **Authentication → URL Configuration → Redirect URLs** to your production origin so invite/reset links can't be redirected elsewhere.

Locally, `npm run dev`'s Vite middleware ([`vite.config.js`](../vite.config.js)) emulates the same `api/` endpoints, so the app behaves identically in dev and production.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
| ------- | ------------ | --- |
| Login shows "backend not configured" | Missing `VITE_SUPABASE_*` | Set them in `.env`, restart `npm run dev`. |
| "User invitations are not configured" | Missing `SUPABASE_SERVICE_ROLE_KEY` | Add it server‑side (never `VITE_`‑prefixed). |
| AI roadmap returns 503 / falls back to static | No AI key, or `SUPABASE_SERVICE_ROLE_KEY` missing (the endpoint verifies the caller) | Set `GEMINI_API_KEY` and the service‑role key server‑side. |
| `profiles_role_check` violation when running SQL | You ran `setup_all_and_seed.sql` after the `owner` role existed | Apply the phase files individually, in order (Step 3). |
| Invite email never arrives | Supabase email rate limits / SMTP not configured | Configure SMTP in Supabase Auth settings, or invite from the dashboard. |
| Questionnaire looks empty after editing | Content tables empty/unreachable | The app falls back to bundled defaults; reload, or re‑run "Load defaults into database". |
