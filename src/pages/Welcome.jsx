import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import useAuthStore from '../store/useAuthStore';
import useAssessmentStore from '../store/useAssessmentStore';
import useSettingsStore from '../store/useSettingsStore';
import LanguageToggle from '../components/ui/LanguageToggle';
import { INDICATORS, DIMENSIONS } from '../data/indicators';

// Co-located copy for the group-assessment card (a Model B addition). The
// surrounding solo setup form is part of the existing English solo flow.
const WCOPY = {
  en: {
    gEyebrow: 'Group assessment',
    gTitle: 'Your department has dimensions to fill',
    gAssigned: (list) => `You’ve been assigned ${list} on your bank’s shared assessment.`,
    gContribute: 'Contribute to the group assessment →',
    gOrSolo: '…or run a solo assessment below',
    soloEyebrow: 'Solo assessment',
  },
  fr: {
    gEyebrow: 'Évaluation groupée',
    gTitle: 'Votre département a des dimensions à remplir',
    gAssigned: (list) => `Les dimensions ${list} vous ont été affectées sur l’évaluation partagée de votre banque.`,
    gContribute: 'Contribuer à l’évaluation groupée →',
    gOrSolo: '…ou réalisez une évaluation solo ci-dessous',
    soloEyebrow: 'Évaluation solo',
  },
};

const ROLES = [
  'Chief Data Officer',
  'IT Director',
  'Risk Manager',
  'Data Analyst',
  'Compliance Officer',
  'Consultant',
  'Other',
];

// The assessment date is captured automatically — the user never types it.
const TODAY = new Date().toISOString().slice(0, 10);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Plain-language explanation of the 5-step workflow, written so that someone
// with no data or technical background understands the whole journey before
// starting. The question/theme counts are derived from the live questionnaire
// so they stay correct even after an admin edits the content.
function buildWorkflow(indicatorCount, dimensionCount) {
  return [
    {
      title: 'Sign in & set up',
      desc: "Tell us your bank's name and your role. There's nothing to install — this just puts your name on the report.",
    },
    {
      title: 'Answer simple questions',
      desc: `Go through ${indicatorCount} short questions about how your bank handles its data — how it's organised, kept accurate, protected and actually used. The questions are grouped into ${dimensionCount} themes (we call them “dimensions”).`,
    },
    {
      title: 'Get your score',
      desc: "DataPilot instantly turns your answers into a maturity score from 1 (just getting started) to 5 (best-in-class), shown in easy-to-read charts so you can see your strong and weak areas at a glance.",
    },
    {
      title: 'See what to fix first',
      desc: "It points out your biggest weak spots and builds a clear, prioritised to-do list — a practical action plan (with AI help) showing what to improve first for the fastest progress.",
    },
    {
      title: 'Check the rules & share',
      desc: "See whether your bank meets the Tunisian central bank's data rules (BCT) and international banking standards, then download a polished PDF report to share with management.",
    },
  ];
}

function formatToday() {
  return new Date(TODAY).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function Welcome() {
  const navigate = useNavigate();
  const setProfile = useAppStore(s => s.setProfile);
  // Identity is established by authentication — the assessment email is the
  // signed-in user's email, pre-filled and not editable here.
  const authEmail = useAuthStore(s => s.user?.email) || '';
  // The bank is fixed by the user's account (inherited from whoever invited
  // them), not chosen here. Read-only.
  const authBank = useAuthStore(s => s.bankName) || '';
  const signOut = useAuthStore(s => s.signOut);

  // Does this analyst have a group (Model B) assessment to contribute to? We
  // load the bank's active assessment and check which dimensions are assigned to
  // their department. Subscribing to `assignments` keeps the card reactive.
  const loadActive = useAssessmentStore(s => s.loadActive);
  const groupAssessment = useAssessmentStore(s => s.assessment);
  useAssessmentStore(s => s.assignments); // re-render when assignments load
  const myAssignedDims = useAssessmentStore(s => s.myAssignedDims);
  useEffect(() => { loadActive(); }, [loadActive]);
  const groupDims = (groupAssessment && groupAssessment.status === 'draft') ? myAssignedDims() : [];
  const wc = WCOPY[useSettingsStore(s => s.language)] || WCOPY.en;

  // Derived from live content so the copy matches the current questionnaire.
  const WORKFLOW = buildWorkflow(INDICATORS.length, Object.keys(DIMENSIONS).length);

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  const [form, setForm] = useState({
    date: TODAY,
    respondentName: '',
    role: ROLES[0],
    email: authEmail,
  });
  // When "Other" is selected, the actual role is typed here.
  const [customRole, setCustomRole] = useState('');

  const isOther = form.role === 'Other';
  const effectiveRole = isOther ? customRole.trim() : form.role;

  const emailValid = EMAIL_RE.test(form.email.trim());
  // Bank is inherited (may be unset until the super-admin configures it), so it
  // is not a gate to starting the assessment.
  const canStart = form.respondentName.trim() && effectiveRole && emailValid;

  function handleStart() {
    if (!canStart) return;
    // Always stamp the date automatically at the moment the session starts.
    // Persist the typed role (not the literal "Other") when applicable, and the
    // bank inherited from the account.
    setProfile({ ...form, bankName: authBank, role: effectiveRole, date: TODAY, email: form.email.trim() });
    navigate('/assessment');
  }

  return (
    <div className="flex min-h-screen relative">
      {/* Language switch — always available. */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle variant="light" />
      </div>
      {/* Left panel — branding + plain-language workflow */}
      <div className="w-[42%] min-w-[360px] bg-ey-charcoal flex flex-col justify-between p-12">
        <div>
          <div className="text-6xl font-bold text-ey-yellow leading-none">EY</div>
          <div className="w-16 h-1 bg-ey-yellow my-4" />
          <div className="text-3xl font-light text-white">DataPilot</div>
          <div className="text-gray-400 text-sm mt-1">Data Maturity Steering Tool</div>

          <p className="text-sm text-gray-300 leading-relaxed mt-6 max-w-sm">
            DataPilot is a simple, guided check-up of how well your bank manages its
            data — what experts call its <span className="text-white font-medium">“data maturity.”</span>{' '}
            You answer a set of plain questions and the tool does the analysis for you:
            it scores your bank, shows where it stands against banking regulations, and
            gives you a step-by-step plan to improve.
          </p>
          <p className="text-xs text-gray-400 leading-relaxed mt-3 max-w-sm">
            No technical background needed — just answer honestly and follow the five steps below.
          </p>

          {/* How it works — numbered workflow */}
          <div className="mt-8">
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-ey-yellow mb-4">
              How it works
            </div>
            <div className="flex flex-col">
              {WORKFLOW.map((step, i) => (
                <div key={step.title} className="flex gap-4">
                  {/* Number + connecting line */}
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-ey-yellow text-ey-charcoal text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </div>
                    {i < WORKFLOW.length - 1 && <div className="w-px flex-1 bg-gray-600 my-1" />}
                  </div>
                  <div className={i < WORKFLOW.length - 1 ? 'pb-4' : ''}>
                    <div className="text-sm font-semibold text-white leading-tight">{step.title}</div>
                    <div className="text-xs text-gray-400 leading-snug mt-0.5">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-gray-500 text-xs mt-8">
          EY Advisory Tunisia · PFE 2026 Internship Project
        </div>
      </div>

      {/* Right panel — sign-in / profile form */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center p-10">
        <div className="w-full max-w-md flex flex-col gap-4">
          {/* Group assessment invitation — only when a dimension is assigned to
              the analyst's department on an active draft. Solo stays available. */}
          {groupDims.length > 0 && (
            <div className="bg-white rounded-xl border-2 border-ey-yellow p-5 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-widest text-ey-charcoal/60">{wc.gEyebrow}</div>
              <h3 className="text-base font-semibold text-gray-800 mt-0.5">{wc.gTitle}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {wc.gAssigned(groupDims.map(d => `${d} · ${DIMENSIONS[d].name}`).join(', '))}
              </p>
              <button
                onClick={() => navigate('/group')}
                className="mt-3 w-full bg-ey-charcoal text-ey-yellow font-semibold rounded-lg py-2.5 text-sm hover:bg-gray-800"
              >
                {wc.gContribute}
              </button>
              <div className="text-[11px] text-gray-400 text-center mt-2">{wc.gOrSolo}</div>
            </div>
          )}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          {groupDims.length > 0 && (
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{wc.soloEyebrow}</div>
          )}
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-xl font-semibold text-gray-800">Set up your assessment</h2>
            <button
              onClick={handleSignOut}
              className="text-xs font-medium text-gray-400 hover:text-gray-700 flex-shrink-0 mt-1"
            >
              Sign out
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Confirm your details to begin. Your account email identifies this assessment session.
          </p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Bank name
              </label>
              <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600 flex items-center justify-between">
                <span>{authBank || 'Not set — ask your administrator'}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">From your account</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Respondent name
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow focus:border-transparent"
                placeholder="Full name"
                value={form.respondentName}
                onChange={e => setForm(f => ({ ...f, respondentName: e.target.value }))}
              />
            </div>

            {/* Email — taken from the signed-in account, shown read-only. */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Email
              </label>
              <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600 flex items-center justify-between">
                <span>{form.email}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Signed in</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Role / function
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow focus:border-transparent bg-white"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              >
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>

              {/* Free-text role shown only when "Other" is selected. */}
              {isOther && (
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-ey-yellow focus:border-transparent"
                  placeholder="Please specify your role"
                  value={customRole}
                  onChange={e => setCustomRole(e.target.value)}
                  autoFocus
                />
              )}
            </div>

            {/* Assessment date — captured automatically, read-only */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Assessment date
              </label>
              <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600 flex items-center justify-between">
                <span>{formatToday()}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Set automatically</span>
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={!canStart}
              className="mt-2 w-full bg-ey-yellow text-ey-charcoal font-semibold rounded-lg py-3 text-sm hover:bg-yellow-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Start Evaluation →
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
