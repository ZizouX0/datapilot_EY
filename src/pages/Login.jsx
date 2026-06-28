import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useSettingsStore from '../store/useSettingsStore';
import { isSupabaseConfigured } from '../lib/supabase';
import LanguageToggle from '../components/ui/LanguageToggle';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COPY = {
  en: {
    subtitle: 'Data Maturity Steering Tool',
    leftIntro: 'Secure access for authorized assessors. Sign in with the credentials provided by your DataPilot administrator.',
    footer: 'EY Advisory Tunisia · PFE 2026 Internship Project',
    signInTitle: 'Sign in',
    signInSub: "Access is invite-only. Contact your administrator if you don't have an account.",
    emailLabel: 'Email',
    emailPh: 'name@bank.com.tn',
    passwordLabel: 'Password',
    submit: 'Sign in →',
    submitting: 'Signing in…',
  },
  fr: {
    subtitle: 'Outil de pilotage de la maturité des données',
    leftIntro: 'Accès sécurisé réservé aux évaluateurs autorisés. Connectez-vous avec les identifiants fournis par votre administrateur DataPilot.',
    footer: 'EY Advisory Tunisie · Projet de stage PFE 2026',
    signInTitle: 'Connexion',
    signInSub: "L’accès se fait sur invitation uniquement. Contactez votre administrateur si vous n’avez pas de compte.",
    emailLabel: 'E-mail',
    emailPh: 'nom@banque.com.tn',
    passwordLabel: 'Mot de passe',
    submit: 'Se connecter →',
    submitting: 'Connexion en cours…',
  },
};

// Real authentication screen (Supabase email + password). Access is invite-only:
// accounts are created by an administrator, public sign-up is disabled. This page
// only signs existing users in — there is intentionally no "create account" flow.
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const signIn = useAuthStore(s => s.signIn);
  const error = useAuthStore(s => s.error);
  const lang = useSettingsStore(s => s.language);
  const c = COPY[lang] || COPY.en;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const emailValid = EMAIL_RE.test(email.trim());
  const canSubmit = emailValid && password.length > 0 && !submitting;

  // Send the user back to wherever they were headed before the auth gate
  // bounced them here (defaults to the home/setup page).
  const from = location.state?.from?.pathname || '/';

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    const { error: err } = await signIn(email, password);
    setSubmitting(false);
    if (!err) navigate(from, { replace: true });
  }

  return (
    <div className="flex min-h-screen relative">
      {/* Language switch — always available, even before signing in. */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle variant="light" />
      </div>
      {/* Left panel — EY branding (mirrors the look of the rest of the app) */}
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

        <div className="text-gray-500 text-xs mt-8">
          {c.footer}
        </div>
      </div>

      {/* Right panel — sign-in form */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center p-10">
        <div className="bg-white rounded-xl border border-gray-200 p-8 w-full max-w-md shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">{c.signInTitle}</h2>
          <p className="text-sm text-gray-500 mb-6">
            {c.signInSub}
          </p>

          {!isSupabaseConfigured && (
            <div className="mb-5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-800">
              <div className="font-semibold mb-1">Authentication backend not configured</div>
              Set <code className="font-mono">VITE_SUPABASE_URL</code> and{' '}
              <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> in your{' '}
              <code className="font-mono">.env</code> file, then restart the dev server.
              See <code className="font-mono">SUPABASE_SETUP.md</code>.
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {c.emailLabel}
              </label>
              <input
                type="email"
                autoComplete="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow focus:border-transparent"
                placeholder={c.emailPh}
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={!isSupabaseConfigured}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {c.passwordLabel}
              </label>
              <input
                type="password"
                autoComplete="current-password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow focus:border-transparent"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={!isSupabaseConfigured}
              />
            </div>

            {error && (
              <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit || !isSupabaseConfigured}
              className="mt-2 w-full bg-ey-yellow text-ey-charcoal font-semibold rounded-lg py-3 text-sm hover:bg-yellow-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? c.submitting : c.submit}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
