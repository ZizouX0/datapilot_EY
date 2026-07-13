#!/usr/bin/env python3
"""
F12 - Sample radar maturity profile at Level 2 Emerging (representative).
Representative Level 2 profile (matches the results breakdown table):
  D1=1.9, D2=2.0, D3=2.5, D4=2.5, D5=2.1
Global = 0.25*1.9 + 0.20*2.0 + 0.20*2.5 + 0.20*2.5 + 0.15*2.1 = 2.19
round(2.19 * 20) = 44%  ->  Level 2 Emerging.
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

CHARCOAL = '#2E2E38'
BLUE     = '#188CE5'
MAROON   = '#750E5C'

dims = [
    'D1 Governance\n(25%)',
    'D2 Data Quality\n(20%)',
    'D3 Architecture\nand Access (20%)',
    'D4 Analytics\nand Tools (20%)',
    'D5 Skills and\nCulture (15%)',
]
current_scores = [1.9, 2.0, 2.5, 2.5, 2.1]
target_scores  = [3.0, 3.0, 3.0, 3.0, 3.0]

N = len(dims)
angles = [n / float(N) * 2 * np.pi for n in range(N)]
angles += angles[:1]

current_scores_plot = current_scores + current_scores[:1]
target_scores_plot  = target_scores  + target_scores[:1]

fig, ax = plt.subplots(figsize=(10, 10), subplot_kw=dict(polar=True))
fig.patch.set_facecolor('white')
ax.set_facecolor('white')

ax.set_ylim(0, 5)
ax.set_yticks([1, 2, 3, 4, 5])
ax.set_yticklabels(['1', '2', '3', '4', '5'], fontsize=13, color='#888888')
ax.yaxis.set_tick_params(labelsize=13)
ax.grid(color='#DDDDDD', linewidth=0.8)

ax.set_xticks(angles[:-1])
ax.set_xticklabels(dims, fontsize=14, color=CHARCOAL, fontweight='bold')

ax.fill(angles, target_scores_plot, color=MAROON, alpha=0.08)
ax.plot(angles, target_scores_plot, color=MAROON, linewidth=2.0,
        linestyle='--', label='Target Level 3 (Defined)')

ax.fill(angles, current_scores_plot, color=BLUE, alpha=0.25)
ax.plot(angles, current_scores_plot, color=BLUE, linewidth=3.0,
        linestyle='-', marker='o', markersize=9, label='Current profile')

for angle, score in zip(angles[:-1], current_scores):
    # Default label offset; push labels further out when they would land on
    # the dashed target line at 3.0 (e.g. the 2.5 scores on D3 and D4).
    offset = 0.42
    if abs((score + offset) - 3.0) < 0.25:
        offset = 0.80
    ax.text(angle, score + offset, f'{score:.1f}', ha='center', va='center',
            fontsize=14, color=BLUE, fontweight='bold')

global_score = 0.25 * 1.9 + 0.20 * 2.0 + 0.20 * 2.5 + 0.20 * 2.5 + 0.15 * 2.1
pct = round(global_score * 20)
# Place the summary badge below the radar (in axes-relative coordinates) so it
# never overlaps the D1 and D2 spokes at the centre of the plot.
ax.text(0.5, -0.16,
        f'Global: {global_score:.2f}/5   {pct}%   Level 2 Emerging',
        transform=ax.transAxes,
        ha='center', va='center', fontsize=14, color=CHARCOAL, fontweight='bold',
        bbox=dict(boxstyle='round,pad=0.5', facecolor='white',
                  edgecolor='#CCCCCC', linewidth=1.0, alpha=0.95))

ax.legend(loc='upper right', bbox_to_anchor=(1.4, 1.2), fontsize=14)
ax.set_title('',
             fontsize=16, fontweight='bold', pad=28, color=CHARCOAL)

plt.tight_layout()
plt.savefig('../images/radar-profile.pdf',
            bbox_inches='tight', dpi=150, facecolor='white')
plt.savefig('../images/radar-profile.png',
            bbox_inches='tight', dpi=150, facecolor='white')
print("F12 saved: radar-profile.pdf/.png")
