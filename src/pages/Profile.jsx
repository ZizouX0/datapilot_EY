import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAppStore from '../store/useAppStore';
import useAuthStore from '../store/useAuthStore';
import useSettingsStore from '../store/useSettingsStore';
import { DIMENSIONS } from '../data/indicators';

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

const COPY = {
  en: {
    title: 'Bank Profile',
    subtitle: 'Configure your assessment session details.',
    bankName: 'Bank name',
    bankUnset: 'Not set — ask your administrator',
    fromAccount: 'From your account',
    respondentName: 'Respondent name',
    fullNamePh: 'Full name',
    email: 'Email',
    emailInvalid: 'Enter a valid email address.',
    assessmentDate: 'Assessment date',
    setAuto: 'Set automatically',
    roleFunction: 'Role / function',
    dimensions: 'Dimensions',
    proxy: '(proxy)',
    save: 'Save & Start Assessment →',
    resetAll: 'Reset All',
    resetTitle: 'Reset everything?',
    resetBody: 'This permanently deletes the bank profile and all questionnaire answers, including saved progress. This action cannot be undone.',
    cancel: 'Cancel',
  },
  fr: {
    title: 'Profil de la banque',
    subtitle: 'Configurez les détails de votre session d’évaluation.',
    bankName: 'Nom de la banque',
    bankUnset: 'Non défini — demandez à votre administrateur',
    fromAccount: 'Depuis votre compte',
    respondentName: 'Nom du répondant',
    fullNamePh: 'Nom complet',
    email: 'E-mail',
    emailInvalid: 'Saisissez une adresse e-mail valide.',
    assessmentDate: 'Date de l’évaluation',
    setAuto: 'Définie automatiquement',
    roleFunction: 'Rôle / fonction',
    dimensions: 'Dimensions',
    proxy: '(proxy)',
    save: 'Enregistrer et démarrer l’évaluation →',
    resetAll: 'Tout réinitialiser',
    resetTitle: 'Tout réinitialiser ?',
    resetBody: 'Cette action supprime définitivement le profil de la banque et toutes les réponses au questionnaire, y compris la progression enregistrée. Cette action est irréversible.',
    cancel: 'Annuler',
  },
};

function formatDate(d, lang) {
  if (!d) return '—';
  const parsed = new Date(d);
  return isNaN(parsed.getTime())
    ? d
    : parsed.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function Profile() {
  const navigate = useNavigate();
  const profile = useAppStore(s => s.profile);
  const setProfile = useAppStore(s => s.setProfile);
  const resetAll = useAppStore(s => s.resetAll);
  // Bank is inherited from the account (set by the super-admin), read-only here.
  const authBank = useAuthStore(s => s.bankName) || '';
  const lang = useSettingsStore(s => s.language);
  const c = COPY[lang] || COPY.en;

  const [form, setForm] = useState({
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
    if (!form.respondentName.trim() || !emailValid) return;
    setProfile({ ...form, bankName: authBank, email: form.email.trim() });
    navigate('/assessment');
  }

  function handleReset() {
    resetAll();
    setForm({ date: DEFAULT_DATE, respondentName: '', role: ROLES[0], email: '' });
    setShowResetConfirm(false);
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">{c.title}</h2>
        <p className="text-sm text-gray-500 mb-6">{c.subtitle}</p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {c.bankName}
            </label>
            <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600 flex items-center justify-between">
              <span>{authBank || c.bankUnset}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">{c.fromAccount}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {c.respondentName}
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow focus:border-transparent"
              placeholder={c.fullNamePh}
              value={form.respondentName}
              onChange={e => setForm(f => ({ ...f, respondentName: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {c.email}
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
              <p className="text-[11px] text-red-600 mt-1">{c.emailInvalid}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {c.assessmentDate}
            </label>
            <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600 flex items-center justify-between">
              <span>{formatDate(form.date, lang)}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">{c.setAuto}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {c.roleFunction}
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
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{c.dimensions}</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(DIMENSIONS).map(([key, d]) => (
                <span
                  key={key}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ background: d.color }}
                >
                  {key} · {d.name} · {Math.round(d.weight * 100)}%
                  {d.proxy && ` ${c.proxy}`}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={!form.respondentName.trim() || !emailValid}
              className="flex-1 bg-ey-yellow text-ey-charcoal font-semibold rounded-lg py-2.5 text-sm hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {c.save}
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              {c.resetAll}
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
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{c.resetTitle}</h3>
            <p className="text-sm text-gray-500 mb-6">
              {c.resetBody}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                {c.cancel}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg text-sm hover:bg-red-700"
              >
                {c.resetAll}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
