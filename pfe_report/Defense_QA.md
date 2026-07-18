# DataPilot Defense — Complete Jury Q&A Prep

*Every question the jury is likely to ask, with a short answer you can actually say out loud.
"→ A#" points to the backup slide that supports the answer. Questions marked ★ came up in multiple jury simulations — rehearse these first.*

---

## A. Methodology & research validity

**★ A1. Your evidence cap exists because self-assessment can't be trusted — yet your sector diagnosis rests on 44 anonymous self-reports. Why should we accept a diagnosis produced by the exact method your thesis was built to invalidate?**
That symmetry is deliberate, and I state it on the slide itself. The survey's job is problem characterisation, not measurement: it triangulates three independent signals — 30% approved strategy, 57% re-verify data, 54% siloed access — that all point the same direction. The survey is the "before" picture; the evidence-capped instrument is the "after". A properly sampled, evidence-backed sector baseline is exactly what field deployment of the tool would produce.

**★ A2. Who turned "30% have a strategy" into "Level 2"? You did — with a rubric you also wrote. Isn't that circular?**
The mapping runs through the published rubric, not my intuition: each survey finding maps to a sub-dimension whose level definitions are written down — manual re-verification without automated controls *is* Emerging by the rubric's own text — so any reader can audit the placement. I claim a band, not a point. The residual researcher-bias threat is acknowledged in the thesis and answered by full reproducibility and the planned multi-assessor validation. → A6

**★ A3. You say the framework was "validated". Your tool reproducing rules you wrote, on data you seeded, is verification — not validation. What has actually been tested?**
I accept the distinction, and the report draws the same boundary. What is established is design validation in the DSR sense — the artifact demonstrably meets its stated requirements — plus computational reproducibility: identical inputs always give identical outputs. What is *not* established is inter-rater reliability or criterion validity; both are named future work. The honest formula from my report: this is "a demonstration of a faithful and internally consistent instrument, not an externally validated measurement."

**A4. You chose the 15 candidates, invented the 5 criteria, scored the matrix yourself, and set the weights. Show me the ±5-point robustness. And why a hybrid rather than just localizing DCAM, which scored 14/15?**
The robustness argument is mathematical: the GMI is a weighted average of the five dimension scores, and in the worked example all five (1.92–2.50) sit inside the Level 2 band (1.80–2.59) — so *any* reweighting yields Level 2 for that profile; the band conclusion is weight-independent. On DCAM: it is the regulatory anchor precisely because it scored highest, but it has no 1–5 evidence-scored scale (CMMI supplies that), no questionnaire mechanics (TDWI), no executive labels (Gartner), and its full process is too heavy for a field session. The contribution is the documented, auditable combination — and the matrix is published so anyone can re-score it. → A14, A15

**A5. Single author designs, builds, and evaluates. Isn't that circular?**
Partly — and I mitigate rather than deny it. DSR separates the roles in time: requirements were fixed before the build, validation criteria before the evaluation. Everything is reproducible: the rules are published, every figure retraces by hand, so my claims don't depend on trusting me. And the weights and rubric came from the convergence of five external frameworks and 44 practitioners, not from my preferences alone. Independent assessors running the instrument is the stated next step. → A13

**A6. Why Design Science Research and not a classic empirical methodology?**
Because the problem demanded an artifact, not a description. The sector's gap is not that low maturity is unexplained — it's that no instrument exists to measure it. DSR is the methodology whose output *is* a validated artifact: each iteration runs problem investigation → design → validation → implementation → evaluation, and evaluation feeds the next problem — my evidence-cap rule was born exactly that way.

**A7. You claim Agile, but where are the sprints and ceremonies?**
I'm precise about this in the report: not formal Scrum, but the iterative, incremental discipline Agile promotes — each increment built, exercised against the scoring methodology and simulated data, and refined, with weekly supervised reviews. The tool was continuously runnable, so design decisions were tried in a working build rather than argued on paper.

---

## B. The framework

**★ B1. Why five dimensions and not six? Where is security or privacy?**
Five is where the five source frameworks converge — DAMA's knowledge areas, DCAM's components, and the survey priorities all cluster into these five capability families; more granularity is exactly why DCAM was rejected as too heavy for a field session. Security is scoped, not absent: controlled access, role-based permissions, and traceability are indicators inside Architecture & Access and Data Quality — this instrument measures data-management maturity, not ISO 27001, which already exists. And the framework lives as configuration in the master template: a sixth dimension would be a template change, not a rebuild.

**B2. Why 25 / 20 / 20 / 20 / 15?**
Governance is heaviest because it is the root-cause dimension — without ownership, policies, and a data council the others cannot durably improve — and it is where the BCT circular concentrates its obligations. Skills & Culture is lightest because it is measured by proxy, so the least directly observable dimension gets the least influence. The three middle dimensions are symmetric because no evidence justified ranking them. And the weights sum transparently to 100%, so a bank can challenge any single one without breaking the model. → A1

**B3. Why is Skills & Culture a "proxy" dimension?**
Because culture cannot honestly be self-scored. Instead of asking "rate your data culture", the indicators use observable stand-ins — training budget, headcount ratio, certifications. That is also why it carries the lowest weight and why none of the 13 regulatory indicators live there.

**B4. Isn't your "hybrid" just DAMA plus CMMI dressed up?**
Each of the five sources contributes a distinct, non-overlapping function that the others lack: DAMA the structural taxonomy, DCAM the regulatory anchor, CMMI the five-level scale, TDWI the questionnaire-and-radar mechanics, Gartner the executive labels. Remove any one and a capability of the instrument disappears. The retained/excluded decision for each is documented in the report. → A16, A14

**B5. How were the 15 candidates screened?**
Five criteria — international credibility, banking relevance, scoring logic, complementarity, BCT/BCBS fit — each scored 1–3, giving a score out of 15, with every decision documented. Selection was principled, not arithmetic: the five best *open, academically referenceable* frameworks were kept; McKinsey scored a competitive 11/15 and was still rejected because it is proprietary and unpublished. → A14, A15

---

## C. Scoring rules & arithmetic

**★ C1. Your evidence cap checks that evidence is CITED, not that it is TRUE. I can type anything into the field and score 5. How have you solved over-optimism rather than moved it into a text box?**
The cap is a workflow guardrail and an audit hook, not a lie detector — the same relationship an external audit has to management representations. What it changes is that every score of 3+ now carries a named, immutable citation a reviewer can pull and inspect; today the alternative is an opinion with no citation at all. A fabricated citation becomes a dated misstatement in an immutable, regulator-facing record — a much higher institutional bar than quiet optimism. Verifying authenticity is deliberately the human reviewer's job; attachments and per-indicator reviewer sign-off are the natural extension at field-pilot stage. → A2

**★ C2. I rate myself 5 on all 47 indicators and attach 47 random PDFs. What does your tool print?**
A high score — by design, because DataPilot is a diagnostic instrument, not a lie detector. But that bank hasn't beaten the tool: it has manufactured 47 timestamped exhibits of bad faith, stored immutably, that its supervisor can open line by line. That is also why assessments are designed to be EY-administered with human evidence review, not pure self-service.

**★ C3. Your scale starts at 1, so the worst possible bank still scores 20%. What does "44%" actually mean?**
You're right, and I'll be precise: 44% is a display convention — score over scale maximum — inherited from how CMMI-style indices are reported; on a distance-from-worst reading, 2.19 is about 30%. That is exactly why no decision is ever made on the percentage: the operative output is the band, defined on the raw 1–5 scale, so the ×20 convention cannot change any bank's level, priority, or compliance result. The percentage exists because executives read "44%" faster than "2.19/5".

**★ C4. Bank A skips some indicators, Bank B skips different ones, both print 44%. Are they equally mature — yes or no?**
Not automatically — and the tool never hides it: every skip is recorded and visible, so comparability is achieved by transparency of basis, not by pretending the bases are identical. Three structural guarantees bound the drift: skips are capped at 20% per dimension, so at least 80% is always common ground; everyone assesses against the same master template; and the 13 regulatory indicators can never be skipped — so the compliance comparison is exact by construction, always 13 of 13. → A3

**C5. Two decimals on the GMI — isn't that false precision?**
The decimals are there for traceability, not accuracy: 2.19 is the exact arithmetic output that anyone can recompute, and rounding it would break the retrace. All decisions read the band, not the decimals — 2.19 and 2.21 are both simply Level 2. → A9

**C6. Why is an indicator "compliant" at 3 and not 5?**
Because 3 is where the rubric encodes "defined and operational" — which is what the law demands — while 4 and 5 measure excellence beyond the legal minimum; requiring 5 would conflate compliance with world-class practice. And the threshold applies to the *effective* score, after the evidence cap, so "compliant" always means demonstrably operational. → A8

**C7. Walk me through the 2.19.**
Each indicator is scored 1–5; a sub-dimension is the average of its indicators' effective scores; a dimension is the average of its sub-dimensions; the GMI is the weighted sum: 0.25×1.92 + 0.20×2.08 + 0.20×2.38 + 0.20×2.50 + 0.15×2.13 = 2.19. Times 20 gives 44%, inside the 1.80–2.59 Emerging band. Every step retraces by hand. → A7

**C8. What happens to the score when a dimension doesn't apply — a silent zero?**
Never a silent zero: renormalization removes that dimension's weight and rescales the rest to 100% — if Skills & Culture (15%) is out, Governance's 25% becomes 25/85 ≈ 29%. The alternative — scoring zero — would punish inapplicability as failure. → A3

**C9. On the results screen, 3.00 − 2.38 should be 0.62 but you show +0.63. Why?**
The delta is computed on the unrounded underlying score (2.375 → 0.625 → 0.63) while the display rounds to 2.38. The engine is internally consistent; only the display rounds.

**C10. You show "1 critical gap", "4 critical priorities", and "5 critical actions". Which is it?**
Three different granularities, each correct: one *dimension* below 2.0 (Governance), four *sub-dimensions* ranked critical in the gap table, five *actions* generated from them in the roadmap. Same diagnosis, three levels of zoom.

**C11. The welcome screen says results unlock when all 47 are answered — but you allow skips. Which is true?**
The completion gate opens when every indicator is answered *or lawfully skipped* — a skip is an explicit, recorded decision, never an omission. Regulatory indicators can only be answered.

---

## D. Regulatory & compliance

**★ D1. Who authorized your reading of Article 6? If the BCT publishes an official interpretation tomorrow, every bank you told "77% compliant" was misinformed.**
No one — and the tool never claims otherwise; the slide states it is my own defensible reading pending compliance-authority sign-off. Three design choices contain the risk: every regulatory indicator cites the exact clause it operationalises, so a compliance officer or the BCT can audit the logic line by line; the mapping is a configurable tagging layer, so an official interpretation is a data update, not a redesign; and the output is framed as exposure for internal steering, never a legal attestation. I would welcome the BCT correcting the mapping — the architecture assumes that happens. → A5

**★ D2. Article 6 obligations are binary. Averaging thirteen legal duties into "77%" is not how supervision works — I care about the three failures, not the ten passes.**
I agree, and the tool looks at compliance exactly as you do: the line-level view is the operative output — each failing indicator named with the clause breached — and every regulatory failure escalates to Phase 1 of the roadmap regardless of the percentage. The 77% and the Low/Medium/High bands are management-communication heuristics, not legal categories; I would not defend the percentage as a supervisory quantity.

**D3. A compliance rate from self-assessment has no evidentiary value to a supervisor. What stops an unimplemented policy PDF from scoring 3?**
Nothing in the software verifies genuineness, and I don't claim it does. The cap converts unverifiable assertion into verifiable citation: "compliant" always carries a named artifact a human reviewer can pull and test, and submissions are immutable so the trail can't be rewritten. The tool is structured preparation for supervision, not a substitute for it.

**★ D4. You switched the AI endpoint off for data-residency reasons — while the whole platform sits on foreign-hosted Supabase. Isn't that incoherent?**
The line I drew is between raw assessment content leaving the datastore to a third-party model (off) versus residing in the platform's own database under row-level security — but you're right that for production, hosting jurisdiction is the question. Two facts: no real bank data has ever entered the system — everything is simulated, so no confidentiality obligation has been engaged; and the stack is portable — Supabase is standard PostgreSQL, self-hostable on Tunisian infrastructure. Jurisdiction-compliant hosting is a hard precondition of the field pilot.

**D5. EY defines the yardstick, administers every tenant, and sells the remediation. Why is a consultancy sitting in the supervisor's seat?**
EY is the assessment administrator, not a supervisor, and the design constrains it: banks sit in isolated tenants, submissions are immutable, every rule is published, and any score is recomputable by the bank itself — EY cannot quietly move a result. And that conflict is precisely why I did *not* build cross-bank benchmarking even though it is technically one aggregation layer away: sector comparison is supervisory information, and I state it should be run by the regulator.

**D6. Are all Article 6 obligations covered, or only the tractable ones?**
The mapping table in the appendix traces each of the 13 regulatory indicators to the specific obligation it operationalises — that mapping exercise is itself how coverage was validated, forcing every expectation to name the indicator that answers it. If the BCT identifies an uncovered obligation, adding an indicator is a template change. → A4, A5

---

## E. Results & the worked example

**★ E1. Is 2.19 a real bank's score?**
No, and the deck says so at every occurrence: it is a worked example on simulated data — no real bank has been assessed. Its job is functional fidelity: proving the engine computes end to end, with every figure retraceable by hand. → A6

**★ E2. You invented the inputs and they land exactly on your survey's story — Level 2, governance weakest. What did 2.19 actually test?**
Correct — any inputs would have tested the arithmetic, and I claim nothing more than functional fidelity: every rule fires on a case I can retrace in front of you. The profile was seeded survey-realistic for a different reason: the dashboards, gap ranking and roadmap needed to be shown behaving sensibly on a plausible bank, not random noise. The empirical claim (sector at Level 2) rests solely on the survey; the methodological claim (engine computes correctly) rests solely on the example. Neither borrows credibility from the other.

**E3. Why should your thresholds survive first contact with a real bank?**
They may not — and they don't need to, because every threshold is a declared, configurable parameter: compliant-at-3, the bands, the skip ceiling. A field pilot recalibrates numbers without rebuilding the instrument, and that pilot is the first item of future work. The honest comparison isn't "this versus a validated tool" — it's "this versus nothing", which is what banks have today.

**E4. What, exactly, has been validated — and against what?**
Three claims, three separate bases, kept apart. Sector at Level 2: indicative, from 44 professionals. The 2.19: simulated, proves functional fidelity only. The instrument's design: validated against its stated requirements — screened sources, deterministic reproducible scoring, structural anti-gaming rules. "Defensible" means every number can be challenged and recomputed; calibration against reality is honestly pending.

**E5. 44 respondents — what's the sampling frame, response rate, representativeness?**
It is a convenience sample of banking professionals in data-adjacent roles, self-reported and anonymous, and the report labels it indicative and directional — no claim about the number of institutions is made. It motivates the problem; it is not a measurement. That is a limitation I declare rather than defend.

---

## F. The tool & engineering

**★ F1. You said "tested increments" and "testable functions" — and the repo has zero automated tests, with the scoring rules implemented twice. How do you know both paths score identically?**
"Testable" is true; "tested by an automated suite" is not, and I concede that. Verification today is the hand-retraceable worked example acting as an end-to-end oracle over deterministic, I/O-free functions. The duplication exists because the group path needed the rules outside the React store; the fix — one shared scoring module plus a test suite with the worked example as a golden test — is a one-day refactor and the first engineering item before any real pilot. The codebase already shows that discipline where it mattered most: the API role rules are factored into one shared module so endpoints cannot drift.

**★ F2. The score is computed in the browser. What stops a tampered client writing a flattering number?**
Distinguish two properties: confidentiality is enforced in the database via row-level security; integrity is enforced by recomputation. The immutable submission stores the raw answers and evidence — the source of truth — and because scoring is a deterministic pure function, anyone can recompute the GMI from the stored answers and expose a tampered headline. Moving finalize-time computation server-side, like the existing privileged endpoints, converts tamper-evident into tamper-proof — a small, planned hardening.

**F3. Your tenant key is a mutable free-text bank name. Why not an immutable tenant ID?**
The name is never client-supplied on data rows: submissions are scoped by the analyst's bank read from their verified profile, and invitees inherit the inviter's bank — no assessor ever types the tenant key, and banks come from a controlled list of ~24. The correct end-state is a banks table with a UUID key — and because every policy routes through one helper function, that migration swaps a function body, not the shape of the policies.

**F4. The evidence cap is a non-empty-string check — one character lifts it. Auditable, or theater?**
It is a guardrail, not a lie detector: its job is to make an unsupported claim impossible to submit *silently* — the assessor must commit in writing, in an immutable record, to a named artifact. The audit is human. Minimum-length validation is trivial to add; attachments and reviewer sign-off states are the real fix and belong to the field pilot, when real documents exist.

**F5. Banks get editable questionnaire copies — what protects the 13 regulatory indicators, and where does comparability go?**
The master template is the comparability anchor: cross-bank comparison only ever runs on master-template assessments; tailoring is for internal steering. The 13 regulatory indicators carry their flag and are non-skippable in the engine regardless of copy. I concede the hardening: the untouchability of flagged rows should also be a database constraint, plus questionnaire versioning on submissions — additive schema changes, prerequisites for the pilot.

**F6. Nine hand-run schema patch files, no CI, no staging. If a migration breaks with ten banks live, what's the rollback?**
Load is not the risk — ~24 banks and client-side pure-function computation are trivial for Postgres; iteration 4's effort went to isolation, correctly. Process is the gap, and I'll use my own tool's vocabulary: the platform's delivery process sits at "Emerging"; the road to "Defined" is the migration CLI workflow, a staging project, and the golden-test suite as deploy gate — scheduled before any real bank data enters the system, which is also why none has.

**F7. How is one bank's data isolated from another's?**
In the database itself: row-level security tags every row to its tenant and refuses cross-tenant reads, with identity read from the verified login session. A bug — or a crafted request — in the application still cannot cross the boundary, and privileged operations are re-checked server-side per request. → A11

**F8. In a group assessment, can a department hide a weakness by staying silent?**
At indicator level, no: the 13 regulatory indicators are non-skippable, and unanswered indicators are flagged to the admin before finalization. At dimension level I'm honest: a dimension left entirely unmapped drops out of the weighted sum under renormalization, so today the coordinator must map all five — enforcing full coverage at finalization is identified platform work in the thesis. → A10

**F9. Why React, Zustand, Supabase — and not something else?**
Each choice is argued in the report: React's component model fits an interface of many small repeated pieces; Zustand keeps the scoring logic as plain testable selector functions outside the UI; Supabase provides, in one managed service, exactly the thin backend a multi-tenant deployment needs — Postgres with row-level security, invite-based auth, and storage. The principle throughout: keep the scoring engine pure and separable from presentation.

---

## G. Business & adoption

**★ G1. Who actually asked for this? Name one person who has used it or committed to it.**
Honestly: no external bank yet, and I won't pretend otherwise — that is why field validation is the first item of future work. The need surfaced repeatedly in EY Technology Strategy & Transformation engagements, where clients facing Circulaire 2025-08 had no defensible way to score themselves, and 44 professionals confirmed the gap independently. The first users are explicit in the design: EY consultants administering client assessments — the platform ships with the EY Admin role for exactly that.

**G2. What does one assessment cost, who pays, who maintains it when the circular changes?**
DataPilot is an EY delivery asset first: it industrialises the assessment EY already sells, replacing weeks of bespoke spreadsheet work with a standardized, reusable instrument. Effort is bounded and parallelisable — group assessment splits the 47 indicators across the departments that own them, and the evidence demanded is documents Article 6 obliges the bank to hold anyway. Maintenance is structural: a circular amendment is one master-template update propagated to every tenant. Pricing is legitimately EY's commercial work, not a thesis deliverable — but marginal cost per additional bank on a multi-tenant platform is near zero, which is the point of Iteration 4.

**G3. Why would a bank CEO volunteer to be scored "Medium exposure" in an EY-controlled immutable database?**
Because the regulation removed the "don't measure" option: the real choice is discovering your gaps privately, with a remediation roadmap, or in front of the BCT inspector. A bad score inside your own isolated tenant is strictly better than a bad finding in an inspection report — and immutability protects the *bank*: it proves remediation progress wasn't retro-edited. No league table exists: benchmarking is proposed as anonymized and regulator-run.

**G4. Why is this better than the consulting review EY already sells?**
It is the same expertise made repeatable: standardized instrument, comparable across banks and across years, auditable line by line, and a fraction of the delivery effort. A one-off engagement can never produce a longitudinal, comparable baseline; an instrument can.

---

## H. Classic defense questions

**H1. Summarize your contribution in one sentence.**
A defensible way for a Tunisian bank to answer two questions it now legally faces — how mature is our data, and can we prove compliance — through a hybrid, regulator-anchored framework and DataPilot, the auditable multi-tenant platform that operationalises it.

**H2. What was the hardest part?**
Making the measurement *defensible* rather than just computable — the evidence cap, bounded skips, renormalization, and non-skippable regulatory core all exist because the naive version (ask people to rate themselves) collapses under the first hard question. Constraints, not features, are what turn a self-assessment into a measurement.

**H3. What would you do differently?**
Start the automated test suite on day one of Iteration 2 — the engine was born as pure functions and deserved a golden-test harness from the first week; and engage a compliance officer earlier so the Article 6 mapping carried a second signature before the defense.

**H4. What's next for the project?**
In order: the engineering hardening (single scoring module, test suite, server-side finalize), then jurisdiction-compliant hosting, then the field pilot on one real bank with a compliance-authority review of the mapping — those three gates convert a validated design into a validated measurement. What-if simulation and regulator-run benchmarking follow naturally from the deterministic engine and immutable storage.

**H5. What is the difference between the maturity score and the compliance rate?**
Maturity asks "how good are you?" — a weighted 1–5 index over all 47 indicators. Compliance asks the regulator's separate question — "are you meeting each obligation?" — a line-by-line pass/fail over the 13 regulatory indicators at effective score ≥ 3. A bank can be broadly mature with one legal hole, and the regulator cares about the hole, not the average — which is why the two views are kept side by side.

**H6. How long would a real assessment take?**
As a group assessment: the 47 indicators split across the departments that own them, so the answer is days of parallel departmental work rather than weeks of one person's — bounded mainly by evidence gathering, and the evidence is documentation Article 6 requires banks to maintain anyway. Calibrating a real effort figure is part of the field pilot.

**H7. What if a bank disagrees with its score?**
Then the system is working: every score traces to a named indicator, rubric level, and cited evidence, so the disagreement lands on a specific, inspectable line — not on the black box. The bank can challenge the evidence reading, the rubric mapping, or a weight; each is published and auditable, and none of it requires trusting me.

**H8. Why is this a software-engineering capstone and not a management study?**
The framework alone would be a management study. The engineering contribution is operationalising it: a deterministic scoring engine with anti-gaming rules, a multi-tenant platform with database-enforced isolation and a role hierarchy, and an auditability property that is architectural — immutable submissions, recomputable scores — not editorial.

---

*Cross-references: A1 weights · A2 evidence cap · A3 skips/renormalization · A4 legal anchor · A5 mapping authority · A6 simulated 2.19 · A7 GMI arithmetic · A8 compliant-at-3 · A9 two decimals · A10 group silence · A11 tenant isolation · A12 no real bank · A13 single author · A14 screening method · A15 screening matrix · A16 five frameworks*
