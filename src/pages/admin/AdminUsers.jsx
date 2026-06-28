import { useEffect, useMemo, useState } from 'react';
import useUsersStore from '../../store/useUsersStore';
import useAuthStore from '../../store/useAuthStore';
import useDepartmentsStore from '../../store/useDepartmentsStore';
import { roleLabel, manageableRoles, invitableRole, rank, ROLE_RANK } from '../../lib/roles';
import { POSITIONS, POSITION_OTHER } from '../../data/positions';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Build a parent→child forest from invited_by lineage within one bank.
function buildForest(list) {
  const byId = new Map(list.map(u => [u.id, { ...u, children: [] }]));
  const roots = [];
  byId.forEach(node => {
    const parent = node.invited_by ? byId.get(node.invited_by) : null;
    if (parent) parent.children.push(node);
    else roots.push(node); // first user of the bank, or pre-lineage accounts
  });
  const sort = arr => {
    arr.sort((a, b) => rank(b.role) - rank(a.role) || (a.email || '').localeCompare(b.email || ''));
    arr.forEach(n => sort(n.children));
  };
  sort(roots);
  return roots;
}

export default function AdminUsers() {
  const {
    users, loading, error, listUsers, setUserRole, inviteUser,
    setUserTitle, setUserDisabled, resetPassword,
  } = useUsersStore();
  const currentUserId = useAuthStore(s => s.user?.id);
  const myRole = useAuthStore(s => s.role);
  const myDeptId = useAuthStore(s => s.departmentId);
  const isOwner = myRole === 'owner';

  // Departments power the invite flow (Model B): a Super Admin picks the
  // department of the Admin they invite; an Admin's analysts inherit the Admin's
  // own department automatically (handled server-side).
  const { departments, list: listDepartments } = useDepartmentsStore();
  const canOffboard = rank(myRole) >= ROLE_RANK.superadmin;
  const inviteRole = invitableRole(myRole); // the single tier I may create
  const manageRoles = manageableRoles(myRole);

  const [busyId, setBusyId] = useState(null);
  const [rowError, setRowError] = useState(null);
  const [rowMsg, setRowMsg] = useState(null);

  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePosition, setInvitePosition] = useState('');
  const [inviteOther, setInviteOther] = useState('');
  const [inviteBank, setInviteBank] = useState('');
  const [inviteDept, setInviteDept] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState(null);

  useEffect(() => { listUsers(); }, [listUsers]);
  // Load departments for the invite controls (Super Admin dropdown / Admin note).
  useEffect(() => { if (rank(myRole) >= ROLE_RANK.admin && !isOwner) listDepartments(); }, [myRole, isOwner, listDepartments]);

  const myDeptName = departments.find(d => d.id === myDeptId)?.name || null;

  const inviteTitle = invitePosition === POSITION_OTHER ? inviteOther : invitePosition;
  const canSubmitInvite =
    !inviting && !!inviteRole &&
    EMAIL_RE.test(inviteEmail.trim()) &&
    (!isOwner || inviteBank.trim().length > 0);

  // Group users by bank for the tree; EY owners sit in their own platform group.
  const groups = useMemo(() => {
    const eyUsers = [];
    const banks = new Map();
    users.forEach(u => {
      if (u.role === 'owner') { eyUsers.push(u); return; }
      const key = u.bank_name || '— No bank —';
      if (!banks.has(key)) banks.set(key, []);
      banks.get(key).push(u);
    });
    return {
      eyUsers,
      banks: [...banks.entries()].sort((a, b) => a[0].localeCompare(b[0])),
    };
  }, [users]);

  async function handleInvite(e) {
    e.preventDefault();
    if (!canSubmitInvite) return;
    setInviting(true); setInviteMsg(null);
    const { error: err } = await inviteUser(inviteEmail, {
      title: inviteTitle,
      role: inviteRole,
      bank: isOwner ? inviteBank : undefined,
      // Super Admin chooses the Admin's department; an Admin's analysts inherit
      // the Admin's own department server-side (no field needed here).
      department: myRole === 'superadmin' ? inviteDept : undefined,
    });
    setInviting(false);
    if (err) {
      setInviteMsg({ ok: false, text: err });
    } else {
      setInviteMsg({ ok: true, text: `Invitation sent to ${inviteEmail.trim()} as ${roleLabel(inviteRole)}.` });
      setInviteEmail(''); setInvitePosition(''); setInviteOther(''); setInviteBank(''); setInviteDept('');
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
    if (next === null) return;
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

  // One person in the tree, indented by depth, with the controls they're allowed.
  function renderNode(node, depth) {
    const isSelf = node.id === currentUserId;
    const canManageRole = !isSelf && rank(node.role) < rank(myRole);
    const roleOptions = manageRoles.includes(node.role) ? manageRoles : [node.role, ...manageRoles];
    const showReset = canOffboard && (isSelf || rank(node.role) < rank(myRole));
    const showDisable = canOffboard && !isSelf && rank(node.role) < rank(myRole);
    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-3 py-2.5 pr-3 border-b border-gray-100 hover:bg-gray-50 ${node.disabled ? 'opacity-60' : ''}`}
          style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
        >
          {depth > 0 && <span className="text-gray-300 -ml-3">└</span>}
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-800 flex items-center gap-1.5 truncate">
              {node.title || <span className="text-gray-400 italic font-normal">No position set</span>}
              {canManageRole && (
                <button
                  onClick={() => handleEditTitle(node)}
                  disabled={busyId === node.id}
                  title="Edit position / title"
                  className="text-gray-300 hover:text-gray-600 text-xs disabled:opacity-40"
                >✎</button>
              )}
              {isSelf && <span className="text-[10px] text-gray-400 uppercase tracking-wide">you</span>}
            </div>
            <div className="text-xs text-gray-400 truncate">{node.email}</div>
          </div>

          {/* Role */}
          <select
            value={node.role}
            disabled={busyId === node.id || !canManageRole}
            onChange={e => handleRoleChange(node.id, e.target.value)}
            title={canManageRole ? '' : "You can't change this account's role"}
            className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-ey-yellow disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {roleOptions.map(r => <option key={r} value={r}>{roleLabel(r)}</option>)}
          </select>

          {/* Status */}
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${
            node.disabled ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'
          }`}>
            {node.disabled ? 'Disabled' : 'Active'}
          </span>

          {/* Off-boarding */}
          {canOffboard && (
            <div className="flex items-center gap-2 w-[150px] justify-end">
              {showReset && (
                <button
                  onClick={() => handleResetPassword(node)}
                  disabled={busyId === node.id}
                  className="text-xs text-gray-500 hover:text-gray-900 disabled:opacity-40"
                >Reset</button>
              )}
              {showDisable && (
                <button
                  onClick={() => handleToggleDisabled(node)}
                  disabled={busyId === node.id}
                  className={`text-xs disabled:opacity-40 ${node.disabled ? 'text-green-600 hover:text-green-800' : 'text-red-500 hover:text-red-700'}`}
                >{node.disabled ? 'Enable' : 'Disable'}</button>
              )}
            </div>
          )}
        </div>
        {node.children.map(c => renderNode(c, depth + 1))}
      </div>
    );
  }

  function renderTree(list) {
    return buildForest(list).map(n => renderNode(n, 0));
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Users &amp; roles</h2>
          <p className="text-sm text-gray-500">
            {isOwner
              ? 'Every bank’s org tree. You invite each bank’s Super Admin; they build their own team.'
              : 'Your bank’s org tree. Invite the tier directly below you; everyone here belongs to your bank.'}
          </p>
        </div>
        <button
          onClick={listUsers}
          className="text-xs font-medium text-gray-600 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50"
        >↻ Refresh</button>
      </div>

      {/* Invite — role is fixed to the tier one step below the inviter. */}
      {inviteRole && (
        <form onSubmit={handleInvite} className="mb-5 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Invite a {roleLabel(inviteRole)}
            </label>
            <span className="text-[11px] text-gray-400">Joins as <strong>{roleLabel(inviteRole)}</strong></span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="name@bank.com.tn"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow"
            />
            <select
              value={invitePosition}
              onChange={e => setInvitePosition(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ey-yellow"
            >
              <option value="">Position (optional)</option>
              {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              <option value={POSITION_OTHER}>{POSITION_OTHER}…</option>
            </select>
            {invitePosition === POSITION_OTHER && (
              <input
                type="text"
                value={inviteOther}
                onChange={e => setInviteOther(e.target.value)}
                placeholder="Type the position"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow"
              />
            )}
            {isOwner && (
              <input
                type="text"
                value={inviteBank}
                onChange={e => setInviteBank(e.target.value)}
                placeholder="Bank name (required)"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow"
              />
            )}
            {/* Super Admin: choose the department this Admin will lead. */}
            {myRole === 'superadmin' && (
              <select
                value={inviteDept}
                onChange={e => setInviteDept(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ey-yellow"
              >
                <option value="">Department (optional — assign later)</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            )}
          </div>

          {/* Admin: analysts inherit the Admin's own department automatically. */}
          {myRole === 'admin' && (
            <p className="text-[11px] text-gray-500 mt-2">
              {myDeptName
                ? <>This {roleLabel(inviteRole)} will be added to your department: <strong>{myDeptName}</strong>.</>
                : <>You have no department set — ask your Super Admin to assign you one, otherwise the {roleLabel(inviteRole)}s you invite won’t be placed in a department.</>}
            </p>
          )}
          <div className="mt-2">
            <button
              type="submit"
              disabled={!canSubmitInvite}
              className="bg-ey-yellow text-ey-charcoal font-semibold rounded-lg px-4 py-2 text-sm hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {inviting ? 'Sending…' : 'Send invite'}
            </button>
          </div>
          {inviteMsg && (
            <p className={`text-sm mt-2 rounded-lg px-3 py-2 border ${
              inviteMsg.ok ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'
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
      )}

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{error}</p>}
      {rowError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{rowError}</p>}
      {rowMsg && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">{rowMsg}</p>}

      {loading && <p className="text-sm text-gray-400 py-6 text-center">Loading…</p>}
      {!loading && users.length === 0 && <p className="text-sm text-gray-400 py-6 text-center">No users yet.</p>}

      {/* EY platform group (owners) — only EY sees this. */}
      {!loading && groups.eyUsers.length > 0 && (
        <div className="rounded-xl border border-gray-200 overflow-hidden mb-4">
          <div className="bg-ey-charcoal text-white px-4 py-2 text-xs font-semibold uppercase tracking-wide">
            EY platform
          </div>
          {renderTree(groups.eyUsers)}
        </div>
      )}

      {/* One card per bank. */}
      {!loading && groups.banks.map(([bankName, list]) => (
        <div key={bankName} className="rounded-xl border border-gray-200 overflow-hidden mb-4">
          <div className="bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600 flex justify-between">
            <span>{bankName}</span>
            <span className="text-gray-400 normal-case">{list.length} {list.length === 1 ? 'member' : 'members'}</span>
          </div>
          {renderTree(list)}
        </div>
      ))}
    </div>
  );
}
