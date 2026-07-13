#!/usr/bin/env python3
"""Donut chart of the five dimension weights in the Global Maturity Index.
Saves directly to /tmp/pfe_report/images/weight-distribution.pdf
Facts (APP_SPEC): D1 Governance 25, D2 Data Quality 20,
D3 Architecture and Access 20, D4 Analytics and Tools 20, D5 Skills and Culture 15.
App colors: #3D108A, #188CE5, #27ACAA, #2DB757, #750E5C.
"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

OUT = "/tmp/pfe_report/images/weight-distribution.pdf"

labels = [
    "Governance",
    "Data Quality",
    "Architecture and Access",
    "Analytics and Tools",
    "Skills and Culture",
]
weights = [25, 20, 20, 20, 15]
colors = ["#3D108A", "#188CE5", "#27ACAA", "#2DB757", "#750E5C"]

fig, ax = plt.subplots(figsize=(9.0, 7.2))

wedges, _ = ax.pie(
    weights,
    colors=colors,
    startangle=90,
    counterclock=False,
    wedgeprops=dict(width=0.42, edgecolor="white", linewidth=2.5),
)

# Place a two-line label (name + percent) outside each slice.
for wedge, label, weight in zip(wedges, labels, weights):
    ang = (wedge.theta2 + wedge.theta1) / 2.0
    import math
    x = math.cos(math.radians(ang))
    y = math.sin(math.radians(ang))
    ha = "left" if x >= 0 else "right"
    ax.annotate(
        f"{label}\n{weight}%",
        xy=(x * 0.80, y * 0.80),
        xytext=(x * 1.22, y * 1.18),
        ha=ha,
        va="center",
        fontsize=17,
        fontweight="bold",
        color="#1a1a1a",
        arrowprops=dict(arrowstyle="-", color="#888888", lw=1.4),
    )

ax.text(0, 0, "GMI\nweights", ha="center", va="center",
        fontsize=18, fontweight="bold", color="#3D108A")

ax.set_aspect("equal")
ax.set_xlim(-1.55, 1.55)
ax.set_ylim(-1.35, 1.35)

fig.tight_layout()
fig.savefig(OUT, bbox_inches="tight", pad_inches=0.15)
print("wrote", OUT)
