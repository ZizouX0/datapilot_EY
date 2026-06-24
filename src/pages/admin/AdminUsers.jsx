import { useEffect, useState } from 'react';
import useUsersStore from '../../store/useUsersStore';
import useAuthStore from '../../store/useAuthStore';

// Roles a super-admin may assign vs. a regular admin (who manages analysts only
// and can never grant or alter super-admin).
const SUPERADMIN_ROLES = ['analyst', 'admin', 'superadmin'];
const ADMIN_ROLES = ['analyst', 'admin'];
const ROLE_LABELS = { superadmin: 'Super Admin', admin: 'Admin', analyst: 'Analyst' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminUsers() {
  const {
    users, loading, error, listUsers, setUserRole, inviteUser,
    setUserTitle, setUserDisabled, resetPassword,
  } = useUsersStore();
  const currentUserId = useAuthStore(s => s.user?.id);
  const isSuperAdmin = useAuthStore(s => s.isSuperAdmin());
  const assignableRoles = isSuperAdmin ? SUPERADMIN_ROLES : ADMIN_ROLES;
  const [busyId, setBusyId] = useState(null);
  const [rowError, setRowError] = useState(null);
  const [rowMsg, setRowMsg] = useState(null);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteTitle, setInviteTitle] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState(null); // { ok, text }

  useEffect(() => {
    listUsers();
  }, [listUsers]);

  async function handleInvite(e) {
    e.preventDefault();
    if (!EMAIL_RE.test(inviteEmail.trim())) return;
    setInviting(true);
    setInviteMsg(null);
    const { error: err } = await inviteUser(inviteEmail, inviteTitle);
    setInviting(false);
    if (err) {
      setInviteMsg({ ok: false, text: err });
    } else {
      setInviteMsg({ ok: true, text: `Invitation sent to ${inviteEmail.trim()}.` });
      setInviteEmail('');
      setInviteTitle('');
    }
  }

  async function handleRoleChange(id, role) {
    setBusyId(id); setRowError(null); setRowMsg(null);
    const { error: err } = await setUserRole(id, role);
    setBusyId(null);
    if (err) setRowError(err);
  }

  async function handleEditTitle(u) {
    const next = window.prompt(`Position / title for ${u.email}:`, u.title || '');
    if (next === null) return; // cancelled
    setBusyId(u.id); setRowError(null); setRowMsg(null);
    const { error: err } = await setUserTitle(u.id, next);
    setBusyId(null);
    if (err) setRowError(err);
  }

  async function handleToggleDisabled(u) {
    const verb = u.disabled ? 'Re-enable' : 'Disable';
    if (!window.confirm(`${verb} the account ${u.email}?`)) return;
    setBusyId(u.id); setRowError(null); setRowMsg(null);
    const { error: err } = await setUserDisabled(u.id, !u.disabled);
    setBusyId(null);
    if (err) setRowError(err);
  }

  async function handleResetPassword(u) {
    if (!window.confirm(`Send a password-reset email to ${u.email}?`)) return;
    setBusyId(u.id); setRowError(null); setRowMsg(null);
    const { error: err } = await resetPassword(u.email);
    setBusyId(null);
    if (err) setRowError(err);
    else setRowMsg(`Password-reset email sent to ${u.email}.`);
  }

  const colSpan = isSuperAdmin ? 5 : 4;

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Users &amp; roles</h2>
          <p className="text-sm text-gray-500">
            Accounts are identified by their <strong>position</strong> and email. Prefer a
            functional mailbox (e.g. <code>datapilot-admin@bank.tn</code>) for admin posts so
            access survives staff changes.
          </p>
        </div>
        <button
          onClick={listUsers}
          className="text-xs font-medium text-gray-600 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Invite a new user by email + position. */}
      <form onSubmit={handleInvite} className="mb-5 rounded-xl border border-gray-200 bg-white p-4">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Invite a new user
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="datapilot-admin@bank.com.tn"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow"
          />
          <input
            type="text"
            value={inviteTitle}
            onChange={e => setInviteTitle(e.target.value)}
            placeholder="Position / title (optional)"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow"
          />
          <button
            type="submit"
            disabled={inviting || !EMAIL_RE.test(inviteEmail.trim())}
            className="bg-ey-yellow text-ey-charcoal font-semibold rounded-lg px-4 py-2 text-sm hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {inviting ? 'Sending…' : 'Send invite'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          They'll get an email to set their password and join as an <strong>analyst</strong>.
          Promote them below if needed.
        </p>
        {inviteMsg && (
          <p className={`text-sm mt-2 rounded-lg px-3 py-2 border ${
            inviteMsg.ok
              ? 'text-green-700 bg-green-50 border-green-200'
              : 'text-red-600 bg-red-50 border-red-200'
          }`}>
            {inviteMsg.text}
            {!inviteMsg.ok && inviteMsg.text.includes('not configured') && (
              <span className="block mt-1 text-xs text-gray-500">
                Fallback: Supabase dashboard → Authentication → Users → Invite user.
              </span>
            )}
          </p>
        )}
      </form>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}
      {rowError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
          {rowError}
        </p>
      )}
      {rowMsg && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
          {rowMsg}
        </p>
      )}

      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left font-semibold px-4 py-2.5">Position &amp; account</th>
              <th className="text-left font-semibold px-4 py-2.5">Joined</th>
              <th className="text-left font-semibold px-4 py-2.5">Role</th>
              <th className="text-left font-semibold px-4 py-2.5">Status</th>
              {isSuperAdmin && <th className="text-right font-semibold px-4 py-2.5">Off-boarding</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td colSpan={colSpan} className="px-4 py-6 text-center text-gray-400">Loading…</td></tr>
            )}
            {!loading && users.length === 0 && (
              <tr><td colSpan={colSpan} className="px-4 py-6 text-center text-gray-400">No users yet.</td></tr>
            )}
            {users.map(u => {
              const isSelf = u.id === currentUserId;
              const lockedSuperadmin = u.role === 'superadmin' && !isSuperAdmin;
              // A regular admin can't edit/off-board a super-admin's account.
              const canManage = !lockedSuperadmin;
              return (
                <tr key={u.id} className={`hover:bg-gray-50 ${u.disabled ? 'opacity-60' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800 flex items-center gap-1.5">
                      {u.title || <span className="text-gray-400 italic font-normal">No position set</span>}
                      {canManage && (
                        <button
                          onClick={() => handleEditTitle(u)}
                          disabled={busyId === u.id}
                          title="Edit position / title"
                          className="text-gray-300 hover:text-gray-600 text-xs disabled:opacity-40"
                        >
                          ✎
                        </button>
                      )}
                      {isSelf && (
                        <span className="ml-1 text-[10px] text-gray-400 uppercase tracking-wide">you</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">{u.email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      // Nobody can change their own role; a regular admin can't
                      // touch a super-admin's row.
                      const locked = isSelf || lockedSuperadmin;
                      const options = assignableRoles.includes(u.role)
                        ? assignableRoles
                        : [u.role, ...assignableRoles];
                      const title = isSelf
                        ? "You can't change your own role"
                        : lockedSuperadmin
                          ? 'Only a super-admin can change a super-admin'
                          : '';
                      return (
                        <select
                          value={u.role}
                          disabled={busyId === u.id || locked}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          title={title}
                          className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ey-yellow disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {options.map(r => (
                            <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
                          ))}
                        </select>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    {u.disabled ? (
                      <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-600 text-[10px] font-semibold uppercase tracking-wide">
                        Disabled
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-semibold uppercase tracking-wide">
                        Active
                      </span>
                    )}
                  </td>
                  {isSuperAdmin && (
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {canManage ? (
                        <div className="inline-flex items-center gap-3">
                          <button
                            onClick={() => handleResetPassword(u)}
                            disabled={busyId === u.id}
                            title="Send a password-reset email (e.g. to hand over a functional mailbox)"
                            className="text-xs text-gray-600 hover:text-gray-900 disabled:opacity-40"
                          >
                            Reset password
                          </button>
                          {!isSelf && (
                            <button
                              onClick={() => handleToggleDisabled(u)}
                              disabled={busyId === u.id}
                              className={`text-xs disabled:opacity-40 ${
                                u.disabled ? 'text-green-600 hover:text-green-800' : 'text-red-500 hover:text-red-700'
                              }`}
                            >
                              {u.disabled ? 'Re-enable' : 'Disable'}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
