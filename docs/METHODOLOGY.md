# Scoring methodology

This document explains exactly how DataPilot turns answers into a maturity score, a compliance rate, a gap analysis and a roadmap. The maths lives in two mirrored places that always agree:

- [`src/lib/scoring.js`](../src/lib/scoring.js) — pure functions, used by the **group** (Model B) path and trivially testable.
- [`src/store/useAppStore.js`](../src/store/useAppStore.js) — the **solo** path, mirroring the same rules.

The questionnaire itself lives in [`src/data/indicators.js`](../src/data/indicators.js).

---

## 1. The five dimensions

| Dim | Name | Weight | Sub‑dimensions | Notes |
| --- | ---- | ------ | -------------- | ----- |
| **D1** | Governance | **0.25** | 1.1, 1.2, 1.3 | Strategy, ownership, accountability, regulatory compliance |
| **D2** | Data Quality | **0.20** | 2.1, 2.2, 2.3 | Accuracy, completeness, timeliness, traceability |
| **D3** | Architecture & Access | **0.20** | 3.1, 3.2 | Centralisation, integration, pipelines, controlled access |
| **D4** | Analytics & Tools | **0.20** | 4.1, 4.2 | BI/analytics maturity, data‑driven decisions |
| **D5** | Skills & Culture | **0.15** | 5.1, 5.2 | People, talent, data culture — assessed via **proxy** signals |

Weights sum to **1.00**. There are **47 indicators** in total (D1:12, D2:11, D3:8, D4:8, D5:8), of which **13** are flagged **BCT** (regulatory).

---

## 2. One indicator → an effective score

Each indicator is answered on a **1–5** rubric (each level has an explicit description). Two adjustments produce the *effective* score used in all aggregation:

```js
effectiveScore(answer):
  if answer is skipped or unanswered        → null   (contributes nothing)
  if score >= 3 AND no evidence text given  → 2      (evidence cap)
  otherwise                                 → score
```

- **Evidence cap.** Claiming "Defined" or higher (≥3) without writing any supporting evidence is capped to 2. This is an anti‑inflation control: self‑assessments tend to over‑rate, so a high claim must be substantiated.
- **Skipped / unanswered** indicators are dropped from the average entirely (not counted as 0).

---

## 3. Aggregation: indicator → sub‑dimension → dimension → global

```
sub‑dimension score = mean of its indicators' effective scores (ignoring nulls)
dimension score     = mean of its sub‑dimension scores
global score        = weighted mean of dimension scores, weighted by dimension weight
```

- Aggregation is **unweighted (a plain mean)** within a dimension (across sub‑dimensions and indicators), and **weighted** only at the top (across dimensions).
- If a whole dimension is unanswered it is excluded and the remaining weights are **re‑normalised**, so the global score is always on the 1–5 scale.
- **Degenerate‑weight guard:** if all dimension weights are 0 (e.g. an admin blanked them), the global score falls back to an *unweighted* mean instead of producing `0`/`NaN`. The solo and group implementations use the identical fallback.

### Worked example
A dimension with sub‑dimensions scoring 3.0 and 4.0 → dimension = 3.5. If D1 (weight 0.25) = 3.5 and every other dimension = 3.0, the global score = `0.25×3.5 + 0.75×3.0 = 3.125 ≈ 3.13`.

---

## 4. Maturity bands

The 1–5 global (or dimension) score maps to a labelled band:

| Level | Score range | CMMI | Gartner |
| ----- | ----------- | ---- | ------- |
| 1 | 1.00 – 1.79 | Initial | Unaware |
| 2 | 1.80 – 2.59 | Emerging | Aware |
| 3 | 2.60 – 3.39 | Defined | Active |
| 4 | 3.40 – 4.19 | Managed | Effective |
| 5 | 4.20 – 5.00 | Optimized | Transformative |

The band lookup selects the **highest band whose minimum the score reaches** (it never falls into a gap between band maxima), and defaults to Level 1 below 1.0 — so a low score is never mislabelled as Optimized.

---

## 5. Skip rule

- BCT‑mandatory indicators **can never be skipped** — regulatory items must be answered.
- Other indicators can be skipped up to **20% per dimension**: `limit = floor(0.20 × indicatorsInDimension)`.
- Because of the floor, small dimensions allow fewer skips (e.g. 8 indicators → 1 skip). Skipped indicators are excluded from the average.

> Methodological caveat: respondents tend to skip items they would score low, so list‑wise deletion can bias a score slightly upward. A future improvement is a per‑dimension coverage caveat ("low confidence") when too many indicators are skipped.

---

## 6. BCT regulatory compliance

Computed **separately** from the maturity index (you can be mature but non‑compliant, or vice‑versa). It is a binary pass/fail over the 13 BCT‑flagged indicators:

```
compliant if effectiveScore >= 3      (process is at least "Defined")
rate = round(compliant / totalBCT × 100)%
exposure:  ≥ 80% Low   ·   50–79% Medium   ·   < 50% High
```

Note the evidence cap interacts here: a BCT indicator scored ≥3 **without evidence** is capped to 2 and therefore counts as **non‑compliant** — intentional strictness. The BCT indicators also contribute to their maturity dimensions (they are dual‑purposed), which is disclosed here for transparency.

---

## 7. Gap analysis & roadmap

The bank picks a **target level** (default 3). For every sub‑dimension below target:

- **Gap** = target − current.
- **Priority** (severity): a BCT gap is always *Critical*; otherwise `< 2.0 Critical`, `< 2.6 High`, `< 3.4 Moderate`, else *Low*.
- **Phase** (horizon): a BCT gap or score `< 2.0` → **Phase 1 (0–3 months)**; `< 3.0` → **Phase 2 (3–6 months)**; else **Phase 3 (6–12 months)**.
- **Impact** ranking = `dimension weight × gap`, with a large boost so regulatory gaps lead.
- **Effort** is an estimate from gap size and dimension weight (a proxy, not a costed plan).

Each item carries 2–3 recommended actions. By default these come from a built‑in recommendation library ([`src/data/recommendations.js`](../src/data/recommendations.js)); optionally, the **AI roadmap** endpoint generates tailored actions for the specific gaps and BCT requirements. The roadmap builder is [`src/lib/roadmap.js`](../src/lib/roadmap.js).

---

## 8. Honest notes on the model (for reviewers / thesis defence)

These are deliberate modelling choices worth stating openly:

- **Mean‑of‑means aggregation** can mask a single critical low indicator: a failing item averaged with strong ones can disappear from the headline. A stronger model would also report the **minimum / dispersion** per dimension, or apply a gating rule (a dimension can't be rated far above its weakest required practice). DataPilot currently reports the mean.
- **Dimension weights** (0.25/0.20/0.20/0.20/0.15) are an expert judgement, not derived; they should be **disclosed** and ideally backed by a **sensitivity analysis** (how the global score changes under equal vs. chosen weights).
- **Equal weighting below the dimension level** means an indicator's influence depends partly on how many indicators sit in its sub‑dimension — an artifact of bucketing rather than a deliberate priority.
- **Coverage vs. DAMA‑DMBOK:** the five dimensions cover governance, quality, architecture and analytics well; **data security & privacy** is comparatively light for a bank and is a candidate for its own dimension.

None of these are bugs — they are the model's assumptions, surfaced so results are interpreted correctly.
