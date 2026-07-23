# DataPilot Report Diagrams

All diagrams are generated from source files in this directory. Run each script from `/tmp/pfe_report/` to regenerate.

## Regenerating diagrams

```bash
cd /tmp/pfe_report
```

| Figure | Source file | Output file | Command |
|--------|-------------|-------------|---------|
| F1 Framework tree | `diagrams/framework_tree.py` | `images/framework-tree.pdf` | `python3 diagrams/framework_tree.py` |
| F2 Scoring flow | `diagrams/scoring_flow.py` | `images/scoring-flow.pdf` | `python3 diagrams/scoring_flow.py` |
| F3 Maturity ladder | `diagrams/maturity_ladder.py` | `images/maturity-ladder.pdf` | `python3 diagrams/maturity_ladder.py` |
| F4 Hybrid mapping | `diagrams/hybrid_mapping.py` | `images/hybrid-mapping.pdf` | `python3 diagrams/hybrid_mapping.py` |
| F5 DSR cycle | `diagrams/dsr_cycle.py` | `images/dsr-cycle.pdf` | `python3 diagrams/dsr_cycle.py` |
| F6 Use case diagram | `diagrams/usecase.puml` | `images/usecase.pdf` | `plantuml -tpdf diagrams/usecase.puml -o images/` |
| F7 Component diagram | `diagrams/component_diagram.py` | `images/component.pdf` | `python3 diagrams/component_diagram.py` |
| F8 Sequence diagram | `diagrams/sequence_scoring.puml` | `images/sequence-scoring.pdf` | `plantuml -tpdf diagrams/sequence_scoring.puml -o images/ && cp images/sequence.pdf images/sequence-scoring.pdf` |
| F9 Activity diagram | `diagrams/activity.puml` | `images/activity.pdf` | `plantuml -tpdf diagrams/activity.puml -o images/` |
| F10 State diagram | `diagrams/indicator_state.puml` | `images/indicator-state.pdf` | `plantuml -tpdf diagrams/indicator_state.puml -o images/ && cp images/state.pdf images/indicator-state.pdf` |
| F11 Survey charts | `diagrams/survey_charts.py` | `images/survey-findings.pdf` | `python3 diagrams/survey_charts.py` |
| F12 Radar profile | `diagrams/radar_profile.py` | `images/radar-profile.pdf` | `python3 diagrams/radar_profile.py` |

## Dependencies

- Python 3 with matplotlib and numpy: `pip install matplotlib numpy`
- PlantUML: `apt-get install plantuml`

## Data sources

All data is sourced directly from the codebase:
- `/home/user/datapilot_EY/src/data/indicators.js` — 5 dimensions, 12 sub-dims, 47 indicators, 13 BCT-flagged
- `/home/user/datapilot_EY/src/store/useAppStore.js` — MATURITY_LEVELS, selectors, actions
- `/home/user/datapilot_EY/src/data/recommendations.js` — actions per dimension and band
- `/home/user/datapilot_EY/src/App.jsx` — routes, RequireComplete gate
