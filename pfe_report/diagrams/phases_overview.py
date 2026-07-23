#!/usr/bin/env python3
"""The six project phases from framing to deployment (horizontal band).
Saves directly to ../images/phases-overview.pdf
Phase date ranges are the exact ranges from PDF_FACTS.md section B (Table 8.1).
Phases 0 to 3 are marked as the pre-coding conceptual work.
EY palette. No em-dashes or en-dashes anywhere.
"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

OUT = "../images/phases-overview.pdf"

# EY palette
PURPLE = "#3D108A"
BLUE = "#188CE5"
TEAL = "#27ACAA"
GREEN = "#2DB757"
MAGENTA = "#750E5C"
GREY = "#2E2E38"
YELLOW = "#FFE600"

PHASES = [
    ("Phase 0", "Framing",               "2 Feb to 13 Feb 2026",  PURPLE),
    ("Phase 1", "Existing analysis",     "16 Feb to 6 Mar 2026",  BLUE),
    ("Phase 2", "Needs identification",  "9 Mar to 27 Mar 2026",  TEAL),
    ("Phase 3", "Framework design",      "30 Mar to 8 May 2026",  GREEN),
    ("Phase 4", "Development",           "11 May to 3 Jul 2026",  MAGENTA),
    ("Phase 5", "Deployment",            "6 Jul to 31 Jul 2026",  GREY),
]

fig, ax = plt.subplots(figsize=(16.5, 4.6))
ax.set_xlim(0, 16.5)
ax.set_ylim(0, 4.6)
ax.axis("off")
fig.patch.set_facecolor("white")

BOX_W = 2.42
GAP = 0.24
X0 = 0.42
Y0 = 1.55
BOX_H = 1.55

for i, (num, name, dates, color) in enumerate(PHASES):
    x = X0 + i * (BOX_W + GAP)
    box = FancyBboxPatch((x, Y0), BOX_W, BOX_H,
                         boxstyle="round,pad=0.03,rounding_size=0.12",
                         facecolor=color, edgecolor="white",
                         linewidth=1.6, zorder=3)
    ax.add_patch(box)

    cx = x + BOX_W / 2
    ax.text(cx, Y0 + BOX_H - 0.36, num, ha="center", va="center",
            fontsize=15, color="white", fontweight="bold", zorder=4)
    ax.text(cx, Y0 + 0.52, name, ha="center", va="center",
            fontsize=14.5, color="white", fontweight="bold", zorder=4,
            wrap=True)
    # Date range under each box.
    ax.text(cx, Y0 - 0.34, dates, ha="center", va="center",
            fontsize=12.5, color="#4a4a52", zorder=4)

    # Arrow connector to the next phase.
    if i < len(PHASES) - 1:
        ax.annotate("", xy=(x + BOX_W + GAP - 0.015, Y0 + BOX_H / 2),
                    xytext=(x + BOX_W + 0.015, Y0 + BOX_H / 2),
                    arrowprops=dict(arrowstyle="-|>", color=GREY,
                                    lw=2.2, mutation_scale=18), zorder=2)

# Pre-coding marker: EY yellow bracket over phases 0 to 3.
bx0 = X0
bx1 = X0 + 4 * BOX_W + 3 * GAP
by = Y0 + BOX_H + 0.32
ax.plot([bx0, bx0, bx1, bx1], [by - 0.14, by, by, by - 0.14],
        color=YELLOW, linewidth=5, solid_capstyle="round", zorder=2)
ax.text((bx0 + bx1) / 2, by + 0.42,
        "Pre-coding conceptual work (phases 0 to 3)",
        ha="center", va="center", fontsize=15.5, fontweight="bold",
        color=GREY, zorder=4)

# Complementary marker for the build and rollout phases.
cx0 = X0 + 4 * (BOX_W + GAP)
cx1 = X0 + 6 * BOX_W + 5 * GAP
ax.plot([cx0, cx0, cx1, cx1], [by - 0.14, by, by, by - 0.14],
        color="#b9b9c0", linewidth=3, solid_capstyle="round", zorder=2)
ax.text((cx0 + cx1) / 2, by + 0.42, "Tool build and rollout",
        ha="center", va="center", fontsize=13.5, color="#4a4a52", zorder=4)

# Overall time direction.
ax.text(X0, 0.42, "Project start: 2 February 2026", ha="left", va="center",
        fontsize=12.5, color="#4a4a52", style="italic")
ax.text(X0 + 6 * BOX_W + 5 * GAP, 0.42, "Closure: 31 July 2026",
        ha="right", va="center", fontsize=12.5, color="#4a4a52", style="italic")

fig.tight_layout()
fig.savefig(OUT, bbox_inches="tight", pad_inches=0.2, facecolor="white")
print("wrote", OUT)
