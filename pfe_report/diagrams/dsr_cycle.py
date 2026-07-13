#!/usr/bin/env python3
"""
F5 — DSR regulative cycle with 5 activities in a circle + 3 iterations below.
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch
import numpy as np

CHARCOAL = '#2E2E38'
PURPLE   = '#3D108A'
TEAL     = '#27ACAA'
BLUE     = '#188CE5'
MAROON   = '#750E5C'
GREEN    = '#2DB757'
GRAY     = '#9897A9'

ACTIVITIES = [
    'Problem\nInvestigation',
    'Solution\nDesign',
    'Design\nValidation',
    'Solution\nImplementation',
    'Solution\nEvaluation',
]

ITER_COLORS = [PURPLE, TEAL, BLUE, GREEN]
ITERS = [
    ('Iteration 1', 'Maturity\nFramework'),
    ('Iteration 2', 'Scoring\nMethodology'),
    ('Iteration 3', 'DataPilot\nTool'),
    ('Iteration 4', 'Multi-Tenant\nPlatform'),
]

fig, ax = plt.subplots(figsize=(14, 11))
ax.set_xlim(0, 14)
ax.set_ylim(0, 11)
ax.axis('off')
fig.patch.set_facecolor('white')

cx, cy = 7.0, 7.0
radius = 3.0
n = len(ACTIVITIES)

node_positions = []
for i in range(n):
    angle = np.pi/2 - i * (2 * np.pi / n)
    x = cx + radius * np.cos(angle)
    y = cy + radius * np.sin(angle)
    node_positions.append((x, y))

act_colors = [PURPLE, BLUE, TEAL, GREEN, MAROON]

for i in range(n):
    x1, y1 = node_positions[i]
    x2, y2 = node_positions[(i + 1) % n]
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='-|>', color=act_colors[i], lw=2.6,
                                connectionstyle='arc3,rad=0.25'))

BOX_W, BOX_H = 2.3, 0.85
for i, (act, (x, y)) in enumerate(zip(ACTIVITIES, node_positions)):
    rect = FancyBboxPatch((x - BOX_W/2, y - BOX_H/2), BOX_W, BOX_H,
                          boxstyle='round,pad=0.06',
                          facecolor=act_colors[i], edgecolor='white',
                          linewidth=1.5, zorder=3)
    ax.add_patch(rect)
    ax.text(x, y, act, ha='center', va='center',
            fontsize=11, color='white', fontweight='bold',
            multialignment='center', zorder=4)

ax.text(cx, cy, 'DSR\nRegulative\nCycle', ha='center', va='center',
        fontsize=12, color=CHARCOAL, fontweight='bold',
        multialignment='center',
        bbox=dict(boxstyle='circle,pad=0.4', facecolor='#F0F0F5',
                  edgecolor=CHARCOAL, linewidth=1.2))

iter_x_positions = [1.9, 5.3, 8.7, 12.1]
iter_y = 1.6

ax.text(7.0, 3.0, 'Applied across four iterations:', ha='center',
        fontsize=11, color='#555555', style='italic')

for j, ((it_label, it_desc), ix) in enumerate(zip(ITERS, iter_x_positions)):
    rect = FancyBboxPatch((ix - 1.55, iter_y - 0.55), 3.1, 1.1,
                          boxstyle='round,pad=0.07',
                          facecolor=ITER_COLORS[j], edgecolor='white',
                          linewidth=1.5, zorder=3)
    ax.add_patch(rect)
    ax.text(ix, iter_y + 0.15, it_label, ha='center', va='center',
            fontsize=11.5, color='white', fontweight='bold', zorder=4)
    ax.text(ix, iter_y - 0.22, it_desc, ha='center', va='center',
            fontsize=10, color='white', style='italic',
            multialignment='center', zorder=4)

plt.tight_layout(pad=0.3)
plt.savefig('../images/dsr-cycle.pdf',
            bbox_inches='tight', dpi=150, facecolor='white')
plt.savefig('../images/dsr-cycle.png',
            bbox_inches='tight', dpi=150, facecolor='white')
print("F5 saved: dsr-cycle.pdf/.png")
