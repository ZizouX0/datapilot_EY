#!/usr/bin/env python3
"""Three-phase improvement roadmap derived from the gap analysis.
Saves directly to ../images/roadmap.pdf
Phases map to recommendations.js bands:
  Phase 1 Critical  -> low band  (dimension score < 2.0)
  Phase 2 High      -> mid band  (dimension score < 3.0)
  Phase 3 Moderate  -> high band (dimension score >= 3.0)
Example action themes are drawn verbatim in spirit from recommendations.js.
No em-dashes or en-dashes anywhere.
"""
import textwrap
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrow

OUT = "../images/roadmap.pdf"

phases = [
    {
        "num": "Phase 1",
        "priority": "Critical priority",
        "band": "Low band, dimension score below 2.0",
        "color": "#750E5C",
        "actions": [
            "Approve a data strategy document at board level",
            "Appoint a CDO or equivalent with executive mandate",
            "Apply mandatory quality controls on regulatory reporting data",
        ],
    },
    {
        "num": "Phase 2",
        "priority": "High priority",
        "band": "Mid band, dimension score below 3.0",
        "color": "#188CE5",
        "actions": [
            "Automate key data quality controls in critical pipelines",
            "Document end-to-end lineage for regulatory reporting data",
            "Launch a self-service analytics capability with training",
        ],
    },
    {
        "num": "Phase 3",
        "priority": "Moderate priority",
        "band": "High band, dimension score at or above 3.0",
        "color": "#2DB757",
        "actions": [
            "Deploy real-time data quality dashboards for management",
            "Introduce advanced analytics and machine learning use cases",
            "Measure data culture adoption with an annual index",
        ],
    },
]

fig, ax = plt.subplots(figsize=(11.5, 6.6))
ax.set_xlim(0, 30)
ax.set_ylim(0, 10)
ax.axis("off")

box_w = 8.6
gap = 1.6
x0 = 0.4
top = 9.3
box_h = 8.2

for i, p in enumerate(phases):
    x = x0 + i * (box_w + gap)

    # Header band
    header = FancyBboxPatch(
        (x, top - 1.6), box_w, 1.6,
        boxstyle="round,pad=0.02,rounding_size=0.18",
        facecolor=p["color"], edgecolor="none",
    )
    ax.add_patch(header)

    # Body
    body = FancyBboxPatch(
        (x, top - box_h), box_w, box_h - 1.7,
        boxstyle="round,pad=0.02,rounding_size=0.18",
        facecolor="#f4f4f7", edgecolor=p["color"], linewidth=2.0,
    )
    ax.add_patch(body)

    cx = x + box_w / 2.0
    ax.text(cx, top - 0.55, p["num"], ha="center", va="center",
            fontsize=19, fontweight="bold", color="white")
    ax.text(cx, top - 1.20, p["priority"], ha="center", va="center",
            fontsize=13, fontweight="bold", color="white")

    ax.text(cx, top - 2.35, p["band"], ha="center", va="center",
            fontsize=11, style="italic", color=p["color"])

    ay = top - 3.35
    for act in p["actions"]:
        wrapped = textwrap.fill(act, width=30)
        n_lines = wrapped.count("\n") + 1
        ax.text(x + 0.40, ay, "•", ha="left", va="top",
                fontsize=14, fontweight="bold", color=p["color"])
        ax.text(x + 0.85, ay, wrapped, ha="left", va="top",
                fontsize=11.5, color="#1a1a1a", linespacing=1.25)
        ay -= 0.62 * n_lines + 0.55

    # Arrow to next phase
    if i < len(phases) - 1:
        ax.add_patch(FancyArrow(
            x + box_w + 0.15, top - box_h / 2.0, gap - 0.5, 0,
            width=0.28, head_width=0.9, head_length=0.7,
            length_includes_head=True, color="#9aa0a6",
        ))

fig.tight_layout()
fig.savefig(OUT, bbox_inches="tight", pad_inches=0.2)
print("wrote", OUT)
