import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/useAuthStore';
import useSettingsStore from '../store/useSettingsStore';
import { LANGUAGES } from '../lib/i18n';

// Account settings, available to every role. Users can edit their display name
// and language, and change their password. Email, position, role and status are
// read-only here (role/status/email are administered elsewhere).
export default function Account() {
  const user = useAuthStore(s => s.user);
  const role = useAuthStore(s => s.role);
  const language = useSettingsStore(s => s.language);
  const setLanguage = useSettingsStore(s => s.setLanguage);
  const t = useSettingsStore(s => s.t);

  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMsg, setInfoMsg] = useState(null); // { ok, text }

  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState(null); // { ok, text }

  // Load the signed-in user's own profile row (allowed by RLS: select own).
  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    supabase
      .from('profiles')
      .select('full_name, title, role, disabled, created_at')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (!alive || !data) return;
        setProfile(data);
        setName(data.full_name || '');
      });
    return () => { alive = false; };
  }, [user?.id]);

  async function postUpdateSelf(payload) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return { error: 'Your session has expired — sign in again.' };
    let res, body;
    try {
      res = await fetch('/api/update-self', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      body = await res.json();
    } catch {
      return { error: 'Could not reach the profile service.' };
    }
    if (!res.ok) return { error: body?.error || 'Update failed.' };
    return { body };
  }

  async function handleSaveInfo(e) {
    e.preventDefault();
    setSavingInfo(true);
    setInfoMsg(null);
    const { error } = await postUpdateSelf({ fullName: name, language });
    setSavingInfo(false);
    if (error) {
      setInfoMsg({ ok: false, text: error });
    } else {
      // Reflect the new name in the shared store (top bar etc.).
      useAuthStore.setState({ fullName: name.trim() || null });
      setInfoMsg({ ok: true, text: t('account.saved') });
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (pwd.length < 8) return;
    if (pwd !== pwd2) {
      setPwdMsg({ ok: false, text: t('account.passwordMismatch') });
      return;
    }
    setSavingPwd(true);
    setPwdMsg(null);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setSavingPwd(false);
    if (error) {
      setPwdMsg({ ok: false, text: error.message });
    } else {
      setPwd(''); setPwd2('');
      setPwdMsg({ ok: true, text: t('account.passwordChanged') });
    }
  }

  const created = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-GB',
        { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

  const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1';
  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow focus:border-transparent';
  const roCls = 'w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600';

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-1">{t('account.title')}</h1>
      <p className="text-sm text-gray-500 mb-6">{t('account.subtitle')}</p>

      {/* Account information */}
      <form onSubmit={handleSaveInfo} className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
          {t('account.section.info')}
        </h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>{t('account.displayName')}</label>
            <input
              className={inputCls}
              placeholder={t('account.namePlaceholder')}
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* Read-only identity fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{t('account.email')}</label>
              <div className={roCls}>{user?.email || '—'}</div>
              <p className="text-[11px] text-gray-400 mt-1">{t('account.emailNote')}</p>
            </div>
            <div>
              <label className={labelCls}>{t('account.position')}</label>
              <div className={roCls}>
                {profile?.title || <span className="text-gray-400 italic">—</span>}
              </div>
            </div>
            <div>
              <label className={labelCls}>{t('account.role')}</label>
              <div className={roCls}>{t(`role.${role}`)}</div>
            </div>
            <div>
              <label className={labelCls}>{t('account.status')}</label>
              <div className={roCls}>
                {profile?.disabled ? t('status.disabled') : t('status.active')}
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>{t('account.memberSince')}</label>
            <div className={roCls}>{created}</div>
          </div>

          <div>
            <label className={labelCls}>{t('account.language')}</label>
            <select
              className={inputCls + ' bg-white'}
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={savingInfo}
              className="bg-ey-yellow text-ey-charcoal font-semibold rounded-lg px-5 py-2.5 text-sm hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {savingInfo ? t('account.saving') : t('account.save')}
            </button>
            {infoMsg && (
              <span className={`text-sm rounded-lg px-3 py-1.5 border ${
                infoMsg.ok ? 'text-green-700 bg-green-50 border-green-200'
                           : 'text-red-600 bg-red-50 border-red-200'
              }`}>
                {infoMsg.text}
              </span>
            )}
          </div>
        </div>
      </form>

      {/* Security — password change */}
      <form onSubmit={handleChangePassword} className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
          {t('account.section.security')}
        </h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>{t('account.newPassword')}</label>
            <input
              type="password" autoComplete="new-password"
              className={inputCls}
              placeholder="••••••••"
              value={pwd}
              onChange={e => setPwd(e.target.value)}
            />
            <p className="text-[11px] text-gray-400 mt-1">{t('account.passwordHint')}</p>
          </div>
          <div>
            <label className={labelCls}>{t('account.confirmPassword')}</label>
            <input
              type="password" autoComplete="new-password"
              className={inputCls}
              placeholder="••••••••"
              value={pwd2}
              onChange={e => setPwd2(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={savingPwd || pwd.length < 8 || pwd !== pwd2}
              className="bg-ey-charcoal text-white font-semibold rounded-lg px-5 py-2.5 text-sm hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {savingPwd ? t('account.saving') : t('account.changePassword')}
            </button>
            {pwdMsg && (
              <span className={`text-sm rounded-lg px-3 py-1.5 border ${
                pwdMsg.ok ? 'text-green-700 bg-green-50 border-green-200'
                          : 'text-red-600 bg-red-50 border-red-200'
              }`}>
                {pwdMsg.text}
              </span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
