# Architecture

DataPilot is a **React single‑page app** backed by **Supabase** (Postgres + Auth + Storage), with a thin layer of **serverless functions** for privileged operations. This document covers the frontend, the state stores, the serverless API, and the collaborative "Model B" design. For the database itself see [DATABASE.md](DATABASE.md).

---

## High‑level picture

```
Browser (React SPA)
  ├─ anon key + RLS ───────────────▶ Supabase Postgres/Auth/Storage   (all data, per-bank isolated)
  └─ bearer token ─────────────────▶ Serverless api/* (service_role)  (privileged: users, roles, AI)
```

- **Reads/writes of bank data** go straight from the browser to Supabase using the **public anon key**; Row Level Security does the isolation.
- **Privileged actions** (create user, change role, assign department, AI roadmap) go to **`api/*`** functions that hold the **service‑role key server‑side** and re‑verify the caller.

---

## Frontend

### Routing & guards ([`src/App.jsx`](../src/App.jsx))

Every page is a **lazy‑loaded route** under one `<Suspense>` boundary, wrapped in a top‑level **`ErrorBoundary`** (so a render crash or a stale post‑deploy chunk shows a recoverable fallback instead of a white screen).

Guards compose to enforce who sees what:

| Guard | Effect |
| ----- | ------ |
| `RequireAuth` | Must be signed in, else → `/login`. |
| `RequireAdmin` | Must be Admin+ (admin/superadmin/owner), else → `/`. |
| `RequireAnalyst` | Must **not** be an admin; admins are sent to `/admin` (they don't run assessments). |
| `RequireComplete` | The assessment must be finished before Results/Gap/Compliance unlock. |

`Home` (`/`) is role‑aware: signed‑out → public **Landing**; signed‑in admin → `/admin`; signed‑in analyst → **Welcome**.

A two‑phase **`Boot`** gate holds the first render until the auth session and questionnaire content have resolved (both have **timeouts** so a hung network can't spin forever).

### Pages

- **Public:** `Landing` (credibility/marketing), `Login`, `SetPassword` (invite link target).
- **Analyst:** `Welcome` (account‑driven start screen; solo vs. group), `Questionnaire` (solo), `GroupContributor` (group), `Results`, `GapAnalysis`, `Compliance`.
- **Everyone:** `Account` (self‑service profile), `Guide` (role‑aware help).
- **Admin (`/admin`):** `AdminSubmissions`, `AdminQuestionnaire` (editor), `AdminUsers` (org tree + invites), `AdminDepartments`, `AdminGroupAssessment` (Model B setup/finalize).

### The shared assessment UI

[`src/components/assessment/AssessmentRunner.jsx`](../src/components/assessment/AssessmentRunner.jsx) is a single, fully prop‑driven presentational component that renders the questionnaire (dimension tabs, sub‑dimension pills, indicator cards, scoring guide, live score sidebar, navigation). It is used by **both**:

- `Questionnaire.jsx` (solo) — wired to `useAppStore` (localStorage answers), all dimensions.
- `GroupContributor.jsx` (group) — wired to `useAssessmentStore` (server answers), only the analyst's assigned dimension(s).

So a group contributor sees an experience **identical to solo**, just narrowed. This is the single source of truth for the assessment screen.

---

## State: the eight Zustand stores ([`src/store/`](../src/store))

| Store | Responsibility | Persisted? |
| ----- | -------------- | ---------- |
| `useAuthStore` | Session, role, profile (name, title, bank, department), capability selectors (`isAdmin`/`isSuperAdmin`/`isOwner`), sign‑in/out. | No (Supabase manages the session) |
| `useAppStore` | The **solo** assessment: answers, target level, and all scoring selectors. | **Yes** — `localStorage` key `datapilot-assessment` |
| `useAssessmentStore` | The **group** (Model B) assessment: the shared draft, assignments, server answers, optimistic save, atomic finalize. | No (server is the source of truth) |
| `useContentStore` | Loads the per‑bank questionnaire from Supabase, falling back to bundled defaults. | No |
| `useDepartmentsStore` | A bank's departments (CRUD). | No |
| `useUsersStore` | The admin user list + invite/role/title/disable actions (call the `api/` endpoints). | No |
| `useSubmissionsStore` | Finalized submissions (list + detail) for the review pipeline. | No |
| `useSettingsStore` | Language (EN/FR) + the `t()` translator. | **Yes** — language only |

Key conventions:

- **Scores are derived, never stored** — selectors recompute from `answers`, so they can't go stale.
- **Solo vs. group** are two deliberately separate worlds (localStorage vs. server) that never cross‑contaminate.
- **Sign‑out clears every sensitive store**, so the next user on a shared browser inherits nothing.

---

## Serverless API ([`api/`](../api))

Each privileged operation is a Vercel‑style function plus a shared `_core` module, so the **production serverless function and the local Vite dev middleware run the exact same code path** (the dev middleware lives in [`vite.config.js`](../vite.config.js)).

| Endpoint | Core | What it does |
| -------- | ---- | ------------ |
| `/api/invite` | `_invite-core.js` | Create a user one rank below the caller; carry title/bank/department as invite metadata. |
| `/api/set-role` | `_set-role-core.js` | Promote/demote a user (target strictly below caller, same bank). |
| `/api/manage-user` | `_manage-user-core.js` | Set a user's title; disable/enable an account (disable is Super Admin+). |
| `/api/set-department` | `_set-department-core.js` | Assign a user to a department. |
| `/api/update-self` | `_update-self-core.js` | A user edits their own whitelisted fields (name/language/avatar/phone; bank if Super Admin). |
| `/api/roadmap` | `_roadmap-core.js` | Generate AI roadmap actions (authenticated; any signed‑in user). |

Every core: verifies the caller's access token → re‑reads their role from the DB → checks rank → confines to bank. The shared rank rules are in [`api/_roles.js`](../api/_roles.js). The service‑role key is read from the environment server‑side and **never** shipped to the browser.

---

## Pure logic ([`src/lib/`](../src/lib))

- **`scoring.js`** — pure maturity maths (effective score, sub/dim/global score, maturity band, BCT rate). Mirrored by `useAppStore` so solo and group score identically. See [METHODOLOGY.md](METHODOLOGY.md).
- **`roadmap.js`** — turns the assessment into phased, prioritised, translated roadmap items.
- **`i18n.js`** — the EN/FR string catalogue + `translate()`; co‑located `COPY={en,fr}` objects handle page‑local copy.
- **`roles.js`** — display labels for roles (language‑aware).
- **`supabase.js`** — the configured Supabase client (anon key) + `isSupabaseConfigured`.

---

## Model B — collaborative multi‑department assessments

"Model B" lets several departments of one bank fill **one shared assessment**, each owning the dimensions relevant to them, finalised once by a coordinator.

**The actors and data:**

- **Departments** — a bank's org units (`departments` table), managed by Admin/Super Admin.
- **Assessment** — one shared draft per bank (`assessments`), created by the coordinator.
- **Assignments** — a mapping of each dimension → a department (`assessment_assignments`).
- **Answers** — every indicator answer on the shared draft (`assessment_answers`), tagged with who answered it.

**The flow:**

1. The coordinator (Admin/Super Admin) creates the bank's assessment and **maps dimensions to departments** (a suggested Tunisian default mapping is available in one click).
2. Each analyst is assigned to a department (at invite time or later). On their Welcome screen they get a **"Contribute to the group assessment"** card and, in the runner, see **only their department's dimensions** — the rest are hidden.
3. Answers **auto‑save** to the shared server draft (optimistic update with rollback on failure). Different analysts fill different dimensions concurrently.
4. The coordinator **finalises** the draft. Finalize re‑reads the latest server answers, computes the scores via the same `scoring.js` maths, writes a `submissions` row (reusing the normal review/export pipeline), and atomically flips the assessment to `finalized` (guarded against a double‑finalize race).
5. A finalised assessment is **read‑only**; contributors can review it with the scores shown.

**Security:** which dimensions an analyst may write is enforced in the database, not the client — the answer‑write RLS authorises on the indicator's *true* dimension (derived server‑side), and a trigger forces the stored `dim_code`/`answered_by`, so a client can't spoof writing into another department's dimension. See [DATABASE.md](DATABASE.md#model-b-tables--policies).
