# Roles & onboarding

DataPilot is **multi‑tenant**: each **bank** is an isolated tenant, and EY sits above all banks. Four roles form a strict hierarchy.

```
EY (owner)  >  Super Admin (bank)  >  Admin (bank)  >  Analyst
rank 3          rank 2                 rank 1            rank 0
```

The ranks are defined once, server‑side, in [`api/_roles.js`](../api/_roles.js) and reused by every privileged endpoint, so the permission rules can never drift apart between endpoints.

---

## The four roles

| Role | Scope | Can do | Cannot do |
| ---- | ----- | ------ | --------- |
| **EY (owner)** | All banks | Everything, across every bank. Invite Super Admins. Edit the master questionnaire template. | — |
| **Super Admin** | One bank | Everything an Admin can, plus: manage that bank's **departments**, invite **Admins**, grant/revoke admin & super‑admin within the bank, edit the bank's questionnaire. | Act on another bank. Change their **own** role (no self‑escalation/lock‑out). |
| **Admin** | One bank | Coordinate: invite **Analysts**, assign them to **departments**, map dimensions → departments, **finalize** group assessments, review all of the bank's submissions, edit the questionnaire. | Touch a Super Admin or another Admin's role. Act outside their bank. |
| **Analyst** | Self | **Fill and submit** assessments (solo, or their assigned dimensions in a group assessment). Manage their own account. | See any admin surface. See other analysts' data. |

> Capability inheritance: a higher rank can do everything a lower rank can. `isAdmin()` is true for Admin, Super Admin and owner; `isSuperAdmin()` is true for Super Admin and owner. **Admins and Super Admins coordinate — they do not fill assessments. Analysts fill.**

---

## The onboarding chain (top‑down)

Each tier provisions the tier directly below it. Invites are strictly **one step down** (enforced by `invitableRole()` in `api/_roles.js`):

1. **EY owner invites the bank's Super Admin.** The owner sets the Super Admin's email, function/position, and **the bank** they belong to.
2. **Super Admin invites Admins** for that bank. They set each Admin's function (and optionally a department).
3. **Admin invites Analysts.** They set the analyst's function and either:
   - **assign a department** → the analyst becomes a *group contributor* for that department's dimensions, **or**
   - **leave the department blank** → the analyst runs a *solo* assessment.
4. **Analysts fill and submit** assessments.

### What the invitee sets vs. what is set for them

The invited person **never types their own identity**. Whoever invites them sets:

- **Email** — the login identity (a functional/role mailbox is recommended for admin posts, e.g. `data-governance@bankX.tn`, so the account survives staff turnover).
- **Function / position** ("title") — set by the role above, shown read‑only to the user.
- **Bank** — inherited down the invite tree; everyone in a bank shares the one bank the EY owner assigned. Read‑only for everyone except a Super Admin.
- **Department** (analysts only) — set by the inviting Admin/Super Admin.

The new user receives an email, lands on `/set-password`, and **only chooses a password**. Their Welcome page then shows their name, email, function, bank and date as a read‑only confirmation before they start.

---

## Bootstrapping the very first account

There is no one above EY to invite the **first EY owner**, so that account is created **manually** once, directly in Supabase (SQL editor or seed). Every account after that comes through the invite chain. See [docs/SETUP.md](SETUP.md#5-create-the-first-ey-owner).

---

## How roles are enforced (defence in depth)

Roles are enforced in **two** independent layers — the client only decides *navigation*, never *authority*:

1. **Database (authoritative).** Postgres Row Level Security scopes every row to the caller's bank and role via `SECURITY DEFINER` helpers (`is_admin()`, `is_superadmin()`, `is_owner()`, `my_bank()`). Roles are **not** client‑writable.
2. **Serverless endpoints (for privileged actions).** Creating users, changing roles, assigning departments and editing titles all run server‑side with the service‑role key. Each endpoint:
   - verifies the caller's Supabase access token,
   - re‑reads the caller's role from the database (never trusts the client),
   - rejects anyone below Admin rank,
   - confines non‑owners to their **own** bank,
   - only lets a caller act on someone **strictly below** their own rank.
3. **Client route guards (UX only).** `RequireAuth`, `RequireAdmin`, `RequireAnalyst`, `RequireComplete` in [`src/App.jsx`](../src/App.jsx) redirect users away from surfaces that don't apply to them. These are convenience redirects; the real protection is layers 1 and 2.

The endpoint ↔ rule mapping:

| Endpoint | Purpose | Rank required |
| -------- | ------- | ------------- |
| `/api/invite` | Create a new user one step down | Admin+ |
| `/api/set-role` | Promote/demote a user | Admin+, target strictly below |
| `/api/manage-user` | Set a user's title; disable/enable accounts | Admin+ (disable: Super Admin+) |
| `/api/set-department` | Assign a user to a department | Admin+, target strictly below |
| `/api/update-self` | Edit your own name/language/avatar/phone (and bank, if Super Admin) | Any signed‑in user, own row only |
| `/api/roadmap` | Generate AI roadmap actions | Any signed‑in user |

See [docs/DATABASE.md](DATABASE.md) for the exact RLS policies behind layer 1.
