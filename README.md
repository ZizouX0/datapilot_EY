# DataPilot

A **data maturity self-assessment tool for banks**, built around Tunisia's **BCT Circulaire 2025-08** regulatory framework. A bank completes a structured questionnaire and DataPilot scores its data maturity across five weighted dimensions, visualizes the results, highlights gaps against a target level, and reports regulatory (BCT) compliance.

## Features

- **47-indicator assessment** across 5 weighted dimensions, each scored 1–5 on a detailed rubric with regulatory hints.
- **Weighted maturity scoring** mapped to CMMI (Initial → Optimized) and Gartner (Unaware → Transformative) levels.
- **Evidence enforcement** — any score of 3 or higher without supporting evidence is automatically capped at 2.
- **Skip controls** — BCT-mandatory indicators cannot be skipped; other indicators can be skipped up to 20% per dimension.
- **BCT compliance view** — compliance rate and risk exposure (Low / Medium / High).
- **Gap analysis** — current vs. target level per dimension, with tailored recommendations.
- **Printable report** via `react-to-print`.
- **Local persistence** — answers and profile survive a page refresh (stored in `localStorage`).

## Tech stack

| Area      | Technology                       |
| --------- | -------------------------------- |
| Framework | React 19 + Vite 8                |
| Routing   | React Router 7                   |
| State     | Zustand (with `persist`)         |
| Charts    | Recharts                         |
| Styling   | Tailwind CSS 4                   |
| Export    | react-to-print                   |

## Getting started

```bash
# Install dependencies
npm install

# Start the dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview

# Lint
npm run lint
```

## The five dimensions

| Dimension | Name                  | Weight | Notes |
| --------- | --------------------- | ------ | ----- |
| D1        | Governance            | 25%    |       |
| D2        | Data Quality          | 20%    |       |
| D3        | Architecture & Access | 20%    |       |
| D4        | Analytics & Tools     | 20%    |       |
| D5        | Skills & Culture      | 15%    | proxy |

The **global score** is the weighted average of the dimension scores. Each dimension score is the
average of its sub-dimension scores, which in turn average their effective indicator scores.

## Application flow

```
Welcome → Profile → Questionnaire (47 questions) → Results → Gap Analysis → Compliance
                                                    └─ locked until the assessment is complete
```

## Project structure

```
src/
├── App.jsx             # Routing + layout (route-based code splitting)
├── main.jsx            # App entry point
├── pages/              # Welcome, Profile, Questionnaire, Results, GapAnalysis, Compliance
├── components/
│   ├── layout/         # Topbar, NavBar, ProgressBar
│   └── ui/             # Badges and pills (BCT, Maturity, Proxy, Score, Dimension)
├── charts/             # RadarChart, DimensionBars (Recharts)
├── store/
│   └── useAppStore.js  # Zustand store: state, scoring selectors, actions, persistence
└── data/
    ├── indicators.js       # 47 indicators, dimension definitions, sub-dimension names
    └── recommendations.js  # Per-dimension recommendations by maturity band
```

## Scoring model

Scoring logic lives entirely in `src/store/useAppStore.js` as Zustand selectors:

- `getEffectiveScore` — applies the evidence cap (score ≥ 3 with no evidence → 2).
- `getSubDimScore` / `getDimScore` — average up the hierarchy, ignoring skipped/unanswered indicators.
- `getGlobalScore` — weighted average across dimensions (re-normalized over answered dimensions).
- `getMaturityLevel` — maps a score to a CMMI/Gartner maturity band.
- `getBCTCompliance` — compliance rate and risk exposure across BCT-mandatory indicators.

Assessment data (`profile`, `answers`, `targetLevel`, and active selection) is persisted to
`localStorage` under the key `datapilot-assessment`, so progress is not lost on refresh.
