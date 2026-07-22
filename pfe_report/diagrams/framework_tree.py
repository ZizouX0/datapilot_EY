#!/usr/bin/env python3
"""
F1 - Framework architecture tree
Generates a left-to-right hierarchical tree of the DataPilot framework:
  Root -> 5 Dimensions -> 12 Sub-dimensions (with indicator counts)
Real hierarchy sourced from APP_SPEC.md / indicators.js:
  5 dimensions, 12 sub-dimensions, 47 indicators.
No em-dashes or en-dashes in any label.
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

# -- Real data from indicators.js ---------------------------------------------
DIMS = [
    {'id': 'D1', 'name': 'Governance',            'weight': '25%', 'color': '#3D108A'},
    {'id': 'D2', 'name': 'Data Quality',          'weight': '20%', 'color': '#188CE5'},
    {'id': 'D3', 'name': 'Architecture & Access', 'weight': '20%', 'color': '#27ACAA'},
    {'id': 'D4', 'name': 'Analytics & Tools',     'weight': '20%', 'color': '#2DB757'},
    {'id': 'D5', 'name': 'Skills & Culture',      'weight': '15%', 'color': '#750E5C'},
]

SUBDIMS = {
    'D1': [
        ('1.1', 'Strategy & data policy',       4),
        ('1.2', 'Ownership & responsibilities', 4),
        ('1.3', 'Regulatory compliance',        4),
    ],
    'D2': [
        ('2.1', 'Quality dimensions',     4),
        ('2.2', 'Controls & processes',   4),
        ('2.3', 'Lineage & traceability', 3),
    ],
    'D3': [
        ('3.1', 'Centralization & integration', 4),
        ('3.2', 'Pipelines & infrastructure',   4),
    ],
    'D4': [
        ('4.1', 'Tool maturity', 4),
        ('4.2', 'Data usage',    4),
    ],
    'D5': [
        ('5.1', 'Data skills (proxy)',        4),
        ('5.2', 'Culture & adoption (proxy)', 4),
    ],
}

# Sanity check: counts must total 47 across 12 sub-dimensions.
_total = sum(cnt for sds in SUBDIMS.values() for _, _, cnt in sds)
_nsub = sum(len(sds) for sds in SUBDIMS.values())
assert _total == 47, f"indicator total is {_total}, expected 47"
assert _nsub == 12, f"sub-dimension total is {_nsub}, expected 12"
assert len(DIMS) == 5, "dimension total must be 5"

# -- Layout constants ----------------------------------------------------------
fig_w, fig_h = 20, 13.6
fig, ax = plt.subplots(figsize=(fig_w, fig_h))
# Topmost sub-dimension box: centre y = 12.0, height 0.82 -> top edge = 12.41.
# Draw the column headers well above it so they never collide with the box.
Y_TOP = 12.41 + 0.45
ax.set_xlim(0, 20)
ax.set_ylim(0, 13.6)
ax.axis('off')
fig.patch.set_facecolor('white')

CHARCOAL  = '#2E2E38'
LIGHTGRAY = '#9897A9'


def draw_box(ax, x, y, w, h, text, facecolor='#F5F5F5', textcolor='white',
             fontsize=11, bold=False):
    box = FancyBboxPatch((x - w/2, y - h/2), w, h,
                         boxstyle="round,pad=0.05",
                         facecolor=facecolor, edgecolor='white',
                         linewidth=1.5, zorder=3)
    ax.add_patch(box)
    weight = 'bold' if bold else 'normal'
    ax.text(x, y, text, ha='center', va='center',
            fontsize=fontsize, color=textcolor, fontweight=weight,
            wrap=True, zorder=4,
            multialignment='center')


def draw_line(ax, x1, y1, x2, y2, color=LIGHTGRAY):
    ax.plot([x1, x2], [y1, y2], color=color, linewidth=1.4, zorder=1)


# -- Sub-dimension layout (evenly spaced, grouped by dimension) ----------------
# Build a flat ordered list of all 12 sub-dimensions and place them evenly
# down the right column, then centre each dimension on its own sub-dimensions.
subdim_x = 12.7
Y_HI, Y_LO = 12.0, 1.0          # vertical band for the 12 leaf nodes
flat = [(d['id'], sd) for d in DIMS for sd in SUBDIMS[d['id']]]
n_leaf = len(flat)
step = (Y_HI - Y_LO) / (n_leaf - 1)
leaf_y = {}
for k, (did, (sid, sname, cnt)) in enumerate(flat):
    leaf_y[sid] = Y_HI - k * step

# Dimension y = centre of its sub-dimensions' y range.
dim_x = 6.2
dim_ys = []
for d in DIMS:
    ys = [leaf_y[sd[0]] for sd in SUBDIMS[d['id']]]
    dim_ys.append(sum(ys) / len(ys))

root_x = 1.7
root_y = sum(dim_ys) / len(dim_ys)

# -- Root node -----------------------------------------------------------------
draw_box(ax, root_x, root_y, 2.6, 1.2,
         'DataPilot\nFramework', facecolor=CHARCOAL, textcolor='white',
         fontsize=15, bold=True)

# -- Dimension nodes -----------------------------------------------------------
for i, d in enumerate(DIMS):
    dy = dim_ys[i]
    label = f"{d['id']}: {d['name']}\n({d['weight']})"
    draw_line(ax, root_x + 1.3, root_y, dim_x - 1.7, dy, color=d['color'])
    draw_box(ax, dim_x, dy, 3.4, 1.05,
             label, facecolor=d['color'], textcolor='white',
             fontsize=14, bold=True)

# -- Sub-dimension nodes -------------------------------------------------------
for i, d in enumerate(DIMS):
    did = d['id']
    dy = dim_ys[i]
    color = d['color']
    for (sid, sname, cnt) in SUBDIMS[did]:
        sy = leaf_y[sid]
        noun = 'indicator' if cnt == 1 else 'indicators'
        label = f"{sid}  {sname}\n({cnt} {noun})"
        draw_line(ax, dim_x + 1.7, dy, subdim_x - 2.3, sy, color=color)
        draw_box(ax, subdim_x, sy, 4.6, 0.82,
                 label, facecolor=color + 'CC',
                 textcolor='white', fontsize=12.5)

# -- Column labels -------------------------------------------------------------
for lx, label in [(root_x, 'Framework'), (dim_x, 'Dimensions (L1)'),
                  (subdim_x, 'Sub-dimensions (L2)')]:
    ax.text(lx, Y_TOP, label, ha='center', va='center',
            fontsize=14, color=CHARCOAL, fontweight='bold',
            style='italic')

# -- Total indicator note ------------------------------------------------------
ax.text(subdim_x + 4.2, root_y,
        '5 dimensions\n12 sub-dimensions\n47 indicators',
        ha='center', va='center', fontsize=15, color=CHARCOAL,
        fontweight='bold',
        bbox=dict(boxstyle='round,pad=0.6', facecolor='#F0F0F5',
                  edgecolor=CHARCOAL, linewidth=1.0))

plt.subplots_adjust(left=0.01, right=0.99, top=0.99, bottom=0.01)
plt.savefig('../images/framework-tree.pdf',
            bbox_inches='tight', dpi=150, facecolor='white')
plt.savefig('../images/framework-tree.png',
            bbox_inches='tight', dpi=150, facecolor='white')
print("F1 saved: framework-tree.pdf/.png")
