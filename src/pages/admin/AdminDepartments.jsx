import { useEffect, useMemo, useState } from 'react';
import useDepartmentsStore from '../../store/useDepartmentsStore';
import useUsersStore from '../../store/useUsersStore';
import useAuthStore from '../../store/useAuthStore';
import { TUNISIA_DEPARTMENT_NAMES } from '../../data/tunisiaDefaults';

// Coordinator screen for the bank's department structure (Model B):
//   • create / rename / delete departments — pick from the Tunisian-bank catalog
//     or type a custom name (saved to the bank);
//   • one-click seed of the standard Tunisian departments;
//   • assign each analyst to a department (the people who actually fill).
// Department writes go straight through the browser (RLS scopes them to the
// bank); assigning a user goes through /api/set-department (super-admin only).
export default function AdminDepartments() {
  const { departments, loading, error, list, create, rename, remove, seedTunisiaDefaults } = useDepartmentsStore();
  const { users, listUsers, setUserDepartment } = useUsersStore();
  const bankName = useAuthStore(s => s.bankName);
  const isOwner = useAuthStore(s => s.role === 'owner');

  const [newDept, setNewDept] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);     // { ok, text }
  const [rowBusy, setRowBusy] = useState(null);

  useEffect(() => { list(); listUsers(); }, [list, listUsers]);

  // Analysts in this bank are the people who fill, so they're the ones we assign.
  const analysts = useMemo(
    () => users.filter(u => u.role === 'analyst' && (isOwner || u.bank_name === bankName)),
    [users, isOwner, bankName],
  );

  // How many people sit in each department (for the count badge).
  const counts = useMemo(() => {
    const m = {};
    users.forEach(u => { if (u.department_id) m[u.department_id] = (m[u.department_id] || 0) + 1; });
    return m;
  }, [users]);

  function flash(ok, text) { setMsg({ ok, text }); }

  async function handleAdd(e) {
    e.preventDefault();
    const name = newDept.trim();
    if (!name) return;
    setBusy(true); setMsg(null);
    const { error: err } = await create(name);
    setBusy(false);
    if (err) flash(false, err);
    else { setNewDept(''); flash(true, `Added “${name}”.`); }
  }

  async function handleSeed() {
    setBusy(true); setMsg(null);
    const { error: err, added } = await seedTunisiaDefaults();
    setBusy(false);
    if (err) flash(false, err);
    else flash(true, added ? `Added ${added} standard department${added > 1 ? 's' : ''}.` : 'All standard departments already exist.');
  }

  async function handleRename(d) {
    const next = window.prompt('Department name:', d.name);
    if (next === null || next.trim() === d.name) return;
    setRowBusy(d.id); setMsg(null);
    const { error: err } = await rename(d.id, next);
    setRowBusy(null);
    if (err) flash(false, err);
  }

  async function handleDelete(d) {
    const n = counts[d.id] || 0;
    const warn = n > 0 ? `\n\n${n} member${n > 1 ? 's' : ''} will become unassigned.` : '';
    if (!window.confirm(`Delete “${d.name}”?${warn}`)) return;
    setRowBusy(d.id); setMsg(null);
    const { error: err } = await remove(d.id);
    setRowBusy(null);
    if (err) flash(false, err);
  }

  async function handleAssign(userId, departmentId) {
    setRowBusy(userId); setMsg(null);
    const { error: err } = await setUserDepartment(userId, departmentId || null);
    setRowBusy(null);
    if (err) flash(false, err);
  }

  if (isOwner) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-600">
        Departments are managed per bank by each bank’s Super Admin. As EY, you oversee
        every bank but don’t set up their internal departments.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Departments</h2>
        <p className="text-sm text-gray-500">
          Set up the departments that contribute to a group assessment, then assign your analysts to them.
        </p>
      </div>

      {msg && (
        <p className={`text-sm rounded-lg px-3 py-2 border ${
          msg.ok ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'
        }`}>{msg.text}</p>
      )}
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

      {/* ── Manage departments ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Your departments</h3>
          {departments.length === 0 && (
            <button
              onClick={handleSeed}
              disabled={busy}
              className="text-xs font-semibold bg-ey-charcoal text-ey-yellow rounded-lg px-3 py-1.5 hover:bg-gray-800 disabled:opacity-40"
            >
              ⚡ Use standard Tunisian departments
            </button>
          )}
        </div>

        {/* Add: pick from the Tunisian catalog or type a custom name. */}
        <form onSubmit={handleAdd} className="flex gap-2 mb-3">
          <input
            list="dept-catalog"
            value={newDept}
            onChange={e => setNewDept(e.target.value)}
            placeholder="Pick a standard department or type your own…"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow"
          />
          <datalist id="dept-catalog">
            {TUNISIA_DEPARTMENT_NAMES.map(n => <option key={n} value={n} />)}
          </datalist>
          <button
            type="submit"
            disabled={busy || !newDept.trim()}
            className="bg-ey-yellow text-ey-charcoal font-semibold rounded-lg px-4 py-2 text-sm hover:bg-yellow-400 disabled:opacity-40"
          >Add</button>
        </form>

        {loading && <p className="text-sm text-gray-400 py-3 text-center">Loading…</p>}
        {!loading && departments.length === 0 && (
          <p className="text-sm text-gray-400 py-3 text-center">No departments yet. Add one above, or use the standard set.</p>
        )}
        {departments.map(d => (
          <div key={d.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-b-0">
            <span className="flex-1 text-sm text-gray-800">{d.name}</span>
            <span className="text-[11px] text-gray-400">{counts[d.id] || 0} member{(counts[d.id] || 0) === 1 ? '' : 's'}</span>
            <button onClick={() => handleRename(d)} disabled={rowBusy === d.id} className="text-xs text-gray-500 hover:text-gray-900 disabled:opacity-40">Rename</button>
            <button onClick={() => handleDelete(d)} disabled={rowBusy === d.id} className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40">Delete</button>
          </div>
        ))}
      </div>

      {/* ── Assign analysts ────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Assign analysts to departments</h3>
        <p className="text-xs text-gray-500 mb-3">
          Only analysts fill assessments. Put each analyst in the department that owns the dimensions they’ll answer.
        </p>
        {analysts.length === 0 && (
          <p className="text-sm text-gray-400 py-3 text-center">No analysts in your bank yet — invite them under “Users &amp; roles”.</p>
        )}
        {analysts.map(u => (
          <div key={u.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-b-0">
            <div className="min-w-0 flex-1">
              <div className="text-sm text-gray-800 truncate">{u.full_name || u.title || u.email}</div>
              <div className="text-xs text-gray-400 truncate">{u.email}</div>
            </div>
            <select
              value={u.department_id || ''}
              disabled={rowBusy === u.id || departments.length === 0}
              onChange={e => handleAssign(u.id, e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-ey-yellow disabled:opacity-60"
            >
              <option value="">— No department —</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
