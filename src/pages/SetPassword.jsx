import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/useAuthStore';
import useSettingsStore from '../store/useSettingsStore';
import LanguageToggle from '../components/ui/LanguageToggle';

const COPY = {
  en: {
    subtitle: 'Data Maturity Steering Tool',
    leftIntro: 'Welcome aboard. Set a password to finish activating your account.',
    footer: 'EY Consulting Tunisia · PFE 2026 Internship Project',
    title: 'Set your password',
    invalidLink: 'This link is invalid or has expired. Please open the most recent invitation email, or ask an administrator to re-send your invite.',
    doneMsg: 'Password set. Taking you to DataPilot…',
    newPassword: 'New password',
    newPasswordPh: 'At least 8 characters',
    confirmPassword: 'Confirm password',
    confirmPasswordPh: 'Re-enter password',
    mismatch: "Passwords don't match.",
    submit: 'Set password & continue →',
    submitting: 'Saving…',
  },
  fr: {
    subtitle: 'Outil de pilotage de la maturité des données',
    leftIntro: 'Bienvenue. Définissez un mot de passe pour finaliser l’activation de votre compte.',
    footer: 'EY Consulting Tunisie · Projet de stage PFE 2026',
    title: 'Définir votre mot de passe',
    invalidLink: 'Ce lien est invalide ou a expiré. Veuillez ouvrir l’e-mail d’invitation le plus récent, ou demander à un administrateur de renvoyer votre invitation.',
    doneMsg: 'Mot de passe défini. Redirection vers DataPilot…',
    newPassword: 'Nouveau mot de passe',
    newPasswordPh: 'Au moins 8 caractères',
    confirmPassword: 'Confirmer le mot de passe',
    confirmPasswordPh: 'Ressaisissez le mot de passe',
    mismatch: 'Les mots de passe ne correspondent pas.',
    submit: 'Définir le mot de passe et continuer →',
    submitting: 'Enregistrement…',
  },
};

// Where invited users land after clicking the email link. Supabase establishes
// a session from the link automatically (detectSessionInUrl), so here we just
// let them choose a password. Also usable by any signed-in user to change it.
export default function SetPassword() {
  const navigate = useNavigate();
  const session = useAuthStore(s => s.session);
  const lang = useSettingsStore(s => s.language);
  const c = COPY[lang] || COPY.en;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const valid = password.length >= 8 && password === confirm;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (err) { setError(err.message); return; }
    setDone(true);
    setTimeout(() => navigate('/', { replace: true }), 1200);
  }

  return (
    <div className="flex min-h-screen relative">
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle variant="light" />
      </div>
      <div className="w-[42%] min-w-[360px] bg-ey-charcoal flex flex-col justify-between p-12">
        <div>
          <div className="text-6xl font-bold text-ey-yellow leading-none">EY</div>
          <div className="w-16 h-1 bg-ey-yellow my-4" />
          <div className="text-3xl font-light text-white">DataPilot</div>
          <div className="text-gray-400 text-sm mt-1">{c.subtitle}</div>
          <p className="text-sm text-gray-300 leading-relaxed mt-8 max-w-sm">
            {c.leftIntro}
          </p>
        </div>
        <div className="text-gray-500 text-xs mt-8">{c.footer}</div>
      </div>

      <div className="flex-1 bg-gray-50 flex items-center justify-center p-10">
        <div className="bg-white rounded-xl border border-gray-200 p-8 w-full max-w-md shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">{c.title}</h2>

          {!session ? (
            <p className="text-sm text-gray-500 mt-3">
              {c.invalidLink}
            </p>
          ) : done ? (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-3">
              {c.doneMsg}
            </p>
          ) : (
            <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{c.newPassword}</label>
                <input
                  type="password" autoComplete="new-password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow"
                  placeholder={c.newPasswordPh}
                  value={password} onChange={e => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{c.confirmPassword}</label>
                <input
                  type="password" autoComplete="new-password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow"
                  placeholder={c.confirmPasswordPh}
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                />
                {confirm.length > 0 && password !== confirm && (
                  <p className="text-[11px] text-red-600 mt-1">{c.mismatch}</p>
                )}
              </div>
              {error && (
                <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}
              <button
                type="submit" disabled={!valid || submitting}
                className="mt-2 w-full bg-ey-yellow text-ey-charcoal font-semibold rounded-lg py-3 text-sm hover:bg-yellow-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? c.submitting : c.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
