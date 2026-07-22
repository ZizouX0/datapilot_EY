#!/usr/bin/env python3
"""Bar chart: coverage of the thirteen BCT regulatory indicators per dimension.
Saves directly to ../images/bct-coverage.pdf
Facts (APP_SPEC): D1=7, D2=3, D3=2, D4=1, D5=0 (total 13).
App colors: #3D108A, #188CE5, #27ACAA, #2DB757, #750E5C.
"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

OUT = "../images/bct-coverage.pdf"

dims = [
    "Governance",
    "Data Quality",
    "Architecture\nand Access",
    "Analytics\nand Tools",
    "Skills\nand Culture",
]
counts = [7, 3, 2, 1, 0]
colors = ["#3D108A", "#188CE5", "#27ACAA", "#2DB757", "#750E5C"]

fig, ax = plt.subplots(figsize=(9.2, 6.2))

bars = ax.bar(dims, counts, color=colors, edgecolor="white", linewidth=1.2, width=0.68)

for bar, c in zip(bars, counts):
    ax.text(
        bar.get_x() + bar.get_width() / 2.0,
        bar.get_height() + 0.12,
        str(c),
        ha="center",
        va="bottom",
        fontsize=18,
        fontweight="bold",
        color="#1a1a1a",
    )

ax.set_ylabel("Number of regulatory indicators", fontsize=16, fontweight="bold")
ax.set_xlabel("Maturity dimension", fontsize=16, fontweight="bold")
ax.set_ylim(0, 8)
ax.set_yticks(range(0, 9))
ax.tick_params(axis="x", labelsize=14)
ax.tick_params(axis="y", labelsize=13)

ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)
ax.grid(axis="y", linestyle="--", alpha=0.35)
ax.set_axisbelow(True)

ax.set_title("", fontsize=15,
             fontweight="bold", color="#3D108A", pad=12)

fig.tight_layout()
fig.savefig(OUT, bbox_inches="tight", pad_inches=0.15)
print("wrote", OUT)
