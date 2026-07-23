#!/usr/bin/env python3
"""Stakeholder interest and influence matrix (2x2).
Saves directly to ../images/stakeholder-matrix.pdf
X axis = interest, Y axis = influence.
HIGH interest and HIGH influence (Manage closely): Chief Data Officer,
Governing body/Board, EY Partner, Engagement Manager, Project team.
Remaining actors positioned across the other quadrants for engagement planning.
EY palette. No em-dashes or en-dashes anywhere.
"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

OUT = "../images/stakeholder-matrix.pdf"

# EY palette
PURPLE = "#3D108A"
BLUE = "#188CE5"
TEAL = "#27ACAA"
GREEN = "#2DB757"
MAGENTA = "#750E5C"
GREY = "#2E2E38"
YELLOW = "#FFE600"

# Quadrant tint fills (light) keyed to the EY hues.
Q_MANAGE = "#e9e4f4"   # top-right, high/high  (purple family)
Q_SATISFY = "#e3f0fb"  # top-left, high influence / low interest (blue)
Q_INFORM = "#e4f4f0"   # bottom-right, low influence / high interest (teal)
Q_MONITOR = "#f0f0f2"  # bottom-left, low/low (grey)

fig, ax = plt.subplots(figsize=(12.5, 10.0))
ax.set_xlim(0, 10)
ax.set_ylim(0, 10)

# Quadrant background fills.
ax.add_patch(Rectangle((5, 5), 5, 5, facecolor=Q_MANAGE, edgecolor="none", zorder=0))
ax.add_patch(Rectangle((0, 5), 5, 5, facecolor=Q_SATISFY, edgecolor="none", zorder=0))
ax.add_patch(Rectangle((5, 0), 5, 5, facecolor=Q_INFORM, edgecolor="none", zorder=0))
ax.add_patch(Rectangle((0, 0), 5, 5, facecolor=Q_MONITOR, edgecolor="none", zorder=0))

# Midlines.
ax.axvline(5, color=GREY, linewidth=1.6, zorder=1)
ax.axhline(5, color=GREY, linewidth=1.6, zorder=1)

# Quadrant strategy labels (outer corners of each quadrant).
ax.text(9.85, 9.75, "Manage closely", ha="right", va="top",
        fontsize=20, fontweight="bold", color=PURPLE, zorder=2)
ax.text(0.15, 9.75, "Keep satisfied", ha="left", va="top",
        fontsize=20, fontweight="bold", color=BLUE, zorder=2)
ax.text(9.85, 0.25, "Keep informed", ha="right", va="bottom",
        fontsize=20, fontweight="bold", color=TEAL, zorder=2)
ax.text(0.15, 0.25, "Monitor", ha="left", va="bottom",
        fontsize=20, fontweight="bold", color=GREY, zorder=2)

# Stakeholders: (label, x, y, marker color, label offset dy).
# Manage closely (high interest, high influence): the five key actors.
manage = [
    ("Governing body / Board", 6.4, 9.15, PURPLE, 0.40),
    ("Chief Data Officer", 8.7, 8.55, PURPLE, 0.40),
    ("Project team", 7.4, 7.25, PURPLE, 0.40),
    ("EY Partner", 9.05, 6.45, PURPLE, 0.40),
    ("Engagement Manager", 6.35, 5.85, PURPLE, 0.40),
]
# Keep satisfied (high influence, lower interest).
satisfy = [
    ("IT Manager", 2.3, 8.6, BLUE, 0.40),
    ("Risk Manager", 3.7, 7.15, BLUE, 0.40),
    ("Internal Audit", 1.7, 6.2, BLUE, 0.40),
]
# Keep informed (high interest, lower influence).
inform = [
    ("Compliance Officer", 6.35, 3.9, TEAL, 0.40),
    ("Data Manager", 8.45, 4.2, TEAL, 0.40),
    ("Sector experts", 9.0, 3.1, TEAL, 0.40),
    ("Data Owners", 7.2, 2.5, TEAL, 0.40),
]
# Monitor (lower interest, lower influence).
monitor = [
    ("Data Architect", 2.9, 2.7, GREY, 0.40),
]

for group in (manage, satisfy, inform, monitor):
    for label, x, y, color, dy in group:
        ax.scatter([x], [y], s=340, color=color, edgecolor="white",
                   linewidth=2.0, zorder=4)
        ax.text(x, y - dy, label, ha="center", va="top",
                fontsize=14.5, fontweight="bold", color="#1a1a1a", zorder=5)

# Highlight the "Manage closely" markers with an EY yellow accent ring.
for label, x, y, color, dy in manage:
    ax.scatter([x], [y], s=560, facecolors="none", edgecolors=YELLOW,
               linewidth=2.4, zorder=3)

# Axes labels with low/high anchors.
ax.set_xlabel("Interest", fontsize=19, fontweight="bold", color=GREY, labelpad=12)
ax.set_ylabel("Influence", fontsize=19, fontweight="bold", color=GREY, labelpad=12)

ax.set_xticks([2.5, 7.5])
ax.set_xticklabels(["Low", "High"], fontsize=16, color=GREY)
ax.set_yticks([2.5, 7.5])
ax.set_yticklabels(["Low", "High"], fontsize=16, color=GREY, rotation=90, va="center")

for spine in ax.spines.values():
    spine.set_edgecolor(GREY)
    spine.set_linewidth(1.4)

ax.tick_params(length=0)

fig.tight_layout()
fig.savefig(OUT, bbox_inches="tight", pad_inches=0.2)
print("wrote", OUT)
