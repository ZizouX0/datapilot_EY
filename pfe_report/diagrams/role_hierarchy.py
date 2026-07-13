#!/usr/bin/env python3
"""Figure: the four-role hierarchy of the DataPilot platform.

Four tiers top-down (EY Admin owner rank 3, Super Admin rank 2, Admin rank 1,
Analyst rank 0), scope boxes on the right (all banks / one bank / self),
one-step-down invite arrows between tiers, and short capability notes.
Output: /tmp/pfe_report/images/role-hierarchy.pdf
EY palette: #3D108A #188CE5 #27ACAA #2DB757 #750E5C #2E2E38, accent #FFE600.
No em or en dashes anywhere in the figure text.
"""

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

EY_PURPLE = "#3D108A"
EY_BLUE = "#188CE5"
EY_TEAL = "#27ACAA"
EY_GREEN = "#2DB757"
EY_DARK = "#2E2E38"
EY_YELLOW = "#FFE600"

fig, ax = plt.subplots(figsize=(10.2, 7.4))
ax.set_xlim(0, 10.2)
ax.set_ylim(0, 7.4)
ax.axis("off")

# ---------------------------------------------------------------- tiers
# (y_center, color, role, rank, capabilities)
TIER_H = 1.30
tiers = [
    (6.45, EY_PURPLE, "EY Admin (owner)", "rank 3",
     ["edits the EY master template", "reviews all banks' submissions",
      "invites Super Admins"]),
    (4.75, EY_BLUE, "Super Admin", "rank 2",
     ["manages departments", "role and account management",
      "invites Admins"]),
    (3.05, EY_TEAL, "Admin", "rank 1",
     ["edits the bank questionnaire copy", "runs the group assessment",
      "invites Analysts"]),
    (1.35, EY_GREEN, "Analyst", "rank 0",
     ["fills and submits assessments", "solo or assigned dimensions",
      "invites nobody"]),
]

BOX_X, BOX_W = 0.55, 6.55
for yc, color, role, rank, caps in tiers:
    box = FancyBboxPatch((BOX_X, yc - TIER_H / 2), BOX_W, TIER_H,
                         boxstyle="round,pad=0.03,rounding_size=0.10",
                         facecolor=color, edgecolor="none", zorder=2)
    ax.add_patch(box)
    # role name and rank badge
    ax.text(BOX_X + 0.28, yc + 0.32, role, ha="left", va="center",
            fontsize=15.5, fontweight="bold", color="white", zorder=3)
    ax.text(BOX_X + 0.28, yc - 0.02, rank, ha="left", va="center",
            fontsize=11.5, fontweight="bold", color=EY_YELLOW, zorder=3)
    # capability notes (3 to 5 words each)
    for i, cap in enumerate(caps):
        ax.text(BOX_X + 3.05, yc + 0.38 - i * 0.38, cap, ha="left",
                va="center", fontsize=11.5, color="white", zorder=3)
    # thin separator between name column and capabilities
    ax.plot([BOX_X + 2.85, BOX_X + 2.85],
            [yc - TIER_H / 2 + 0.14, yc + TIER_H / 2 - 0.14],
            color="white", lw=1.0, alpha=0.55, zorder=3)

# ------------------------------------------------------- invite arrows
ARROW_X = BOX_X - 0.02
for (y_top, *_), (y_bot, *_) in zip(tiers[:-1], tiers[1:]):
    y1 = y_top - TIER_H / 2 + 0.06
    y2 = y_bot + TIER_H / 2 - 0.06
    arr = FancyArrowPatch((ARROW_X + 1.45, y1), (ARROW_X + 1.45, y2),
                          arrowstyle="-|>", mutation_scale=22,
                          lw=2.6, color=EY_DARK, zorder=4)
    ax.add_patch(arr)
    ax.text(ARROW_X + 1.62, (y1 + y2) / 2, "invites (one rank down)",
            ha="left", va="center", fontsize=11, color=EY_DARK,
            style="italic", zorder=4,
            bbox=dict(boxstyle="round,pad=0.18", facecolor="white",
                      edgecolor="none", alpha=0.9))

# --------------------------------------------------------- scope boxes
SC_X, SC_W = 7.55, 2.25

def scope_box(y_lo, y_hi, label, sub):
    box = FancyBboxPatch((SC_X, y_lo), SC_W, y_hi - y_lo,
                         boxstyle="round,pad=0.03,rounding_size=0.10",
                         facecolor="white", edgecolor=EY_DARK,
                         lw=1.6, zorder=2)
    ax.add_patch(box)
    yc = (y_lo + y_hi) / 2
    ax.text(SC_X + SC_W / 2, yc + 0.17, label, ha="center", va="center",
            fontsize=13, fontweight="bold", color=EY_DARK, zorder=3)
    ax.text(SC_X + SC_W / 2, yc - 0.22, sub, ha="center", va="center",
            fontsize=10.5, color=EY_DARK, zorder=3)

scope_box(6.45 - TIER_H / 2, 6.45 + TIER_H / 2,
          "Scope: all banks", "no bank of its own")
scope_box(3.05 - TIER_H / 2, 4.75 + TIER_H / 2,
          "Scope: one bank", "bank name is the tenant key")
scope_box(1.35 - TIER_H / 2, 1.35 + TIER_H / 2,
          "Scope: self", "own answers and account")

# connectors from tiers to scope boxes
for yc in (6.45, 4.75, 3.05, 1.35):
    ax.plot([BOX_X + BOX_W + 0.04, SC_X - 0.04], [yc, yc],
            color=EY_DARK, lw=1.1, ls=(0, (3, 3)), zorder=1)

ax.set_title("DataPilot role hierarchy: ranks, scopes, and the invite chain",
             fontsize=15, fontweight="bold", color=EY_DARK, pad=12)

fig.tight_layout()
fig.savefig("/tmp/pfe_report/images/role-hierarchy.pdf", bbox_inches="tight")
print("wrote /tmp/pfe_report/images/role-hierarchy.pdf")
