import { useNavigate, useLocation, Link } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';
import useAuthStore from '../../store/useAuthStore';
import useSettingsStore from '../../store/useSettingsStore';
import { roleLabel } from '../../lib/roles';
import Avatar from '../ui/Avatar';
import LanguageToggle from '../ui/LanguageToggle';

export default function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();
  // Reset/Skip act on the SOLO assessment (useAppStore). On the group page the
  // analyst is filling the shared server draft, so those buttons would silently
  // affect unrelated solo state — hide them there.
  const onGroup = location.pathname === '/group';
  const toggleAutoFill = useAppStore(s => s.toggleAutoFill);
  const autoFilled = useAppStore(s => s.autoFilled);
  const resetAnswers = useAppStore(s => s.resetAnswers);

  const user = useAuthStore(s => s.user);
  const role = useAuthStore(s => s.role);
  const isAdmin = useAuthStore(s => s.isAdmin());
  const fullName = useAuthStore(s => s.fullName);
  const avatarUrl = useAuthStore(s => s.avatarUrl);
  // Bank is an account attribute (inherited from the inviter), not a per-session
  // value the analyst types — so the chip reflects the signed-in user's bank.
  const bankName = useAuthStore(s => s.bankName);
  const signOut = useAuthStore(s => s.signOut);
  const t = useSettingsStore(s => s.t);

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-ey-charcoal flex items-center px-6 gap-4 no-print">
      <div className="flex items-center gap-3">
        <span className="bg-ey-yellow text-ey-charcoal font-bold px-2 py-0.5 rounded text-sm leading-none">
          EY
        </span>
        <span className="text-white font-semibold text-base">DataPilot</span>
        <span className="text-gray-400 text-sm hidden sm:inline">{t('top.subtitle')}</span>
      </div>
      <div className="ml-auto flex items-center gap-2 text-sm">
        {/* Language switch — always available. */}
        <LanguageToggle variant="dark" />

        {/* Assessment-only chrome — hidden from admins, who don't run assessments. */}
        {!isAdmin && !onGroup && (
          <>
            {/* Reset — clears every answer so the assessment is "all not done"
                again and the analyst can fill it from scratch. */}
            <button
              onClick={() => { if (window.confirm(t('top.resetConfirm'))) resetAnswers(); }}
              title={t('top.resetTitle')}
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1 rounded text-xs font-medium"
            >
              {t('top.reset')}
            </button>

            {/* Skip evaluation — a test helper that auto-fills every indicator
                (toggle off restores the analyst's own answers). */}
            <button
              onClick={toggleAutoFill}
              title={autoFilled ? t('top.skipTitleOn') : t('top.skipTitleOff')}
              className={
                (autoFilled
                  ? 'bg-ey-yellow text-ey-charcoal hover:brightness-95'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-200') +
                ' px-3 py-1 rounded text-xs font-medium'
              }
            >
              {autoFilled ? t('top.skipOn') : t('top.skip')}
            </button>

            {bankName && (
              <span className="bg-gray-700 text-gray-200 px-3 py-1 rounded text-xs">
                🏦 {bankName}
              </span>
            )}
          </>
        )}

        {/* Guide — a lost user can re-read their role and the workflow any time. */}
        {user && (
          <Link
            to="/guide"
            title="How DataPilot works and what your role does"
            className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1 rounded text-xs font-medium"
          >
            <span aria-hidden>📘</span><span className="hidden sm:inline">{t('top.guide')}</span>
          </Link>
        )}

        {/* Authenticated identity (links to account) + role badge + sign out. */}
        {user && (
          <>
            <Link
              to="/account"
              title={t('top.account')}
              className="flex items-center gap-2 text-gray-300 hover:text-white max-w-[40vw]"
            >
              <Avatar url={avatarUrl} name={fullName} email={user.email} size={26} />
              <span className="truncate">{fullName || user.email}</span>
            </Link>
            {isAdmin && (
              <span className="bg-ey-purple text-white px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide">
                {roleLabel(role)}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1 rounded text-xs font-medium"
            >
              {t('top.signOut')}
            </button>
          </>
        )}
      </div>
    </header>
  );
}
