#!/usr/bin/env python3
"""
F4 - Hybrid framework mapping.
Shows how the five selected benchmark frameworks (DAMA-DMBOK, DCAM, CMMI-DMM,
TDWI, Gartner) map onto the five dimensions of the hybrid framework, together
with the distinct role each framework contributes.

Dimensions (weights): D1 Governance (25%), D2 Data Quality (20%),
D3 Architecture and Access (20%), D4 Analytics and Tools (20%),
D5 Skills and Culture (15%).
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Circle

CHARCOAL = '#2E2E38'
PURPLE   = '#3D108A'
BLUE     = '#188CE5'
TEAL     = '#27ACAA'
GREEN    = '#2DB757'
MAROON   = '#750E5C'
GRAY     = '#9897A9'

# Dimension columns (id, short label, weight, color)
DIMS = [
    ('D1', 'Governance',            '25%', PURPLE),
    ('D2', 'Data Quality',          '20%', BLUE),
    ('D3', 'Architecture\nand Access', '20%', TEAL),
    ('D4', 'Analytics\nand Tools',  '20%', GREEN),
    ('D5', 'Skills and\nCulture',   '15%', MAROON),
]

# Each framework: name, colour, role, and which dimensions it primarily anchors.
# 'P' = primary contribution, 's' = supporting contribution.
FRAMEWORKS = [
    ('DAMA-DMBOK', PURPLE, 'Structural backbone',
        {'D1': 'P', 'D2': 'P', 'D3': 'P', 'D4': 's', 'D5': 's'}),
    ('DCAM',       MAROON, 'Regulatory anchor (BCT + BCBS 239)',
        {'D1': 'P', 'D2': 'P', 'D3': 's', 'D4': 's', 'D5': ''}),
    ('CMMI-DMM',   BLUE,   'Maturity scale (5 levels)',
        {'D1': 'P', 'D2': 'P', 'D3': 'P', 'D4': 'P', 'D5': 'P'}),
    ('TDWI',       TEAL,   'Evaluation engine (scoring)',
        {'D1': 's', 'D2': 'P', 'D3': 'P', 'D4': 'P', 'D5': 's'}),
    ('Gartner',    GREEN,  'Executive communication',
        {'D1': 's', 'D2': 's', 'D3': 's', 'D4': 'P', 'D5': 'P'}),
]

fig, ax = plt.subplots(figsize=(16, 9))
ax.set_xlim(0, 16)
ax.set_ylim(0, 9)
ax.axis('off')
fig.patch.set_facecolor('white')

# Layout geometry
NAME_X   = 2.3      # centre of framework name boxes
ROLE_X   = 5.0      # role text (right edge reference)
COL_X0   = 8.4      # centre of first dimension column
COL_DX   = 1.55     # spacing between dimension columns
ROW_Y0   = 6.3      # centre of first framework row
ROW_DY   = 1.15     # spacing between framework rows
HDR_Y    = 7.7      # dimension header row

col_x = [COL_X0 + j * COL_DX for j in range(len(DIMS))]

# Dimension header boxes
for (did, dlabel, dweight, dcolor), cx in zip(DIMS, col_x):
    rect = FancyBboxPatch((cx - 0.68, HDR_Y - 0.55), 1.36, 1.10,
                          boxstyle='round,pad=0.04',
                          facecolor=dcolor, edgecolor='white',
                          linewidth=1.5, zorder=3)
    ax.add_patch(rect)
    ax.text(cx, HDR_Y + 0.12, did, ha='center', va='center',
            fontsize=15, color='white', fontweight='bold', zorder=4)
    ax.text(cx, HDR_Y - 0.30, dweight, ha='center', va='center',
            fontsize=11, color='white', zorder=4)
    ax.text(cx, HDR_Y - 1.0, dlabel, ha='center', va='center',
            fontsize=10.5, color=CHARCOAL, fontweight='bold',
            multialignment='center', zorder=4)

# Column headers labels row explanation
ax.text(NAME_X, HDR_Y + 0.05, 'Framework', ha='center', va='center',
        fontsize=14, color=CHARCOAL, fontweight='bold')
ax.text((ROLE_X + 6.7) / 2 - 0.2, HDR_Y + 0.05, 'Role', ha='center', va='center',
        fontsize=14, color=CHARCOAL, fontweight='bold')

# Framework rows
for i, (name, color, role, coverage) in enumerate(FRAMEWORKS):
    ry = ROW_Y0 - i * ROW_DY

    # Framework name box
    rect = FancyBboxPatch((NAME_X - 1.3, ry - 0.38), 2.6, 0.76,
                          boxstyle='round,pad=0.05',
                          facecolor=color, edgecolor='white',
                          linewidth=1.5, zorder=3)
    ax.add_patch(rect)
    ax.text(NAME_X, ry, name, ha='center', va='center',
            fontsize=13, color='white', fontweight='bold', zorder=4)

    # Role text
    ax.text(3.85, ry, role, ha='left', va='center',
            fontsize=11, color='#333333', style='italic')

    # Coverage markers across the five dimensions
    for (did, _, _, dcolor), cx in zip(DIMS, col_x):
        mark = coverage.get(did, '')
        if mark == 'P':
            ax.add_patch(Circle((cx, ry), 0.24, facecolor=dcolor,
                                 edgecolor='white', linewidth=1.2, zorder=4))
        elif mark == 's':
            ax.add_patch(Circle((cx, ry), 0.16, facecolor='white',
                                 edgecolor=dcolor, linewidth=2.0, zorder=4))
        # empty: no marker

# Light column guide lines
for cx in col_x:
    ax.plot([cx, cx], [ROW_Y0 - (len(FRAMEWORKS) - 1) * ROW_DY - 0.5,
                       HDR_Y - 0.6],
            color='#EEEEEE', linewidth=1.0, zorder=1)

# Legend for markers
leg_y = ROW_Y0 - (len(FRAMEWORKS) - 1) * ROW_DY - 1.05
ax.add_patch(Circle((NAME_X - 1.0, leg_y), 0.20, facecolor=GRAY,
                    edgecolor='white', linewidth=1.2, zorder=4))
ax.text(NAME_X - 0.65, leg_y, 'Primary contribution', ha='left', va='center',
        fontsize=11, color=CHARCOAL)
ax.add_patch(Circle((NAME_X + 2.9, leg_y), 0.14, facecolor='white',
                    edgecolor=GRAY, linewidth=2.0, zorder=4))
ax.text(NAME_X + 3.2, leg_y, 'Supporting contribution', ha='left', va='center',
        fontsize=11, color=CHARCOAL)

ax.set_title(''
             'of the Hybrid Framework',
             fontsize=16, fontweight='bold', pad=14, color=CHARCOAL)

plt.tight_layout(pad=0.4)
plt.savefig('../images/hybrid-mapping.pdf',
            bbox_inches='tight', dpi=150, facecolor='white')
plt.savefig('../images/hybrid-mapping.png',
            bbox_inches='tight', dpi=150, facecolor='white')
print("F4 saved: hybrid-mapping.pdf/.png")
