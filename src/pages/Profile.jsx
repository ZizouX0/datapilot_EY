import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAppStore from '../store/useAppStore';
import { DIMENSIONS } from '../data/indicators';
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

// The assessment date is captured automatically — never typed.
const DEFAULT_DATE = new Date().toISOString().slice(0, 10);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatDate(d) {
  if (!d) return '—';
  const parsed = new Date(d);
  return isNaN(parsed.getTime())
    ? d
    : parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function Profile() {
  const navigate = useNavigate();
  const profile = useAppStore(s => s.profile);
  const setProfile = useAppStore(s => s.setProfile);
  const resetAll = useAppStore(s => s.resetAll);

  const [form, setForm] = useState({
    bankName: profile.bankName || '',
    // Keep the original session date if one exists, otherwise stamp today.
    date: profile.date || DEFAULT_DATE,
    respondentName: profile.respondentName || '',
    role: profile.role || ROLES[0],
    email: profile.email || '',
  });
  const [emailTouched, setEmailTouched] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const emailValid = EMAIL_RE.test(form.email.trim());
  const emailError = emailTouched && form.email.trim() !== '' && !emailValid;

  function handleSave() {
    if (!form.bankName.trim() || !form.respondentName.trim() || !emailValid) return;
    setProfile({ ...form, email: form.email.trim() });
    navigate('/assessment');
  }

  function handleReset() {
    resetAll();
    setForm({ bankName: '', date: DEFAULT_DATE, respondentName: '', role: ROLES[0], email: '' });
    setShowResetConfirm(false);
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Bank Profile</h2>
        <p className="text-sm text-gray-500 mb-6">Configure your assessment session details.</p>

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
                emailError ? 'border-red-300 focus:ring-red-300' : 'border-gray-300 focus:ring-ey-yellow'
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
              Assessment date
            </label>
            <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600 flex items-center justify-between">
              <span>{formatDate(form.date)}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Set automatically</span>
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
          </div>

          {/* Dimension overview */}
          <div className="pt-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Dimensions</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(DIMENSIONS).map(([key, d]) => (
                <span
                  key={key}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ background: d.color }}
                >
                  {key} · {d.name} · {Math.round(d.weight * 100)}%
                  {d.proxy && ' (proxy)'}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={!form.bankName || !form.respondentName || !emailValid}
              className="flex-1 bg-ey-yellow text-ey-charcoal font-semibold rounded-lg py-2.5 text-sm hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save & Start Assessment →
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Reset All
            </button>
          </div>
        </div>
      </div>

      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowResetConfirm(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Reset everything?</h3>
            <p className="text-sm text-gray-500 mb-6">
              This permanently deletes the bank profile and all questionnaire answers,
              including saved progress. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg text-sm hover:bg-red-700"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
