import { useNavigate, Link } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';
import useAuthStore from '../../store/useAuthStore';
import useSettingsStore from '../../store/useSettingsStore';
import Avatar from '../ui/Avatar';

export default function Topbar() {
  const navigate = useNavigate();
  const profile = useAppStore(s => s.profile);
  const fillRandomAnswers = useAppStore(s => s.fillRandomAnswers);

  const user = useAuthStore(s => s.user);
  const role = useAuthStore(s => s.role);
  const isAdmin = useAuthStore(s => s.isAdmin());
  const fullName = useAuthStore(s => s.fullName);
  const avatarUrl = useAuthStore(s => s.avatarUrl);
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
        {/* Assessment-only chrome — hidden from admins, who don't run assessments. */}
        {!isAdmin && (
          <>
            {/* DEV ONLY — quick fill for testing. Hide before release. */}
            <button
              onClick={fillRandomAnswers}
              title="Fill all indicators with random scores (dev/test only)"
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1 rounded text-xs font-medium"
            >
              ⚡ Skip evaluation
            </button>

            {profile.bankName && (
              <span className="bg-gray-700 text-gray-200 px-3 py-1 rounded text-xs">
                🏦 {profile.bankName}
              </span>
            )}
          </>
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
            {(role === 'admin' || role === 'superadmin') && (
              <span className="bg-ey-purple text-white px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide">
                {role === 'superadmin' ? 'Super Admin' : 'Admin'}
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
