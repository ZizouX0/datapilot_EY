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

// Default the assessment date to today (YYYY-MM-DD for the native date input).
const DEFAULT_DATE = new Date().toISOString().slice(0, 10);

export default function Welcome() {
  const navigate = useNavigate();
  const setProfile = useAppStore(s => s.setProfile);

  const [form, setForm] = useState({
    bankName: '',
    date: DEFAULT_DATE,
    respondentName: '',
    role: ROLES[0],
  });

  function handleStart() {
    setProfile(form);
    navigate('/assessment');
  }

  const dims = Object.entries(DIMENSIONS);

  return (
    <div className="flex h-screen">
      {/* Left panel */}
      <div className="w-[40%] min-w-[340px] bg-ey-charcoal flex flex-col justify-between p-12">
        <div>
          <div className="text-6xl font-bold text-ey-yellow leading-none">EY</div>
          <div className="w-16 h-1 bg-ey-yellow my-4" />
          <div className="text-3xl font-light text-white">DataPilot</div>
          <div className="text-gray-400 text-sm mt-1">Data Maturity Steering Tool</div>

          <div className="mt-1 border-t border-gray-600 pt-6">
            <div className="flex flex-col gap-4 mt-2">
              {[
                '5 dimensions, 47 evidence-based indicators',
                'CMMI 5-level scoring with per-indicator rubrics',
                'BCT Circulaire N°2025-08 and BCBS 239 compliance mapping',
                'Automated gap analysis and improvement roadmap',
              ].map(f => (
                <div key={f} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-ey-yellow flex-shrink-0 mt-1.5" />
                  <span className="text-sm text-gray-300 leading-snug">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dimension pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            {dims.map(([key, d]) => (
              <span
                key={key}
                className="px-2 py-1 rounded text-xs font-semibold text-white"
                style={{ background: d.color }}
              >
                {key} · {Math.round(d.weight * 100)}%
              </span>
            ))}
          </div>
        </div>

        <div className="text-gray-500 text-xs">
          EY Advisory Tunisia · PFE 2026 Internship Project
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center p-10">
        <div className="bg-white rounded-xl border border-gray-200 p-8 w-full max-w-md shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Start your evaluation</h2>
          <p className="text-sm text-gray-500 mb-6">Fill in the profile details to begin your assessment session.</p>

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
                Assessment date
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow focus:border-transparent"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
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

            <button
              onClick={handleStart}
              disabled={!form.bankName.trim() || !form.date.trim() || !form.respondentName.trim() || !form.role.trim()}
              className="mt-2 w-full bg-ey-yellow text-ey-charcoal font-semibold rounded-lg py-3 text-sm hover:bg-yellow-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Start Evaluation →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
