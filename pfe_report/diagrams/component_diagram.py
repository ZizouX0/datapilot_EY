#!/usr/bin/env python3
"""
F7 - Component architecture of DataPilot
Real folder structure from the codebase.
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

CHARCOAL = '#2E2E38'
PURPLE   = '#3D108A'
TEAL     = '#27ACAA'
BLUE     = '#188CE5'
MAROON   = '#750E5C'
GREEN    = '#2DB757'
GRAY     = '#9897A9'

fig, ax = plt.subplots(figsize=(18, 11))
ax.set_xlim(0, 18)
ax.set_ylim(0, 11)
ax.axis('off')
fig.patch.set_facecolor('white')

def draw_box(ax, cx, cy, w, h, title, items, title_fc, item_fc='#F5F5FA',
             title_tc='white', item_tc='#2E2E38', fs_title=11, fs_item=9):
    title_h = 0.52
    bar = FancyBboxPatch((cx - w/2, cy + h/2 - title_h), w, title_h,
                         boxstyle='round,pad=0.0',
                         facecolor=title_fc, edgecolor='none', linewidth=0, zorder=3)
    ax.add_patch(bar)
    body = FancyBboxPatch((cx - w/2, cy - h/2), w, h,
                          boxstyle='round,pad=0.05',
                          facecolor=item_fc, edgecolor=title_fc,
                          linewidth=1.5, zorder=2)
    ax.add_patch(body)
    ax.text(cx, cy + h/2 - title_h/2, title, ha='center', va='center',
            fontsize=fs_title, color=title_tc, fontweight='bold', zorder=5)
    # Distribute item lines evenly within the body area, below the title bar.
    body_top = cy + h/2 - title_h
    body_bottom = cy - h/2
    n = len(items)
    avail = body_top - body_bottom
    for i, item in enumerate(items):
        item_y = body_top - avail * (i + 0.5) / n
        ax.text(cx, item_y, item, ha='center', va='center',
                fontsize=fs_item, color=item_tc, zorder=5,
                multialignment='center')

def arrow(ax, x1, y1, x2, y2, color=GRAY, style='->'):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle=style, color=color, lw=1.6,
                                connectionstyle='arc3,rad=0.0'))

# ── Router ──────────────────────────────────────────────────────────────
draw_box(ax, 2.2, 8.2, 3.2, 1.7,
         'Router (App.jsx)',
         ['React Router 7',
          'Lazy code-split routes',
          'RequireComplete gate',
          'Unknown route to /'],
         CHARCOAL)

# ── Pages ───────────────────────────────────────────────────────────────
draw_box(ax, 7.0, 9.5, 3.8, 2.2,
         'pages/',
         ['Welcome (/)',
          'Profile (/profile)',
          'Questionnaire (/assessment)',
          'Results (/results)',
          'GapAnalysis (/gap-analysis)',
          'Compliance (/compliance)'],
         PURPLE)

# ── Components ──────────────────────────────────────────────────────────
draw_box(ax, 12.0, 9.5, 3.8, 2.2,
         'components/',
         ['layout: Topbar, NavBar,',
          '  ProgressBar',
          'ui: ScoreBadge, MaturityBadge,',
          '  BCTBadge, ProxyBadge,',
          '  DimensionPill'],
         BLUE)

# ── Charts ──────────────────────────────────────────────────────────────
draw_box(ax, 16.0, 8.2, 3.2, 1.4,
         'charts/',
         ['RadarChart (Recharts 3)',
          'DimensionBars (Recharts 3)'],
         TEAL)

# ── Store ───────────────────────────────────────────────────────────────
draw_box(ax, 7.0, 4.7, 4.4, 3.9,
         'store/useAppStore.js (Zustand 5)',
         ['State: profile, answers,',
          '  targetLevel, activeDimension,',
          '  activeSubDim',
          'Selectors: getEffectiveScore,',
          '  getSubDimScore, getDimScore,',
          '  getGlobalScore, getPercentage,',
          '  getBCTCompliance',
          'Actions: setAnswer, setEvidence,',
          '  skipIndicator, unskipIndicator,',
          '  setTargetLevel, resetAll'],
         MAROON)

# ── localStorage ────────────────────────────────────────────────────────
draw_box(ax, 2.2, 4.8, 3.2, 1.4,
         'localStorage (persist)',
         ['key: datapilot-assessment',
          'version 1, partialize:',
          'profile, answers, targetLevel'],
         '#555555')

# ── Data: indicators ────────────────────────────────────────────────────
draw_box(ax, 12.0, 4.8, 3.8, 2.0,
         'data/indicators.js',
         ['5 dimensions (weights)',
          '12 sub-dimensions',
          '47 indicators',
          '13 BCT-flagged indicators'],
         GREEN)

# ── Data: recommendations ───────────────────────────────────────────────
draw_box(ax, 16.0, 4.8, 3.2, 1.6,
         'data/recommendations.js',
         ['Actions per dimension',
          '3 bands: low/mid/high'],
         '#8B6914')

# ── Arrows ───────────────────────────────────────────────────────────────
arrow(ax, 2.2 + 1.6, 8.2, 7.0 - 1.9, 9.5, PURPLE)
arrow(ax, 7.0 + 1.9, 9.5, 12.0 - 1.9, 9.5, BLUE)
arrow(ax, 7.0 + 1.9, 9.0, 16.0 - 1.6, 8.5, TEAL)
arrow(ax, 7.0, 8.4, 7.0, 4.8 + 1.6, MAROON)
arrow(ax, 7.0 - 2.2, 4.8, 2.2 + 1.6, 4.8, '#555555')
arrow(ax, 7.0 + 2.2, 4.9, 12.0 - 1.9, 4.9, GREEN)
arrow(ax, 7.0 + 2.2, 3.7, 16.0 - 1.6, 4.0, '#8B6914')
ax.text(11.6, 3.55, 'GapAnalysis uses', fontsize=9, color='#8B6914',
        style='italic', ha='center')

ax.text(9.0, 1.8,
        'Stack: React 19, Vite 8, React Router 7, Tailwind CSS 4, Recharts 3.  '
        'PDF export via react-to-print 3 from Results and Compliance.',
        ha='center', va='center', fontsize=10, color='#555555', style='italic',
        bbox=dict(boxstyle='round,pad=0.4', facecolor='#F9F9F9',
                  edgecolor='#CCCCCC', linewidth=0.8))

ax.set_title('Component Architecture of DataPilot',
             fontsize=14, fontweight='bold', pad=10, color=CHARCOAL)

plt.tight_layout(pad=0.3)
plt.savefig('/tmp/pfe_report/images/component.pdf',
            bbox_inches='tight', dpi=150, facecolor='white')
plt.savefig('/tmp/pfe_report/images/component.png',
            bbox_inches='tight', dpi=150, facecolor='white')
print("F7 saved: component.pdf/.png")
