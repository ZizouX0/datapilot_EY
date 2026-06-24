import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/useAuthStore';
import useSettingsStore from '../store/useSettingsStore';
import { LANGUAGES } from '../lib/i18n';
import { MATURITY_LEVELS } from '../store/useAppStore';
import Avatar from '../components/ui/Avatar';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB

function maturityColor(score) {
  if (score === null || score === undefined) return '#9CA3AF';
  const lvl = MATURITY_LEVELS.find(l => score >= l.min && score <= l.max) || MATURITY_LEVELS[4];
  return lvl.color;
}

// Account settings, available to every role. Users can edit their display name
// and language, and change their password. Email, position, role and status are
// read-only here (role/status/email are administered elsewhere).
export default function Account() {
  const user = useAuthStore(s => s.user);
  const role = useAuthStore(s => s.role);
  const isAdmin = useAuthStore(s => s.isAdmin());
  const avatarUrl = useAuthStore(s => s.avatarUrl);
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

  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  // The caller's own submissions (analysts only). Scoped to analyst_id so an
  // admin viewing their own account never sees the whole org's submissions.
  const [mySubs, setMySubs] = useState([]);

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

  // Load my own submissions (only relevant for analysts; admins don't assess).
  useEffect(() => {
    if (!user?.id || isAdmin) return;
    let alive = true;
    supabase
      .from('submissions')
      .select('id, bank_name, global_score, bct_rate, created_at')
      .eq('analyst_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (alive) setMySubs(data || []); });
    return () => { alive = false; };
  }, [user?.id, isAdmin]);

  async function handleDeleteSub(id) {
    if (!window.confirm(t('account.sub.confirmDelete'))) return;
    const { error } = await supabase.from('submissions').delete().eq('id', id);
    if (!error) setMySubs(subs => subs.filter(s => s.id !== id));
  }

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

  async function handlePickPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;
    setInfoMsg(null);
    if (!file.type.startsWith('image/')) {
      setInfoMsg({ ok: false, text: t('account.photoInvalid') });
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setInfoMsg({ ok: false, text: t('account.photoTooLarge') });
      return;
    }
    setUploading(true);
    const path = `${user.id}/avatar`;
    const { error: upErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      setUploading(false);
      setInfoMsg({ ok: false, text: upErr.message });
      return;
    }
    // Public bucket → stable URL; cache-bust so the new image shows immediately.
    const base = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
    const url = `${base}?v=${Date.now()}`;
    const { error } = await postUpdateSelf({ avatarUrl: url });
    setUploading(false);
    if (error) {
      setInfoMsg({ ok: false, text: error });
    } else {
      useAuthStore.setState({ avatarUrl: url });
      setInfoMsg({ ok: true, text: t('account.saved') });
    }
  }

  async function handleRemovePhoto() {
    setInfoMsg(null);
    setUploading(true);
    await supabase.storage.from('avatars').remove([`${user.id}/avatar`]);
    const { error } = await postUpdateSelf({ avatarUrl: null });
    setUploading(false);
    if (error) {
      setInfoMsg({ ok: false, text: error });
    } else {
      useAuthStore.setState({ avatarUrl: null });
      setInfoMsg({ ok: true, text: t('account.saved') });
    }
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
          {/* Profile photo */}
          <div>
            <label className={labelCls}>{t('account.photo')}</label>
            <div className="flex items-center gap-4">
              <Avatar url={avatarUrl} name={name} email={user?.email} size={56} />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="text-sm font-medium text-gray-700 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {uploading ? t('account.uploading') : t('account.changePhoto')}
                  </button>
                  {avatarUrl && !uploading && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      {t('account.removePhoto')}
                    </button>
                  )}
                </div>
                <span className="text-[11px] text-gray-400">{t('account.photoHint')}</span>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handlePickPhoto}
                className="hidden"
              />
            </div>
          </div>

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

      {/* My submissions — analysts only. */}
      {!isAdmin && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mt-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {t('account.section.submissions')}
          </h2>
          <p className="text-sm text-gray-500 mb-4">{t('account.sub.subtitle')}</p>

          {mySubs.length === 0 ? (
            <p className="text-sm text-gray-400">{t('account.sub.empty')}</p>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left font-semibold px-4 py-2.5">{t('account.sub.bank')}</th>
                    <th className="text-left font-semibold px-4 py-2.5">{t('account.sub.maturity')}</th>
                    <th className="text-left font-semibold px-4 py-2.5">BCT</th>
                    <th className="text-left font-semibold px-4 py-2.5">{t('account.sub.submitted')}</th>
                    <th className="px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mySubs.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {s.bank_name || '—'}
                      </td>
                      <td className="px-4 py-3">
                        {s.global_score != null ? (
                          <span className="font-semibold" style={{ color: maturityColor(s.global_score) }}>
                            {Math.round(s.global_score * 20)}%
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{s.bct_rate ?? 0}%</td>
                      <td className="px-4 py-3 text-gray-500">
                        {s.created_at
                          ? new Date(s.created_at).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-GB')
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteSub(s.id)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          {t('account.sub.delete')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
