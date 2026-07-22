#!/usr/bin/env python3
"""
F3 Maturity ladder: ascending steps left to right.
Real MATURITY_LEVELS from useAppStore.js.
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

# Colors: EY palette progression (maroon, purple, blue, teal, green).
LEVELS = [
    {'level': 1, 'cmmi': 'Initial',    'gartner': 'Unaware',       'color': '#750E5C', 'range': '1.00 to 1.79'},
    {'level': 2, 'cmmi': 'Emerging',   'gartner': 'Aware',         'color': '#3D108A', 'range': '1.80 to 2.59'},
    {'level': 3, 'cmmi': 'Defined',    'gartner': 'Active',        'color': '#188CE5', 'range': '2.60 to 3.39'},
    {'level': 4, 'cmmi': 'Managed',    'gartner': 'Effective',     'color': '#27ACAA', 'range': '3.40 to 4.19'},
    {'level': 5, 'cmmi': 'Optimized',  'gartner': 'Transformative','color': '#2DB757', 'range': '4.20 to 5.00'},
]

fig, ax = plt.subplots(figsize=(16, 8))
ax.set_xlim(0, 16)
ax.set_ylim(0, 8)
ax.axis('off')
fig.patch.set_facecolor('white')

CHARCOAL = '#2E2E38'

# Base step tall enough that the L numeral (top), CMMI label (middle) and
# Gartner label (bottom) never overlap, even on the shortest L1 box.
step_w = 2.5
step_base_h = 1.7
step_h_inc = 0.5

for i, lvl in enumerate(LEVELS):
    step_h = step_base_h + i * step_h_inc
    x_left = 0.8 + i * (step_w + 0.1)
    y_bottom = 1.2 + i * 0.55

    rect = FancyBboxPatch((x_left, y_bottom), step_w, step_h,
                          boxstyle='round,pad=0.05',
                          facecolor=lvl['color'], edgecolor='white',
                          linewidth=2, zorder=3)
    ax.add_patch(rect)

    ax.text(x_left + step_w/2, y_bottom + step_h - 0.42,
            f"Level {lvl['level']}", ha='center', va='center',
            fontsize=16, color='white', fontweight='bold', zorder=4)

    ax.text(x_left + step_w/2, y_bottom + step_h/2,
            lvl['cmmi'], ha='center', va='center',
            fontsize=13, color='white', fontweight='bold', zorder=4)

    ax.text(x_left + step_w/2, y_bottom + 0.28,
            f'"{lvl["gartner"]}"', ha='center', va='center',
            fontsize=11, color='white', style='italic', zorder=4)

    ax.text(x_left + step_w/2, y_bottom - 0.35,
            lvl['range'], ha='center', va='center',
            fontsize=11, color='#555555', zorder=4)

# Arrow showing direction: drawn as a plain patch with a low zorder so it
# passes BEHIND the boxes (zorder 3) and never strikes through the box text.
# (annotate() would ignore zorder for its arrow, so use FancyArrowPatch.)
direction_arrow = FancyArrowPatch((0.5, 1.3), (15.5, 7.5),
                                  arrowstyle='->', mutation_scale=22,
                                  color='#AAAAAA', lw=1.8, zorder=1)
ax.add_patch(direction_arrow)
ax.text(8.0, 0.45, 'Increasing maturity', ha='center', va='center',
        fontsize=11, color='#888888', style='italic')

plt.tight_layout(pad=0.2)
plt.savefig('../images/maturity-ladder.pdf',
            bbox_inches='tight', dpi=150, facecolor='white')
plt.savefig('../images/maturity-ladder.png',
            bbox_inches='tight', dpi=150, facecolor='white')
print("F3 saved: maturity-ladder.pdf/.png")
