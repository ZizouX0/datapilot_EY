import { useEffect, useState } from 'react';
import useUsersStore from '../../store/useUsersStore';
import useAuthStore from '../../store/useAuthStore';

const ROLES = ['analyst', 'admin'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminUsers() {
  const { users, loading, error, listUsers, setUserRole, inviteUser } = useUsersStore();
  const currentUserId = useAuthStore(s => s.user?.id);
  const [busyId, setBusyId] = useState(null);
  const [rowError, setRowError] = useState(null);

  const [inviteEmail, setInviteEmail] = useState('');
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
    const { error: err } = await inviteUser(inviteEmail);
    setInviting(false);
    if (err) {
      setInviteMsg({ ok: false, text: err });
    } else {
      setInviteMsg({ ok: true, text: `Invitation sent to ${inviteEmail.trim()}.` });
      setInviteEmail('');
    }
  }

  async function handleRoleChange(id, role) {
    setBusyId(id);
    setRowError(null);
    const { error: err } = await setUserRole(id, role);
    setBusyId(null);
    if (err) setRowError(`${id}: ${err}`);
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Users &amp; roles</h2>
          <p className="text-sm text-gray-500">
            Everyone who has signed in appears here. Change a role to grant or remove
            admin access.
          </p>
        </div>
        <button
          onClick={listUsers}
          className="text-xs font-medium text-gray-600 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Invite a new user by email. */}
      <form onSubmit={handleInvite} className="mb-5 rounded-xl border border-gray-200 bg-white p-4">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Invite a new user
        </label>
        <div className="flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="name@bank.com.tn"
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

      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left font-semibold px-4 py-2.5">User</th>
              <th className="text-left font-semibold px-4 py-2.5">Joined</th>
              <th className="text-left font-semibold px-4 py-2.5">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400">Loading…</td></tr>
            )}
            {!loading && users.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400">No users yet.</td></tr>
            )}
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">
                    {u.full_name || u.email}
                    {u.id === currentUserId && (
                      <span className="ml-2 text-[10px] text-gray-400 uppercase tracking-wide">you</span>
                    )}
                  </div>
                  {u.full_name && <div className="text-xs text-gray-400">{u.email}</div>}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB') : '—'}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    disabled={busyId === u.id || u.id === currentUserId}
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                    title={u.id === currentUserId ? "You can't change your own role" : ''}
                    className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ey-yellow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
