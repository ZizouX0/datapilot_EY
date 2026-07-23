# DataPilot — User Guide

**A step-by-step guide for using DataPilot, from first setup to a finished maturity report. Written for business users — no technical background needed.**

> DataPilot is EY's data-maturity assessment tool for banks. Your teams answer a structured questionnaire; DataPilot scores the bank's data maturity, checks it against Banque Centrale de Tunisie (BCT) regulation, shows the gaps, and builds an improvement roadmap you can export as a PDF.

---

## Contents

1. [The big picture: the four roles](#1-the-big-picture-the-four-roles)
2. [The golden rule of invitations](#2-the-golden-rule-of-invitations)
3. [Getting in: signing in and setting your password](#3-getting-in-signing-in-and-setting-your-password)
4. [Step-by-step by role](#4-step-by-step-by-role)
   - [A. EY (the platform owner)](#a-ey-the-platform-owner)
   - [B. Super Admin (top of one bank)](#b-super-admin-top-of-one-bank)
   - [C. Admin (the coordinator)](#c-admin-the-coordinator)
   - [D. Analyst (fills the assessment)](#d-analyst-fills-the-assessment)
5. [How to invite someone (the exact screen)](#5-how-to-invite-someone-the-exact-screen)
6. [The two ways to run an assessment](#6-the-two-ways-to-run-an-assessment)
7. [Filling in an assessment](#7-filling-in-an-assessment)
8. [Reading your results and exporting the report](#8-reading-your-results-and-exporting-the-report)
9. [Managing your own account](#9-managing-your-own-account)
10. [Rules & conditions at a glance](#10-rules--conditions-at-a-glance)
11. [Frequently asked questions](#11-frequently-asked-questions)

---

## 1. The big picture: the four roles

DataPilot has four kinds of user. They form a chain of authority — each level sets up the level below it.

```
   EY (owner)  ─────▶  Super Admin  ─────▶  Admin  ─────▶  Analyst
   (the whole tool)     (one bank)         (coordinator)   (does the work)
```

| Role | Who it is | What they do |
| ---- | --------- | ------------ |
| **EY** (shown as **EY Admin**) | The EY consulting team | Runs the whole platform. Invites each bank's Super Admin. Can see everything, across every bank. |
| **Super Admin** | The bank's data lead (e.g. Chief Data Officer) | Top of one bank. Creates departments, invites Admins, runs and finalizes assessments. |
| **Admin** | A coordinator inside the bank | Invites Analysts, assigns them to departments, sets up and finalizes the group assessment. |
| **Analyst** | The person who answers the questions | Fills in the assessment (alone, or their department's part of a shared one) and reads the results. |

> **Important:** Super Admins and Admins **coordinate** — they set things up and review. **Only Analysts fill in assessments.** If you sign in as an Admin, you won't see the questionnaire; you'll see the administration area instead. That's normal.

---

## 2. The golden rule of invitations

**Every user is created by the level directly above them — one step at a time.** Nobody signs up on their own; access is invite-only.

- EY invites **Super Admins**.
- A Super Admin invites **Admins**.
- An Admin invites **Analysts**.

The person being invited **never types their own details**. Whoever invites them fills in their email, their function, their bank, and (for analysts) their department. The new person only receives an email and chooses a password.

**The bank is inherited automatically.** When EY invites a Super Admin, EY sets the bank. From then on, every Admin and Analyst that Super Admin's team invites belongs to that same bank — nobody has to type it again.

---

## 3. Getting in: signing in and setting your password

**Every new user follows the same first-login path:**

1. You receive an **invitation email** from DataPilot.
2. Click the link in the email. It opens the **"Set your password"** page.
3. Choose a password (at least 8 characters), type it twice, and click **"Set password & continue →"**.
4. You're taken into DataPilot, already signed in.

After that, you sign in normally at the login page:

- Go to the DataPilot address your administrator gave you.
- Enter your **email** and **password**, click **"Sign in →"**.

> **Forgot your password?** Ask your administrator (or Super Admin) to send a reset — they have a **Reset** button next to your name that emails you a new link.
>
> **The link says "invalid or expired"?** Invitation and reset links are one-time and time-limited. Ask for a fresh one.

---

## 4. Step-by-step by role

### A. EY (the platform owner)

> The **very first EY account** is created once, during installation, by the technical/IT team (see the separate `docs/SETUP.md`). Everything after that is done inside the app. If you're the EY user, your account already exists — you just sign in.

Once signed in as EY, you land in the **administration area**. Your main job is to onboard each bank:

1. Go to **Admin → Users & roles**.
2. Click into the **"Invite a Super Admin"** box.
3. Enter:
   - the Super Admin's **email**,
   - their **position** (e.g. *Chief Data Officer*) — optional,
   - the **bank name** — **required** (this is the one time the bank is typed; everyone below inherits it).
4. Click **Send invite**. They get an email to set their password.

That's it — the Super Admin now builds their own team. You can also:
- **Review submissions** from every bank (Admin → Submissions).
- **Edit the master questionnaire** that banks start from (Admin → Questionnaire → *Load defaults into database*, then edit questions, hints, weights, and which indicators are BCT-mandatory).

---

### B. Super Admin (top of one bank)

You were invited by EY and belong to one bank. You build and run your bank's assessment. Recommended order:

1. **Create your departments** — Admin → **Departments**.
   - Click **"⚡ Use standard Tunisian departments"** to add the five standard ones in one click (Governance & Compliance, Quality, IT/DSI, Steering & Strategy, Human Resources), or type your own.
2. **Invite your Admins** — Admin → **Users & roles** → **"Invite an Admin"** (email + position). You can also invite Analysts directly if you prefer.
3. **Assign analysts to departments** — Admin → **Departments** → *Assign analysts* → pick a department for each analyst from the dropdown.
4. **Run the group assessment** — Admin → **Group assessment** (see [section 6](#6-the-two-ways-to-run-an-assessment)).
5. **Finalize** when everyone's done — this locks the assessment and files it under **Submissions**.

You can also manage people: change a user's role, edit their position (✎ pencil), send a **password reset**, or **disable** an account when someone leaves the bank.

---

### C. Admin (the coordinator)

You were invited by a Super Admin. You do the hands-on coordination of the assessment. Your tasks are the same set-up and finalize steps:

1. **Departments** (Admin → Departments) — create them if not done, and **assign each analyst** to the department whose topics they know.
2. **Invite Analysts** — Admin → **Users & roles** → **"Invite an Analyst"**:
   - enter their **email** and **position**,
   - choose a **department** (optional): pick one → they'll fill that department's part of the group assessment; leave it blank → they'll do a solo assessment instead.
   - *(Your analysts automatically belong to your bank; if you have a department yourself, they inherit it unless you choose another.)*
3. **Create the group assessment** and **map each dimension to a department** (Admin → Group assessment).
4. **Track progress and finalize** — when every department has finished, click **Finalize & submit**.

---

### D. Analyst (fills the assessment)

You were invited by an Admin or Super Admin. You're the one who actually answers the questions. When you sign in, you land on your **Welcome** page.

- It shows your **name, email, function, bank, and today's date** — all read-only (your name is editable on your Account page; your function is set by your administrator). Check them and begin.
- **If your department was assigned part of a shared assessment,** you'll see a yellow **"Contribute to the group assessment →"** card — click it to fill only your department's dimensions.
- **Otherwise (or as a personal practice run),** click **"Start Assessment →"** to run the full solo assessment.

Then answer the questions ([section 7](#7-filling-in-an-assessment)) and read your results ([section 8](#8-reading-your-results-and-exporting-the-report)).

---

## 5. How to invite someone (the exact screen)

All invitations happen in **Admin → Users & roles**. The invite box always offers exactly the role **one step below you** — you can't skip a level, and the role is fixed (you don't choose it).

The box is titled **"Invite a [Role]"** and asks for:

| Field | Who sees it | Required? | What it's for |
| ----- | ----------- | --------- | ------------- |
| **Email** | Everyone | ✅ Yes | The person's login and where the invite is sent. |
| **Position** | Everyone | Optional | Their job title (a dropdown of common data roles, or "Other…" to type your own). Shown on their profile. |
| **Bank name** | **EY only** | ✅ Yes (for EY) | The bank the new Super Admin — and everyone under them — will belong to. |
| **Department** | Admins & Super Admins | Optional | For analysts: the department whose dimensions they'll answer. Leave blank = solo assessment. |

Then click **Send invite**. You'll see *"Invitation sent to [email] as [Role]."* and they receive an email.

> **Tip — use functional mailboxes for admin roles.** For Super Admin / Admin accounts, a shared mailbox the bank's IT owns (e.g. `data-governance@yourbank.tn`) is better than a personal address: the account survives if the person changes jobs. Use personal addresses for day-to-day analysts.

**Managing people afterwards** (same screen): each person's row lets you edit their **position** (✎), change their **role** (dropdown — only to roles below yours), send a **password reset**, or **disable / enable** their account. You can never change your own role, and you can only act on people below your level.

---

## 6. The two ways to run an assessment

DataPilot supports two styles. Both use the same on-screen questionnaire.

### Solo assessment
One analyst answers **all** the questions themselves. Best for a quick assessment done by one person. The analyst fills it in, reviews the results, and clicks **Submit for review**.

### Group assessment ("one shared assessment, many departments")
Different departments each answer **their own part** of one shared assessment. Best for a real bank-wide diagnosis where each team owns its area. Here's the flow:

1. **(Admin/Super Admin)** Create departments and assign each analyst to one — *Admin → Departments*.
2. **(Admin/Super Admin)** *Admin → Group assessment* → **Create group assessment**, then **map each dimension to the department that owns it**. Use **"⚡ Suggested Tunisian mapping"** to do all five at once, then adjust if needed.
3. **(Analysts)** Each analyst opens their **"Contribute to the group assessment"** card and answers **only their department's dimensions**. Answers save automatically as they go — several people can work at the same time.
4. **(Admin/Super Admin)** Watch the live progress and score, then click **Finalize & submit**. The assessment locks and appears under **Submissions** as a full report.

> Prefer one person to do everything? That's fine — an analyst with no department simply runs a solo assessment. Group mode is optional.

---

## 7. Filling in an assessment

The questionnaire is organised into **5 dimensions** (big themes), each split into sub-dimensions, with **47 indicators** (individual questions) in total.

For each indicator:

1. **Read the question** and its short hint.
2. **Give it a score from 1 to 5** — the levels are labelled **1 Initial · 2 Emerging · 3 Defined · 4 Managed · 5 Optimized**. Not sure what each level means? Open **"Scoring guide for this indicator"** to see a description of all five levels.
3. **Add evidence** (recommended) in the *Evidence reference* box — a note of what backs up your score.

Three rules to know:

- **Evidence cap:** if you give a score of **3 or higher but write no evidence**, the score is automatically capped at **2/5**. High claims need to be backed up. You'll see a warning when this applies.
- **Skipping:** you may **skip** an indicator you genuinely can't answer, using the *"Skip this indicator"* link — but only a limited number per dimension (about 20% of each dimension's questions).
- **BCT indicators cannot be skipped.** Questions marked with a **BCT** badge are regulatory and must be answered.

Move between questions with **← Previous** and **Next →**. A counter shows how many of the 47 you've answered.

**Finishing:** once every indicator is scored or skipped, a green **"Assessment complete"** banner appears with a **"View Results →"** button. (Until then, the Results, Gap Analysis and Compliance tabs stay locked with a padlock.)

In **group mode**, you only fill your department's dimensions; when you're done you'll see *"Your part is complete"* — your coordinator finalizes the whole thing.

---

## 8. Reading your results and exporting the report

Once the assessment is complete, three report pages unlock:

### Results
Your headline report. It includes:
- An **Executive Summary** written automatically (your overall maturity %, level, strongest area and biggest gap).
- Your **Global Maturity Index** (a score out of 5, mapped to a level from *Initial* to *Optimized*).
- A **radar chart** and **per-dimension scores**.
- A **"Set target maturity level"** selector (default is **Level 3 – Defined**) — this sets the goal your gap analysis compares against.
- KPI cards: how many indicators you scored, how many you skipped, your **BCT compliance**, and your **critical gaps**.
- Buttons: **↑ Submit for review** (sends your solo assessment to your admins) and **⤓ Save as PDF**.

### Gap Analysis
Your **improvement roadmap**: a prioritised table of what to fix, an effort/impact matrix, and a **3-phase plan**. You can click **"✦ Generate AI actions"** for tailored recommendations. Export with **⤓ Save as PDF**.

### Compliance
Your **BCT regulatory status**: your compliance rate, your risk exposure (Low / Medium / High), and a full table of every regulatory indicator with its status. Export with **⤓ Save as PDF** or **Save BCT Evidence Package**.

> **To download a PDF:** click **Save as PDF** — it opens your browser's print window; choose "Save as PDF" as the destination.

**Where submitted assessments go:** when an analyst clicks *Submit for review* (or a coordinator finalizes a group assessment), the report appears under **Admin → Submissions** for the admins to review, and under the analyst's own **Account → My submissions**.

---

## 9. Managing your own account

Click your **name** (top-right) to open **My account**. Anyone can:

- Change their **display name**, **profile photo**, and **phone number**.
- Switch the interface **language** between **English** and **Français**.
- **Change their password** (and optionally turn on **SMS verification**, so password changes require a texted code).

Some fields are **read-only** because your administrator manages them: your **bank**, **department**, **login email**, **position**, **role**, and **status**. If any of those is wrong, ask the person who invited you.

---

## 10. Rules & conditions at a glance

| Rule | Detail |
| ---- | ------ |
| **Access is invite-only** | No self sign-up. You must be invited by the level above you. |
| **Invitations go one level down** | EY → Super Admin → Admin → Analyst. You can't skip a level. |
| **The bank is set once, by EY** | Everyone under a Super Admin inherits that bank automatically. |
| **Only analysts fill assessments** | Admins and Super Admins coordinate and review; they don't answer questions. |
| **The invitee doesn't type their own details** | Email, function, bank and department are all set by the inviter. |
| **You can only manage people below you** | And never your own role. |
| **Score ≥ 3 needs evidence** | Or it's capped at 2/5. |
| **BCT indicators can't be skipped** | Regulatory questions are mandatory. |
| **An assessment must be 100% complete** | Before Results / Gap / Compliance unlock. |
| **A finalized group assessment is locked** | It becomes read-only and files a submission. |

---

## 11. Frequently asked questions

**I signed in but I don't see the questionnaire — only an "Admin" area.**
That's correct. You're an Admin or Super Admin, and those roles coordinate rather than fill in assessments. Only Analysts see the questionnaire.

**I invited someone but they never got the email.**
Check the address for typos. Invitation emails can also be delayed by mail filtering. As a fallback, an administrator can re-send the invite, and the person can always be added from the Supabase dashboard by IT.

**Can two people from the same department work at the same time?**
Yes, in a group assessment — but coordinate on who answers what, so you don't overwrite each other on the same question.

**What's the difference between "skip an indicator" and skipping the whole thing?**
You can skip a *single* indicator you can't answer (within the per-dimension limit). There's no way to skip the whole evaluation — every remaining indicator must be scored or skipped before results unlock.

**We finalized the group assessment by mistake / too early.**
A finalized assessment is locked. A coordinator can **Start a new assessment** to begin a fresh draft; the old submission stays on record and can be deleted from Admin → Submissions if needed.

**Someone left the bank. What do we do with their account?**
A Super Admin (or Admin) can **Disable** the account from Users & roles — they can no longer sign in, but their contributions stay. For a role account (like a shared CDO mailbox), use **Reset password** to hand it to their successor.

**Can we use the tool in French?**
Yes — the whole interface switches to French from **My account → Language** (or the EN/FR toggle at the top). *Note: the assessment questions themselves are currently in English.*

---

*DataPilot · EY Advisory Tunisia. For technical installation and backend setup, see [`docs/SETUP.md`](SETUP.md). For the role and permission model in depth, see [`docs/ROLES.md`](ROLES.md).*
