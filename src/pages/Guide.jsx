import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { roleLabel } from '../lib/roles';
import { INDICATORS, DIMENSIONS } from '../data/indicators';

// Role-aware guide. Reachable any time from the "Guide" button in the top bar,
// so a user who gets lost can always re-read what their role does and how the
// workflow fits together. Content adapts to the signed-in role.

// The group (Model B) workflow, told as four steps, with who does each.
const GROUP_STEPS = [
  { n: 1, who: 'Super Admin', title: 'Set up departments & people', where: 'Admin → Departments',
    desc: 'Create the departments that will contribute (or use the one-click Tunisian set), then assign each analyst to a department.' },
  { n: 2, who: 'Admin', title: 'Create the assessment & map dimensions', where: 'Admin → Group assessment',
    desc: 'Start the shared assessment, then map each dimension to the department that owns it — or apply the suggested Tunisian mapping in one click.' },
  { n: 3, who: 'Analysts', title: 'Fill your part', where: 'Welcome → Contribute',
    desc: 'Each analyst answers only the dimensions assigned to their department. Answers save automatically to the shared assessment.' },
  { n: 4, who: 'Admin', title: 'Review & finalize', where: 'Admin → Group assessment',
    desc: 'Watch progress and scores update live. When everyone is done, finalize — the result lands in Submissions with full reports.' },
];

const GLOSSARY = [
  ['Dimension', `One of the ${Object.keys(DIMENSIONS).length} big themes of data maturity (e.g. Governance, Data Quality). Each has a weight in the final score.`],
  ['Indicator', `One specific question. There are ${INDICATORS.length} in total, grouped under the dimensions.`],
  ['Maturity level', 'A 1–5 rating: 1 Initial, 2 Emerging, 3 Defined, 4 Managed, 5 Optimized (CMMI / Gartner scale).'],
  ['BCT compliance', 'Whether key indicators meet the Banque Centrale de Tunisie data expectations. BCT indicators can’t be skipped.'],
  ['Evidence cap', 'A score of 3 or more with no evidence noted is automatically capped at 2 — so scores stay honest.'],
  ['Department', 'A team in your bank (e.g. DSI, Conformité). In a group assessment, each owns one or more dimensions.'],
  ['Group assessment', 'One shared assessment several departments fill together, finalized by a coordinator.'],
  ['Solo assessment', 'One person fills the whole assessment alone — the classic flow, still available any time.'],
];

// What each role does, in plain language.
const ROLE_INFO = {
  owner: {
    title: 'You are EY (platform owner)',
    blurb: 'You oversee every bank on DataPilot, maintain the master questionnaire, and can review every submission.',
    can: [
      'Invite each bank’s Super Admin and set their bank.',
      'Edit the EY master questionnaire that banks copy from.',
      'Review submissions across all banks.',
    ],
    flow: 'group',
  },
  superadmin: {
    title: 'You are a Super Admin',
    blurb: 'You set up your bank’s structure — departments and people — and oversee its assessments.',
    can: [
      'Create departments and assign analysts to them (Departments tab).',
      'Create and run group assessments, and finalize them.',
      'Invite and manage Admins and Analysts in your bank.',
    ],
    flow: 'group',
  },
  admin: {
    title: 'You are an Admin (coordinator)',
    blurb: 'You run assessments for your bank and look after your analysts.',
    can: [
      'Create a group assessment and map dimensions to departments.',
      'Track progress and finalize the assessment into a submission.',
      'Tailor your bank’s questionnaire and review submissions.',
    ],
    flow: 'group',
  },
  analyst: {
    title: 'You are an Analyst',
    blurb: 'You fill in assessments — either on your own, or your department’s part of a shared one.',
    can: [
      'Run a solo assessment from start to finish.',
      'Contribute to a group assessment — you’ll see only your department’s dimensions.',
      'See your score, gaps, compliance and download the report.',
    ],
    flow: 'analyst',
  },
};

export default function Guide() {
  const navigate = useNavigate();
  const role = useAuthStore(s => s.role) || 'analyst';
  const info = ROLE_INFO[role] || ROLE_INFO.analyst;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-800">Your guide</h1>
          <span className="bg-ey-purple text-white text-[11px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide">
            {roleLabel(role)}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          A quick map of what you do and how everything fits together. You can reopen this any time from the “Guide” button at the top.
        </p>
      </div>

      {/* Your role */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-gray-800">{info.title}</h2>
        <p className="text-sm text-gray-600 mt-1">{info.blurb}</p>
        <ul className="mt-3 flex flex-col gap-1.5">
          {info.can.map(c => (
            <li key={c} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-green-600 mt-0.5">✓</span><span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Workflow */}
      {info.flow === 'analyst' ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">How you fill an assessment</h2>
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-ey-yellow text-ey-charcoal text-xs font-bold flex items-center justify-center flex-shrink-0">A</div>
              <div>
                <div className="text-sm font-semibold text-gray-800">Group assessment (if assigned)</div>
                <p className="text-sm text-gray-600">On your <strong>Welcome</strong> page you’ll see a “Contribute to the group assessment” card if your department owns a dimension. It shows only your dimensions; answers save automatically.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-ey-charcoal text-white text-xs font-bold flex items-center justify-center flex-shrink-0">B</div>
              <div>
                <div className="text-sm font-semibold text-gray-800">Solo assessment (any time)</div>
                <p className="text-sm text-gray-600">Use the setup form on the Welcome page to run the full assessment yourself, then view your results, gap analysis and compliance report.</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-ey-yellow text-ey-charcoal font-semibold rounded-lg px-4 py-2 text-sm hover:bg-yellow-400"
          >Go to my assessment →</button>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">The group assessment workflow</h2>
          <p className="text-sm text-gray-500 mb-4">
            One shared assessment, filled by several departments, finalized by a coordinator. Here’s the whole flow and who does each step.
          </p>
          <div className="flex flex-col">
            {GROUP_STEPS.map((s, i) => (
              <div key={s.n} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-ey-charcoal text-ey-yellow text-sm font-bold flex items-center justify-center flex-shrink-0">{s.n}</div>
                  {i < GROUP_STEPS.length - 1 && <div className="w-px flex-1 bg-gray-300 my-1" />}
                </div>
                <div className={i < GROUP_STEPS.length - 1 ? 'pb-4' : ''}>
                  <div className="text-sm font-semibold text-gray-800">{s.title}
                    <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide bg-ey-purple/10 text-ey-purple px-1.5 py-0.5 rounded">{s.who}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.where}</div>
                  <p className="text-sm text-gray-600 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="mt-4 bg-ey-yellow text-ey-charcoal font-semibold rounded-lg px-4 py-2 text-sm hover:bg-yellow-400"
          >Go to the admin area →</button>
          <p className="text-xs text-gray-400 mt-2">
            Prefer one person to do everything? An analyst can still run a full <strong>solo</strong> assessment — group mode is optional.
          </p>
        </div>
      )}

      {/* Glossary */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Words you’ll see</h2>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
          {GLOSSARY.map(([term, def]) => (
            <div key={term}>
              <dt className="text-sm font-semibold text-gray-800">{term}</dt>
              <dd className="text-sm text-gray-600">{def}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
