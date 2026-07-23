#!/usr/bin/env python3
"""
Layered architecture of the DataPilot platform (v2, Iteration 4).
Grounded in /home/user/datapilot_EY/src and /home/user/datapilot_EY/api:
  Presentation layer -> State layer (eight Zustand stores) -> Data access layer
  -> Backend layer (serverless API + Supabase under row-level security).
Saves to ../images/architecture-layers.pdf (and .png).
No em-dashes or en-dashes anywhere.
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

# EY palette
CHARCOAL = '#2E2E38'
PURPLE   = '#3D108A'
BLUE     = '#188CE5'
TEAL     = '#27ACAA'
GREEN    = '#2DB757'
MAROON   = '#750E5C'
YELLOW   = '#FFE600'
GRAY     = '#9897A9'
LIGHT    = '#F0EEF8'

fig, ax = plt.subplots(figsize=(15, 14.6))
ax.set_xlim(0, 15)
ax.set_ylim(0, 14.6)
ax.axis('off')
fig.patch.set_facecolor('white')


def band(cx, cy, w, h, fc, lw=2.0):
    rect = FancyBboxPatch((cx - w / 2, cy - h / 2), w, h,
                          boxstyle='round,pad=0.06',
                          facecolor=fc, edgecolor=fc, linewidth=lw, zorder=1)
    ax.add_patch(rect)


def box(cx, cy, w, h, title, subtitle, fc, tc='white',
        fs_t=12.5, fs_s=10.0, ec='white'):
    rect = FancyBboxPatch((cx - w / 2, cy - h / 2), w, h,
                          boxstyle='round,pad=0.05',
                          facecolor=fc, edgecolor=ec, linewidth=1.6, zorder=3)
    ax.add_patch(rect)
    if subtitle:
        ax.text(cx, cy + h / 2 - 0.28, title, ha='center', va='center',
                fontsize=fs_t, color=tc, fontweight='bold', zorder=4)
        ax.text(cx, cy - 0.14, subtitle, ha='center', va='center',
                fontsize=fs_s, color=tc, zorder=4, multialignment='center')
    else:
        ax.text(cx, cy, title, ha='center', va='center',
                fontsize=fs_t, color=tc, fontweight='bold', zorder=4,
                multialignment='center')


def varrow(x, y_top, y_bot, label):
    ax.add_patch(FancyArrowPatch((x, y_top), (x, y_bot),
                 arrowstyle='-|>', mutation_scale=26,
                 color=CHARCOAL, lw=2.6, zorder=5))
    ax.text(x + 0.25, (y_top + y_bot) / 2, label, ha='left', va='center',
            fontsize=9.5, color=CHARCOAL, style='italic', zorder=6)


# Title
ax.text(7.5, 14.05,
        'React 19, Vite 8, React Router 7, Zustand 5, Tailwind CSS 4, Recharts 3, '
        'Supabase JS client 2, serverless functions',
        ha='center', va='center', fontsize=10.5, color=GRAY)

# =========================================================
# Layer 1: Presentation
# =========================================================
L1_cy, L1_h = 12.05, 3.05
band(7.5, L1_cy, 14.4, L1_h, LIGHT)
ax.text(0.55, L1_cy + L1_h / 2 - 0.32, 'Presentation layer',
        ha='left', va='center', fontsize=12.5, color=PURPLE, fontweight='bold')
ax.text(13.85, L1_cy + L1_h / 2 - 0.32, 'React Router 7 (lazy, role-guarded routes)',
        ha='right', va='center', fontsize=9.5, color=GRAY, style='italic')

# Screens row (grouped by role)
py = 12.55
box(2.35, py, 3.15, 1.05, 'Public',
    'Landing, Login,\nSetPassword (invite link)', PURPLE, fs_t=11, fs_s=8.8)
box(6.35, py, 4.35, 1.05, 'Analyst screens',
    'Welcome, Questionnaire (solo), GroupContributor,\nResults, GapAnalysis, Compliance',
    PURPLE, fs_t=11, fs_s=8.8)
box(9.95, py, 2.30, 1.05, 'Every role',
    'Account, Guide', PURPLE, fs_t=11, fs_s=8.8)
box(12.95, py, 3.20, 1.05, 'Admin hub',
    'Submissions, Group assessment,\nQuestionnaire editor, Departments, Users',
    MAROON, fs_t=11, fs_s=8.4)

# Components row
py2 = 11.30
box(3.35, py2, 5.1, 1.0, 'Shared AssessmentRunner',
    'one questionnaire component renders the solo\nand the group (assigned dimensions) paths',
    BLUE, fs_t=11.5, fs_s=8.6)
box(7.75, py2, 3.0, 1.0, 'UI components',
    'Topbar, NavBar, badges,\nprogress and score displays', BLUE, fs_t=11, fs_s=8.6)
box(10.95, py2, 2.8, 1.0, 'Charts (Recharts 3)',
    'RadarChart,\nDimensionBars', TEAL, fs_t=10.5, fs_s=8.8)
box(13.65, py2, 2.0, 1.0, 'Print', 'react-to-print', GREEN, fs_t=11, fs_s=9.0)

# Arrow Presentation -> State
varrow(7.5, 10.42, 9.86, 'selectors read state, actions dispatch updates')

# =========================================================
# Layer 2: State (eight Zustand stores)
# =========================================================
L2_cy, L2_h = 8.55, 2.5
band(7.5, L2_cy, 14.4, L2_h, '#EDE7F6')
ax.text(0.55, L2_cy + L2_h / 2 - 0.30, 'State layer',
        ha='left', va='center', fontsize=12.5, color=MAROON, fontweight='bold')
ax.text(13.85, L2_cy + L2_h / 2 - 0.30, 'eight Zustand 5 stores',
        ha='right', va='center', fontsize=9.5, color=GRAY, style='italic')

stores_top = [
    ('useAuthStore', 'session, role,\nidentity'),
    ('useAppStore', 'solo assessment\n(answers, evidence)'),
    ('useAssessmentStore', 'group assessment\n(draft, mapping)'),
    ('useContentStore', 'questionnaire\ncontent'),
]
stores_bot = [
    ('useUsersStore', 'users and\ninvitations'),
    ('useDepartmentsStore', 'bank\ndepartments'),
    ('useSubmissionsStore', 'immutable\nsubmissions'),
    ('useSettingsStore', 'language\n(EN / FR)'),
]
sx0, sstep, sw, sh = 2.55, 3.45, 3.2, 0.88
for i, (name, sub) in enumerate(stores_top):
    box(sx0 + i * sstep, 8.95, sw, sh, name, sub, MAROON, fs_t=10.5, fs_s=8.2)
for i, (name, sub) in enumerate(stores_bot):
    box(sx0 + i * sstep, 7.95, sw, sh, name, sub, MAROON, fs_t=10.5, fs_s=8.2)

ax.text(7.5, 7.32,
        'Pure modules in src/lib: scoring.js (one engine for the solo and group paths), '
        'roadmap.js, roles.js, i18n.js.',
        ha='center', va='center', fontsize=9.4, color=CHARCOAL, style='italic')

# Arrow State -> Data access
varrow(7.5, 7.12, 6.42, 'persist and load')

# =========================================================
# Layer 3: Data access
# =========================================================
L3_cy, L3_h = 5.55, 1.7
band(7.5, L3_cy, 14.4, L3_h, '#E8F5E9')
ax.text(0.55, L3_cy + L3_h / 2 - 0.28, 'Data access layer',
        ha='left', va='center', fontsize=12.5, color=GREEN, fontweight='bold')

box(3.15, 5.42, 4.5, 1.05, 'Browser localStorage',
    'solo in-progress answers only\n(key datapilot-assessment, bound to the account)',
    GREEN, fs_t=11, fs_s=8.6)
box(7.85, 5.42, 4.3, 1.05, 'Bundled defaults',
    'indicators.js (reference framework seed)\nand recommendations.js, offline fallback',
    TEAL, fs_t=11, fs_s=8.6)
box(12.35, 5.42, 4.2, 1.05, 'Supabase JS client 2',
    'public key under row-level security;\nbearer token for privileged endpoints',
    CHARCOAL, fs_t=11, fs_s=8.6)

# Arrow Data access -> Backend
varrow(7.5, 4.55, 3.85, 'HTTPS: public key under RLS; bearer token to the API')

# =========================================================
# Layer 4: Backend (NEW in Iteration 4)
# =========================================================
L4_cy, L4_h = 2.35, 2.65
band(7.5, L4_cy, 14.4, L4_h, '#E3F2FD')
ax.text(0.55, L4_cy + L4_h / 2 - 0.26, 'Backend layer',
        ha='left', va='center', fontsize=12.5, color=BLUE, fontweight='bold')
ax.text(13.85, L4_cy + L4_h / 2 - 0.26, 'new in Iteration 4',
        ha='right', va='center', fontsize=9.5, color=GRAY, style='italic')

box(4.05, 2.18, 6.3, 1.75, 'Serverless API (api/)',
    'five privileged POST endpoints: invite, set-role,\n'
    'manage-user, set-department, update-self\n'
    'hold the server-only service key and re-read the\ncaller\'s role; roadmap is an optional AI layer, off by default',
    BLUE, fs_t=12, fs_s=8.8)
box(11.15, 2.18, 6.6, 1.75, 'Supabase',
    'Postgres under row-level security: profiles, per-bank\n'
    'dimensions and indicators (empty bank name = EY master\n'
    'template), submissions, departments, group assessments\n'
    'Auth (invite emails) and Storage (avatars)',
    PURPLE, fs_t=12, fs_s=8.8)

ax.text(7.5, 0.68,
        'Tenant isolation: every row is confined to its bank by row-level security '
        '(the EY Admin (owner) sees all banks by design).',
        ha='center', va='center', fontsize=9.6, color=CHARCOAL, style='italic')
ax.text(7.5, 0.28,
        'Solo in-progress answers stay in the browser; submissions, group assessments, '
        'profiles, and questionnaire copies persist in Postgres.',
        ha='center', va='center', fontsize=9.6, color=CHARCOAL, style='italic')

plt.savefig('../images/architecture-layers.pdf',
            bbox_inches='tight', dpi=150, facecolor='white')
plt.savefig('../images/architecture-layers.png',
            bbox_inches='tight', dpi=150, facecolor='white')
print('architecture-layers saved: architecture-layers.pdf/.png')
