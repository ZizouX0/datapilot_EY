#!/usr/bin/env python3
"""
User journey figure: end to end DataPilot session, Welcome to printable export.
6 numbered stations + completion gate diamond + export chip, rule callout cards
under the Questionnaire station, persistence ribbon across the bottom.
Solo path of the platform: identity is read-only from the invited account,
so there is no Profile station. Grounded in App.jsx routes and page code.
EY palette. No dash glyphs.
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Polygon, Circle, Rectangle

PURPLE   = '#3D108A'
BLUE     = '#188CE5'
TEAL     = '#27ACAA'
GREEN    = '#2DB757'
MAROON   = '#750E5C'
CHARCOAL = '#2E2E38'
YELLOW   = '#FFE600'
LIGHT    = '#F0EEF8'
RIBBON   = '#E9E9EF'

fig, ax = plt.subplots(figsize=(14.8, 6.5))
ax.set_xlim(0, 29.6)
ax.set_ylim(0, 13)
ax.axis('off')
fig.patch.set_facecolor('white')

CY = 9.3        # station row center
BH = 3.6        # station box height
TOP = CY + BH / 2
BOT = CY - BH / 2

def station(num, cx, w, name, route, sub, fc):
    ax.add_patch(FancyBboxPatch((cx - w/2, BOT), w, BH,
                                boxstyle='round,pad=0.05',
                                facecolor=fc, edgecolor=CHARCOAL,
                                linewidth=1.2, zorder=3))
    # circled step number, yellow chip
    ccx, ccy = cx - w/2 + 0.50, TOP - 0.42
    ax.add_patch(Circle((ccx, ccy), 0.32, facecolor=YELLOW,
                        edgecolor=CHARCOAL, linewidth=1.0, zorder=5))
    ax.text(ccx, ccy, str(num), ha='center', va='center',
            fontsize=13, fontweight='bold', color=CHARCOAL, zorder=6)
    ax.text(cx, CY + 0.68, name, ha='center', va='center',
            fontsize=14, fontweight='bold', color='white', zorder=5)
    ax.text(cx, CY + 0.02, route, ha='center', va='center',
            fontsize=11.5, family='monospace', color='white', zorder=5)
    ax.text(cx, CY - 1.02, sub, ha='center', va='center',
            fontsize=9.8, color='white', zorder=5,
            multialignment='center', linespacing=1.25)

def bold_arrow(x1, x2, y=CY, color=CHARCOAL, label=None):
    ax.annotate('', xy=(x2, y), xytext=(x1, y),
                arrowprops=dict(arrowstyle='-|>', color=color, lw=2.6,
                                mutation_scale=22), zorder=2)
    if label:
        ax.text((x1 + x2) / 2, y + 0.42, label, ha='center', va='center',
                fontsize=12, fontweight='bold', color=CHARCOAL, zorder=4)

# ---- station geometry (left edge 0.33, per-slot gaps) ----------------------
W1, W3, WD, W5, W6, W7, WCHIP = 3.75, 5.0, 2.9, 3.45, 3.65, 3.75, 2.6
GAPS = (0.55, 0.55, 1.05, 0.55, 0.55, 0.55)
edges, x = [], 0.33
for i, w in enumerate((W1, W3, WD, W5, W6, W7, WCHIP)):
    edges.append((x, x + w, x + w/2))
    x += w + (GAPS[i] if i < len(GAPS) else 0)
(L1, R1, C1), (L3, R3, C3), (LD, RD, CD), \
    (L5, R5, C5), (L6, R6, C6), (L7, R7, C7), (LC, RC, CC) = edges

station(1, C1, W1, 'Welcome', '/', 'Identity read from the\naccount: name, function,\nbank; date auto-set', CHARCOAL)
station(2, C3, W3, 'Questionnaire', '/assessment',
        '47 indicators, 5 dimensions,\n12 sub-dimensions; rubric, hint,\nevidence field, skip control', BLUE)
station(4, C5, W5, 'Results', '/results', 'GMI /5 and %,\nmaturity level, radar\nvs target, formula', TEAL)
station(5, C6, W6, 'Gap Analysis', '/gap-analysis',
        'Priority ranking,\neffort and impact matrix,\n3 phase roadmap', GREEN)
station(6, C7, W7, 'Compliance', '/compliance',
        '13 BCT indicators:\ncompliant, non compliant,\npending; rate, exposure', MAROON)

# ---- station 3: completion gate diamond ------------------------------------
DH = 3.2
ax.add_patch(Polygon([(CD, CY + DH/2), (RD, CY), (CD, CY - DH/2), (LD, CY)],
                     closed=True, facecolor=YELLOW, edgecolor=CHARCOAL,
                     linewidth=1.6, zorder=3))
ax.add_patch(Circle((CD, CY + DH/2 - 0.02), 0.34, facecolor=YELLOW,
                    edgecolor=CHARCOAL, linewidth=1.0, zorder=5))
ax.text(CD, CY + DH/2 - 0.02, '3', ha='center', va='center',
        fontsize=13, fontweight='bold', color=CHARCOAL, zorder=6)
ax.text(CD, CY - 0.05, 'All 5\ndimensions\ncomplete?', ha='center', va='center',
        fontsize=10.5, fontweight='bold', color=CHARCOAL, zorder=5,
        multialignment='center', linespacing=1.1)

# ---- bold flow arrows -------------------------------------------------------
bold_arrow(R1 + 0.05, L3 - 0.05)
bold_arrow(R3 + 0.05, LD - 0.05)
bold_arrow(RD + 0.05, L5 - 0.05, label='Yes')
bold_arrow(R5 + 0.05, L6 - 0.05)
bold_arrow(R6 + 0.05, L7 - 0.05)

# "No" loop from diamond top back to station 3 top
YLOOP = 12.35
ax.plot([CD, CD], [CY + DH/2 + 0.05, YLOOP], color=CHARCOAL, lw=1.8, zorder=2)
ax.plot([CD, C3], [YLOOP, YLOOP], color=CHARCOAL, lw=1.8, zorder=2)
ax.annotate('', xy=(C3, TOP + 0.08), xytext=(C3, YLOOP),
            arrowprops=dict(arrowstyle='-|>', color=CHARCOAL, lw=1.8,
                            mutation_scale=18), zorder=2)
ax.text((CD + C3) / 2, YLOOP + 0.32, 'No: redirect to questionnaire',
        ha='center', va='center', fontsize=12, fontweight='bold',
        color=CHARCOAL, zorder=4)

# ---- terminal export chip ---------------------------------------------------
CHIP_H = 2.0
ax.add_patch(FancyBboxPatch((LC, CY - CHIP_H/2), WCHIP, CHIP_H,
                            boxstyle='round,pad=0.05',
                            facecolor=LIGHT, edgecolor=CHARCOAL,
                            linewidth=1.2, zorder=3))
ax.text(CC, CY + 0.32, 'Export PDF', ha='center', va='center',
        fontsize=12.5, fontweight='bold', color=CHARCOAL, zorder=5)
ax.text(CC, CY - 0.42, '(react-to-print)', ha='center', va='center',
        fontsize=8.6, family='monospace', color=CHARCOAL, zorder=5)

# thin arrow Compliance -> chip
ax.annotate('', xy=(LC - 0.05, CY), xytext=(R7 + 0.05, CY),
            arrowprops=dict(arrowstyle='-|>', color=CHARCOAL, lw=1.3,
                            mutation_scale=14), zorder=2)
# thin arrow Results -> chip, routed under the row
YUND = 6.75
ax.plot([C5, C5], [BOT - 0.05, YUND], color=CHARCOAL, lw=1.3, zorder=2)
ax.plot([C5, CC], [YUND, YUND], color=CHARCOAL, lw=1.3, zorder=2)
ax.annotate('', xy=(CC, CY - CHIP_H/2 - 0.08), xytext=(CC, YUND),
            arrowprops=dict(arrowstyle='-|>', color=CHARCOAL, lw=1.3,
                            mutation_scale=14), zorder=2)

# ---- rule callout cards under station 3 -------------------------------------
CARD_TOP, CARD_H = 6.15, 2.3
cards = [
    (2.9, 5.1, YELLOW, 'Evidence cap: score of 3\nor more without evidence\ncounts as 2'),
    (8.45, 5.6, TEAL, 'Skip ceiling: at most 20% per\ndimension, so 2/2/1/1/1; skipped\nitems leave the denominator;\na skip can be undone'),
    (13.35, 4.0, MAROON, '13 BCT indicators\ncannot be skipped'),
]
for ccx, cw, border, text in cards:
    ax.add_patch(Rectangle((ccx - cw/2, CARD_TOP - CARD_H), cw, CARD_H,
                           facecolor='white', edgecolor='#B9B9C4',
                           linewidth=1.0, zorder=3))
    ax.add_patch(Rectangle((ccx - cw/2, CARD_TOP - CARD_H), 0.16, CARD_H,
                           facecolor=border, edgecolor='none', zorder=4))
    ax.text(ccx + 0.10, CARD_TOP - CARD_H/2, text, ha='center', va='center',
            fontsize=10.2, color=CHARCOAL, zorder=5,
            multialignment='left', linespacing=1.3)
    # thin connector from station 3 bottom edge to card top
    sx = min(max(ccx, L3 + 0.5), R3 - 0.5)
    ax.plot([sx, ccx], [BOT - 0.05, CARD_TOP + 0.02],
            color='#B9B9C4', lw=1.1, zorder=1)

# ---- persistence ribbon ------------------------------------------------------
RIB_Y, RIB_H = 0.55, 1.55
ax.add_patch(FancyBboxPatch((0.33, RIB_Y), 29.6 - 0.66, RIB_H,
                            boxstyle='round,pad=0.05',
                            facecolor=RIBBON, edgecolor='#B9B9C4',
                            linewidth=1.0, zorder=3))
ax.text(29.6 / 2, RIB_Y + RIB_H / 2,
        'Session persisted to browser local storage (key datapilot-assessment); '
        'close and reopen the browser to resume;\nReset All clears it after confirmation',
        ha='center', va='center', fontsize=12, color=CHARCOAL, zorder=5,
        multialignment='center', linespacing=1.35)

plt.tight_layout(pad=0.2)
plt.savefig('/tmp/pfe_report/images/user-journey.pdf',
            bbox_inches='tight', dpi=150, facecolor='white')
plt.savefig('/tmp/pfe_report/images/user-journey.png',
            bbox_inches='tight', dpi=150, facecolor='white')
print('saved user-journey.pdf/.png')
