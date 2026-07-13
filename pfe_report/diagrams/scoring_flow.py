#!/usr/bin/env python3
"""
F2 Scoring aggregation flow (left to right)
Shows the chain: Indicator -> getEffectiveScore -> getSubDimScore -> getDimScore
                           -> getGlobalScore -> getPercentage -> Maturity Level
with the aggregation rule at each step.
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch

fig, ax = plt.subplots(figsize=(22, 4.2))
ax.set_xlim(0, 22)
ax.set_ylim(1.8, 5.6)
ax.axis('off')
fig.patch.set_facecolor('white')

CHARCOAL = '#2E2E38'
PURPLE   = '#3D108A'
TEAL     = '#27ACAA'
BLUE     = '#188CE5'
MAROON   = '#750E5C'
GREEN    = '#2DB757'
GRAY     = '#9897A9'

def box(ax, cx, cy, w, h, title, subtitle, fc, tc='white', fs_t=11, fs_s=9.0):
    rect = FancyBboxPatch((cx - w/2, cy - h/2), w, h,
                          boxstyle='round,pad=0.08',
                          facecolor=fc, edgecolor='white', linewidth=1.5, zorder=3)
    ax.add_patch(rect)
    ax.text(cx, cy + 0.15, title, ha='center', va='center',
            fontsize=fs_t, color=tc, fontweight='bold', zorder=4)
    if subtitle:
        ax.text(cx, cy - 0.38, subtitle, ha='center', va='center',
                fontsize=fs_s, color=tc, style='italic', zorder=4,
                multialignment='center')

def arrow(ax, x1, y1, x2, y2, color=GRAY):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->', color=color, lw=2.2))

# Node definitions: (label_top, rule_text, color); x positions are computed
# sequentially so every pair of adjacent boxes keeps a clear gap for the arrow.
nodes = [
    ('Indicator\nraw score',      'scale 1 to 5',                CHARCOAL),
    ('getEffective\nScore()',     'evidence cap:\nscore >= 3 and\nno evidence\ncapped at 2', MAROON),
    ('getSubDim\nScore()',        'average of\neffective scores\n(nulls excluded)',  BLUE),
    ('getDim\nScore()',           'average of\nsub-dim scores\n(nulls excluded)',   PURPLE),
    ('getGlobal\nScore()  GMI',   'weighted 25/20/20/\n20/15, renormalized\nover answered weights', TEAL),
    ('getPercentage()',           'round(score x 20)\ne.g. 2.19 -> 44%',            GREEN),
    ('Maturity\nLevel',           'L1 to L5',                    CHARCOAL),
]

cy  = 3.3
h   = 2.0
widths = [2.4, 2.6, 2.6, 2.6, 2.8, 2.4, 1.8]
GAP = 0.7          # visible whitespace between adjacent boxes (arrow lives here)

# Sequential placement: left edge starts at 0.4.
centers = []
x_edge = 0.4
for w in widths:
    centers.append(x_edge + w / 2)
    x_edge += w + GAP

for i, (title, sub, fc) in enumerate(nodes):
    box(ax, centers[i], cy, widths[i], h, title, sub, fc)

# Arrows between nodes: from right edge of box i to left edge of box i+1.
for i in range(len(nodes) - 1):
    x1 = centers[i] + widths[i] / 2 + 0.06
    x2 = centers[i + 1] - widths[i + 1] / 2 - 0.06
    arrow(ax, x1, cy, x2, cy, color=GRAY)

# Title
ax.text((centers[0] + centers[-1]) / 2, 5.15,
        'Score Aggregation Chain (DataPilot)', ha='center', va='center',
        fontsize=14, color=CHARCOAL, fontweight='bold')

plt.tight_layout(pad=0.2)
plt.savefig('/tmp/pfe_report/images/scoring-flow.pdf',
            bbox_inches='tight', dpi=150, facecolor='white')
plt.savefig('/tmp/pfe_report/images/scoring-flow.png',
            bbox_inches='tight', dpi=150, facecolor='white')
print("F2 saved: scoring-flow.pdf/.png")
