import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAppStore from '../store/useAppStore';
import { TUNISIAN_BANKS } from '../data/tunisianBanks';
import BankAutocomplete from '../components/ui/BankAutocomplete';

const ROLES = [
  'Chief Data Officer',
  'IT Director',
  'Risk Manager',
  'Data Analyst',
  'Compliance Officer',
  'Other',
];

// The assessment date is captured automatically — the user never types it.
const TODAY = new Date().toISOString().slice(0, 10);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Plain-language explanation of the 5-step workflow, shown so a first-time
// user understands the whole journey before starting.
const WORKFLOW = [
  { title: 'Sign in & set up', desc: 'Identify your bank and yourself by email.' },
  { title: 'Assess', desc: 'Answer 47 evidence-based questions across 5 dimensions.' },
  { title: 'Get your score', desc: 'See your CMMI maturity level, radar and dimension breakdown.' },
  { title: 'Close the gaps', desc: 'Receive a prioritized, AI-assisted improvement roadmap.' },
  { title: 'Check compliance & export', desc: 'Verify BCT 2025-08 / BCBS 239 status and download branded PDF reports.' },
];

function formatToday() {
  return new Date(TODAY).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function Welcome() {
  const navigate = useNavigate();
  const setProfile = useAppStore(s => s.setProfile);

  const [form, setForm] = useState({
    bankName: '',
    date: TODAY,
    respondentName: '',
    role: ROLES[0],
    email: '',
  });
  const [emailTouched, setEmailTouched] = useState(false);

  const emailValid = EMAIL_RE.test(form.email.trim());
  const emailError = emailTouched && form.email.trim() !== '' && !emailValid;
  const canStart =
    form.bankName.trim() && form.respondentName.trim() && form.role.trim() && emailValid;

  function handleStart() {
    if (!canStart) return;
    // Always stamp the date automatically at the moment the session starts.
    setProfile({ ...form, date: TODAY, email: form.email.trim() });
    navigate('/assessment');
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding + plain-language workflow */}
      <div className="w-[42%] min-w-[360px] bg-ey-charcoal flex flex-col justify-between p-12">
        <div>
          <div className="text-6xl font-bold text-ey-yellow leading-none">EY</div>
          <div className="w-16 h-1 bg-ey-yellow my-4" />
          <div className="text-3xl font-light text-white">DataPilot</div>
          <div className="text-gray-400 text-sm mt-1">Data Maturity Steering Tool</div>

          <p className="text-sm text-gray-300 leading-relaxed mt-6 max-w-sm">
            DataPilot measures how mature your bank's data management is, benchmarks it against
            Tunisian regulation, and hands you a concrete plan to improve — in five guided steps.
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
        <div className="bg-white rounded-xl border border-gray-200 p-8 w-full max-w-md shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Sign in to start</h2>
          <p className="text-sm text-gray-500 mb-6">
            Enter your details to begin. Your email identifies this assessment session.
          </p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Bank name
              </label>
              <BankAutocomplete
                options={TUNISIAN_BANKS}
                placeholder="Start typing, e.g. BIAT…"
                value={form.bankName}
                onChange={val => setForm(f => ({ ...f, bankName: val }))}
              />
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

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Email
              </label>
              <input
                type="email"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                  emailError
                    ? 'border-red-300 focus:ring-red-300'
                    : 'border-gray-300 focus:ring-ey-yellow'
                }`}
                placeholder="name@bank.com.tn"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                onBlur={() => setEmailTouched(true)}
              />
              {emailError && (
                <p className="text-[11px] text-red-600 mt-1">Enter a valid email address.</p>
              )}
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
              Sign in & Start Evaluation →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
