# DataPilot

**A data-maturity assessment platform for banks, built for the Tunisian banking sector and the Banque Centrale de Tunisie (BCT) regulatory framework (Circulaire 2025‑08, BCBS 239).**

A bank's teams answer a structured questionnaire; DataPilot scores the bank's data maturity across five weighted dimensions, visualises the result, measures regulatory (BCT) compliance, highlights the gap to a target level, and generates a prioritised, optionally AI‑assisted improvement roadmap — exportable as a polished PDF report.

> Status: PFE (Projet de Fin d'Études) 2026 internship project for **EY Advisory Tunisia**. Bilingual interface (English / French).

---

## Table of contents

- [What it does](#what-it-does)
- [Who uses it (roles)](#who-uses-it-roles)
- [Two ways to run an assessment](#two-ways-to-run-an-assessment)
- [Tech stack](#tech-stack)
- [Quick start (local)](#quick-start-local)
- [How it all fits together](#how-it-all-fits-together)
- [Full documentation](#full-documentation)
- [Repository layout](#repository-layout)
- [Security model in one paragraph](#security-model-in-one-paragraph)
- [Known limitations & roadmap](#known-limitations--roadmap)

---

## What it does

- **47‑indicator assessment** across **5 weighted dimensions**, each scored **1–5** on a detailed 5‑level rubric with regulatory hints.
- **Weighted maturity scoring** mapped to a **CMMI** ladder (Initial → Optimized) and **Gartner** labels (Unaware → Transformative).
- **Evidence enforcement** — any score of 3 or higher with no supporting evidence is automatically capped at 2 (anti‑inflation control).
- **Skip controls** — BCT‑mandatory indicators can never be skipped; other indicators can be skipped up to ~20% per dimension.
- **BCT compliance view** — compliance rate and risk exposure (Low / Medium / High) over the regulatory indicators.
- **Gap analysis** — current vs. target level per dimension, an effort/impact matrix, and tailored recommendations.
- **Improvement roadmap** — actions bucketed into Phase 1/2/3 by regulatory risk and business impact, with an optional **AI‑personalised** action set.
- **Printable PDF report** for diagnosis + recommendations.
- **Multi‑tenant, multi‑role backend** — every bank's data is isolated; an org hierarchy (EY → Super Admin → Admin → Analyst) provisions accounts top‑down.
- **Two assessment modes** — a solo assessment by one analyst, or a collaborative multi‑department assessment ("Model B").

A full breakdown of the scoring maths and methodology is in **[docs/METHODOLOGY.md](docs/METHODOLOGY.md)**.

---

## Who uses it (roles)

DataPilot is multi‑tenant: each **bank** is an isolated tenant, and EY sits above all of them. Four roles form a strict hierarchy, and **each tier provisions the tier directly below it**:

```
EY (owner)  →  Super Admin (bank)  →  Admin (bank)  →  Analyst
```

- **EY (owner)** — the EY consultants. Can do anything across every bank. Invites each bank's Super Admin.
- **Super Admin (bank)** — top of one bank. Manages departments, invites Admins, sets the bank's questionnaire.
- **Admin (bank)** — a coordinator. Invites Analysts, assigns them to departments, maps dimensions to departments, and finalises group assessments.
- **Analyst** — the person who actually fills in and submits an assessment.

The invitee never types their own identity — whoever invites them sets their email, function, bank, and (for analysts) department; the new user only chooses a password. **Admins and Super Admins coordinate; they don't fill assessments. Analysts fill.**

Full detail, including the exact onboarding chain and the permission matrix, is in **[docs/ROLES.md](docs/ROLES.md)**.

---

## Two ways to run an assessment

| Mode | Who fills it | Where answers live | Finalised by |
| ---- | ------------ | ------------------ | ------------ |
| **Solo** | One analyst answers all 47 indicators | Browser `localStorage` | The analyst (Submit for review) |
| **Group (Model B)** | Several analysts each fill only their department's dimensions of one shared assessment | Supabase (server) | The coordinator (Admin/Super Admin) |

The two modes use the **same on‑screen assessment UI** — a group contributor sees exactly the solo experience, just narrowed to their assigned dimension(s). The mechanics of Model B (departments, dimension‑to‑department mapping, finalize) are documented in **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#model-b--collaborative-multi-department-assessments)**.

---

## Tech stack

| Area | Technology |
| ---- | ---------- |
| Framework | React 19 + Vite 8 |
| Routing | React Router 7 (lazy routes + guards) |
| State | Zustand 5 (with `persist` for the solo store) |
| Backend | Supabase (Postgres + Auth + Storage + Row Level Security) |
| Server functions | Vercel‑style serverless functions in `api/` (mirrored by a Vite dev middleware) |
| AI roadmap | Any OpenAI‑compatible endpoint (defaults to Google Gemini free tier) |
| Charts | Recharts |
| Styling | Tailwind CSS 4 |
| PDF export | `react-to-print` (browser print) |

---

## Quick start (local)

```bash
# 1. Install dependencies
npm install

# 2. Configure the backend
cp .env.example .env
#   Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (browser-safe).
#   Optionally add SUPABASE_SERVICE_ROLE_KEY (server-only) for in-app invites,
#   and GEMINI_API_KEY (server-only) for the AI roadmap.

# 3. Run the database migrations
#   Apply the SQL files in supabase/ in order — see docs/SETUP.md.

# 4. Start the dev server  → http://localhost:5173
npm run dev

# Other scripts
npm run build      # production build
npm run preview    # preview the production build
npm run lint       # eslint
```

> Without a configured Supabase backend the login screen shows a "backend not configured" notice. The questionnaire content always falls back to bundled defaults, so the app never hard‑fails on a missing or empty database.

Complete, ordered setup instructions (every migration, env var, the AI provider, and how to create the very first EY owner account) are in **[docs/SETUP.md](docs/SETUP.md)**.

---

## How it all fits together

```
┌──────────────────────────── Browser (React SPA) ────────────────────────────┐
│  Pages (lazy)        Zustand stores              Pure logic (lib/)           │
│  Login / Welcome     useAuthStore    (session)   scoring.js  (maturity math) │
│  Questionnaire       useAppStore     (solo)      roadmap.js  (phasing)       │
│  GroupContributor    useAssessmentStore (group)  i18n.js     (EN/FR)         │
│  Results / Gap /     useContentStore (questionnaire)                          │
│  Compliance / Admin  useDepartments/Users/Submissions/Settings               │
└───────────┬───────────────────────────────────────────────┬─────────────────┘
            │ anon key + RLS (data reads/writes)             │ bearer token
            ▼                                                 ▼
   ┌──────────────────┐                          ┌──────────────────────────┐
   │  Supabase         │                          │  Serverless api/         │
   │  Postgres + RLS   │  ◀── service_role ────   │  invite / set-role /     │
   │  Auth + Storage   │      (privileged)        │  manage-user / set-dept /│
   │  per-bank tenancy │                          │  update-self / roadmap   │
   └──────────────────┘                          └──────────────────────────┘
```

- The browser talks to Supabase directly using the **public anon key**; **Row Level Security** enforces per‑bank isolation on every row.
- Privileged operations that must bypass RLS (creating users, changing roles, assigning departments) go through **serverless functions** that hold the **service‑role key server‑side** and re‑verify the caller's identity and rank on every call.
- All scoring is **pure functions** in `src/lib/scoring.js`, mirrored by the solo store so solo and group assessments score identically.

The deep dive — every store, route guard, table, RLS policy, and the Model B flow — is in **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** and **[docs/DATABASE.md](docs/DATABASE.md)**.

---

## Full documentation

| Document | What's inside |
| -------- | ------------- |
| **[docs/SETUP.md](docs/SETUP.md)** | Step‑by‑step backend setup: every migration in order, env vars, AI provider, deployment, and creating the first EY owner. |
| **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** | Frontend (routes, guards, stores), the serverless API layer, data flow, and the Model B collaborative‑assessment design. |
| **[docs/DATABASE.md](docs/DATABASE.md)** | Every table, the RLS policies and `SECURITY DEFINER` helpers, the migration history, and the multi‑tenant isolation model. |
| **[docs/ROLES.md](docs/ROLES.md)** | The four‑tier hierarchy, the top‑down onboarding chain, and a who‑can‑do‑what permission matrix. |
| **[docs/METHODOLOGY.md](docs/METHODOLOGY.md)** | The dimensions, weights, scoring maths, maturity bands, evidence cap, skip rule, BCT compliance, gap analysis, and roadmap phasing — with honest notes on the model's assumptions. |
| **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** | The original phase‑by‑phase migration narrative (historical context for how the schema grew). |

---

## Repository layout

```
datapilot_EY/
├── api/                     # Serverless functions + shared _core modules (server-side only)
│   ├── invite.js / _invite-core.js
│   ├── set-role.js / _set-role-core.js
│   ├── manage-user.js / _manage-user-core.js
│   ├── set-department.js / _set-department-core.js
│   ├── update-self.js / _update-self-core.js
│   ├── roadmap.js  / _roadmap-core.js        # AI roadmap (authenticated)
│   └── _roles.js                              # shared role-rank rules
├── src/
│   ├── App.jsx              # Routes, guards (RequireAuth/Admin/Analyst/Complete), error boundary
│   ├── pages/               # Login, Welcome, Questionnaire, GroupContributor, Results,
│   │   │                    #   GapAnalysis, Compliance, Account, Guide, Landing, admin/*
│   │   └── admin/           # Submissions, Questionnaire editor, Users, Departments, Group setup
│   ├── components/          # AssessmentRunner (shared solo/group UI), layout, report, ui
│   ├── charts/              # RadarChart, DimensionBars
│   ├── store/               # 8 Zustand stores (see ARCHITECTURE.md)
│   ├── lib/                 # scoring.js, roadmap.js, i18n.js, roles.js, supabase.js
│   └── data/                # indicators.js (questionnaire), recommendations.js, tunisia*.js
├── supabase/                # SQL migrations (schema.sql + phase2..phase8) + seeds
├── docs/                    # The documentation set linked above
└── .env.example             # Environment variable template
```

---

## Security model in one paragraph

Every bank is an isolated tenant. The browser only ever holds the **public anon key**; all data access goes through Postgres **Row Level Security**, where per‑bank `SECURITY DEFINER` helper functions (`my_bank()`, `is_admin()`, …) scope every read and write to the caller's own bank. The privileged **service‑role key never reaches the browser** — it lives only in the serverless `api/` functions, each of which verifies the caller's access token and re‑checks their role rank before acting. Roles are not client‑writable; role/department changes only happen through those server endpoints, which enforce the "you can only act on someone strictly below you, in your own bank" rule. The AI roadmap endpoint is authenticated. See **[docs/DATABASE.md](docs/DATABASE.md)** for the policy‑by‑policy detail.

---

## Known limitations & roadmap

Honest, current state (useful for a thesis defence and for contributors):

- **No automated test suite yet.** The pure scoring/roadmap logic is the obvious first target (Vitest). Tracked as a priority.
- **Migrations are hand‑numbered phase files**, not a single versioned chain; `supabase/setup_all_and_seed.sql` is a convenience bootstrap that can drift — apply the individual phases in order for a clean install (see [docs/SETUP.md](docs/SETUP.md)).
- **Seed/demo files contain default test credentials** — they are for local development only and must never be run against a production project.
- **Accessibility** is a work in progress (not yet WCAG 2.1 AA).
- **Assessment *content* (indicator questions, rubrics) is English‑only by design**; the app *shell* is fully EN/FR.
- Methodological assumptions (mean‑of‑means aggregation, the chosen dimension weights) are documented transparently in [docs/METHODOLOGY.md](docs/METHODOLOGY.md).

---

*EY Advisory Tunisia · PFE 2026 internship project. Not an official EY product.*
