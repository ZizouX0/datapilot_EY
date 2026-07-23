#!/usr/bin/env python3
"""
F11 - Survey findings horizontal bar chart (4 measurable dimensions, D5 is proxy).
Canonical survey numbers (44 respondents), from results.tex and introduction.tex:
  D1 Governance:            30%   formally approved data strategy
  D2 Data Quality:          56.8% verify data before use
  D3 Architecture & Access: 54%   slow access, 40.9% only partially centralized
  D4 Analytics & Tools:     41%   tools sufficient but limited,
                            36%   decisions data-driven vs 50% intuition
  D5 Skills & Culture:      proxy only (no direct survey measurement)
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

CHARCOAL = '#2E2E38'
PURPLE   = '#3D108A'
BLUE     = '#188CE5'
TEAL     = '#27ACAA'
GREEN    = '#2DB757'
MAROON   = '#750E5C'

plt.rcParams.update({'font.size': 14})

fig, axes = plt.subplots(2, 2, figsize=(15, 10))
fig.patch.set_facecolor('white')
fig.suptitle('',
             fontsize=19, fontweight='bold', color=CHARCOAL, y=0.99)

axes = axes.flatten()


def draw_panel(ax, title, title_color, labels, values, colors, xlabel):
    bars = ax.barh(labels, values, color=colors, edgecolor='white', height=0.55)
    ax.set_xlim(0, 100)
    ax.set_xlabel(xlabel, fontsize=14)
    ax.set_title(title, fontsize=16, fontweight='bold', color=title_color)
    ax.xaxis.set_tick_params(labelsize=13)
    ax.yaxis.set_tick_params(labelsize=13)
    for bar, v in zip(bars, values):
        txt = f'{v:.1f}%' if v != int(v) else f'{int(v)}%'
        ax.text(v + 1.5, bar.get_y() + bar.get_height() / 2, txt,
                va='center', fontsize=15, color=CHARCOAL, fontweight='bold')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.set_facecolor('white')
    ax.invert_yaxis()


# D1 Governance
draw_panel(axes[0], 'D1 Governance (25%)', PURPLE,
           ['Formal data strategy\napproved'], [30], [PURPLE],
           '% of respondents')
axes[0].set_ylim(0.6, -0.6)

# D2 Data Quality
draw_panel(axes[1], 'D2 Data Quality (20%)', BLUE,
           ['Verify data before use'], [56.8], [BLUE],
           '% of respondents')
axes[1].set_ylim(0.6, -0.6)

# D3 Architecture and Access
draw_panel(axes[2], 'D3 Architecture and Access (20%)', TEAL,
           ['Data access\nconsidered slow', 'Data only partially\ncentralized'],
           [54.0, 40.9], [TEAL, '#A0DFE0'],
           '% of respondents')

# D4 Analytics and Tools
draw_panel(axes[3], 'D4 Analytics and Tools (20%)', GREEN,
           ['Tools sufficient\nbut limited', 'Decisions data-driven',
            'Decisions by\nintuition'],
           [41.0, 36.0, 50.0], [GREEN, '#90E8A8', '#C8F2D4'],
           '% of respondents')

fig.text(0.5, 0.01,
         'D5 Skills and Culture (15%): assessed through proxy indicators only '
         '(no direct survey measurement)',
         ha='center', fontsize=14, color=MAROON, style='italic')

plt.tight_layout(rect=[0, 0.03, 1, 0.95])
plt.savefig('../images/survey-findings.pdf',
            bbox_inches='tight', dpi=150, facecolor='white')
plt.savefig('../images/survey-findings.png',
            bbox_inches='tight', dpi=150, facecolor='white')
print("F11 saved: survey-findings.pdf/.png")
