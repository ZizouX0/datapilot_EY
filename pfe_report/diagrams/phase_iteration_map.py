#!/usr/bin/env python3
"""
Phase <-> Iteration map: the six calendar phases across the top, the four DSR
iterations as bands spanning the phases they carry, with handoff arrows showing
that each iteration consumes the validated artifact of the previous one.
Source of truth: methodology.tex Table tab:phase-iteration-map.
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

CHARCOAL='#2E2E38'; GRAY='#9897A9'; LIGHT='#F0F0F5'
PURPLE='#3D108A'; TEAL='#27ACAA'; BLUE='#188CE5'; GREEN='#2DB757'

# six phase columns (x = 0..6), header label + dates
PHASES=[
    ('Phase 0','Framing','2–13 Feb'),
    ('Phase 1','Existing\nsituation','16 Feb–6 Mar'),
    ('Phase 2','Needs\nidentification','9–27 Mar'),
    ('Phase 3','Framework\ndesign','30 Mar–8 May'),
    ('Phase 4','Development','11 May–3 Jul'),
    ('Phase 5','Deployment','6–31 Jul'),
]
# iteration bands: (label, artifact, color, x_start, x_end, row_y)
ITERS=[
    ('Iteration 1 · Define','Maturity framework',        PURPLE, 1.0, 4.0, 4.35),
    ('Iteration 2 · Measure','Scoring engine',           TEAL,   3.0, 5.0, 3.30),
    ('Iteration 3 · Steer','Interactive tool',           BLUE,   4.0, 6.0, 2.25),
    ('Iteration 4 · Scale','Multi-tenant platform',      GREEN,  4.0, 6.0, 1.20),
]
BAR_H=0.82

fig,ax=plt.subplots(figsize=(13.5,7.6))
ax.set_xlim(-0.05,6.05); ax.set_ylim(0.4,6.5); ax.axis('off')
fig.patch.set_facecolor('white')

# faint phase columns + vertical separators
for i,(pn,name,dates) in enumerate(PHASES):
    x=i
    shade = LIGHT if i==0 else ('#FBFBFD' if i%2 else '#F6F7FA')
    ax.add_patch(plt.Rectangle((x,0.75),1,4.85,facecolor=shade,edgecolor='none',zorder=0))
    if i>0:
        ax.plot([x,x],[0.75,5.95],color='#E4E6EB',lw=1.0,zorder=1)
    # header band
    ax.add_patch(FancyBboxPatch((x+0.05,5.6),0.9,0.55,boxstyle='round,pad=0.02',
                 facecolor=CHARCOAL,edgecolor='white',lw=1.2,zorder=2))
    ax.text(x+0.5,5.875,pn,ha='center',va='center',fontsize=10.5,color='white',
            fontweight='bold',zorder=3)
    ax.text(x+0.5,5.42,name,ha='center',va='top',fontsize=9.5,color=CHARCOAL,
            fontweight='bold',multialignment='center',zorder=3)
    ax.text(x+0.5,4.98,dates,ha='center',va='top',fontsize=8.2,color=GRAY,
            style='italic',zorder=3)

# pre-iteration note under Phase 0
ax.text(0.5,1.15,'project\nsetup',ha='center',va='center',fontsize=8.5,color=GRAY,
        style='italic',multialignment='center',zorder=3)

# iteration bands
centers={}
for label,artifact,color,x0,x1,y in ITERS:
    ax.add_patch(FancyBboxPatch((x0+0.04,y-BAR_H/2),(x1-x0)-0.08,BAR_H,
                 boxstyle='round,pad=0.02',facecolor=color,edgecolor='white',
                 lw=1.5,zorder=4))
    ax.text((x0+x1)/2,y+0.14,label,ha='center',va='center',fontsize=11,
            color='white',fontweight='bold',zorder=5)
    ax.text((x0+x1)/2,y-0.20,artifact,ha='center',va='center',fontsize=9.5,
            color='white',style='italic',zorder=5)
    centers[label]=(x0,x1,y)

# handoff arrows: each iteration consumes the previous artifact
order=[i[0] for i in ITERS]
for a,b in zip(order,order[1:]):
    xa0,xa1,ya=centers[a]; xb0,xb1,yb=centers[b]
    hx=max(xa0,xb0)+0.35   # in the overlap region
    ax.annotate('',xy=(hx,yb+BAR_H/2),xytext=(hx,ya-BAR_H/2),zorder=6,
                arrowprops=dict(arrowstyle='-|>',color=CHARCOAL,lw=2.0,
                                mutation_scale=18))

ax.text(3.0,0.58,'Each iteration consumes the validated artifact of the one before it — '
        'framework → scoring engine → tool → platform.',
        ha='center',va='center',fontsize=9.5,color='#555555',style='italic')

plt.tight_layout(pad=0.4)
plt.savefig('../images/phase-iteration-map.pdf',bbox_inches='tight',dpi=150,facecolor='white')
plt.savefig('../images/phase-iteration-map.png',bbox_inches='tight',dpi=150,facecolor='white')
print('saved: phase-iteration-map.pdf/.png')
