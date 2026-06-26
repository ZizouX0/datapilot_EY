import { useEffect, useMemo, useState } from 'react';
import useDepartmentsStore from '../../store/useDepartmentsStore';
import useUsersStore from '../../store/useUsersStore';
import useAuthStore from '../../store/useAuthStore';
import useSettingsStore from '../../store/useSettingsStore';
import { TUNISIA_DEPARTMENT_NAMES } from '../../data/tunisiaDefaults';

// Co-located EN/FR copy for this screen (the global i18n covers the shell; long
// page copy lives with the page so both languages stay reviewable together).
const COPY = {
  en: {
    title: 'Departments',
    subtitle: 'Set up the departments that contribute to a group assessment, then assign your analysts to them.',
    your: 'Your departments',
    useStandard: '⚡ Use standard Tunisian departments',
    addPlaceholder: 'Pick a standard department or type your own…',
    add: 'Add',
    loading: 'Loading…',
    emptyDepts: 'No departments yet. Add one above, or use the standard set.',
    rename: 'Rename',
    del: 'Delete',
    assignTitle: 'Assign analysts to departments',
    assignSub: 'Only analysts fill assessments. Put each analyst in the department that owns the dimensions they’ll answer.',
    noAnalysts: 'No analysts in your bank yet — invite them under “Users & roles”.',
    none: '— No department —',
    ownerNote: 'Departments are managed per bank by each bank’s Super Admin. As EY, you oversee every bank but don’t set up their internal departments.',
    renamePrompt: 'Department name:',
    allExist: 'All standard departments already exist.',
    added: (name) => `Added “${name}”.`,
    seeded: (n) => `Added ${n} standard department${n > 1 ? 's' : ''}.`,
    deletePrompt: (name, n) => `Delete “${name}”?${n > 0 ? `\n\n${n} member${n > 1 ? 's' : ''} will become unassigned.` : ''}`,
    members: (n) => `${n} member${n === 1 ? '' : 's'}`,
  },
  fr: {
    title: 'Départements',
    subtitle: 'Configurez les départements qui contribuent à une évaluation groupée, puis affectez-y vos analystes.',
    your: 'Vos départements',
    useStandard: '⚡ Utiliser les départements tunisiens standard',
    addPlaceholder: 'Choisissez un département standard ou saisissez le vôtre…',
    add: 'Ajouter',
    loading: 'Chargement…',
    emptyDepts: 'Aucun département pour l’instant. Ajoutez-en un ci-dessus ou utilisez l’ensemble standard.',
    rename: 'Renommer',
    del: 'Supprimer',
    assignTitle: 'Affecter les analystes aux départements',
    assignSub: 'Seuls les analystes remplissent les évaluations. Placez chaque analyste dans le département qui possède les dimensions qu’il traitera.',
    noAnalysts: 'Aucun analyste dans votre banque pour l’instant — invitez-les via « Utilisateurs et rôles ».',
    none: '— Aucun département —',
    ownerNote: 'Les départements sont gérés banque par banque par le Super Admin de chaque banque. En tant qu’EY, vous supervisez chaque banque mais ne configurez pas leurs départements internes.',
    renamePrompt: 'Nom du département :',
    allExist: 'Tous les départements standard existent déjà.',
    added: (name) => `« ${name} » ajouté.`,
    seeded: (n) => `${n} département${n > 1 ? 's' : ''} standard ajouté${n > 1 ? 's' : ''}.`,
    deletePrompt: (name, n) => `Supprimer « ${name} » ?${n > 0 ? `\n\n${n} membre${n > 1 ? 's' : ''} ne ${n > 1 ? 'seront' : 'sera'} plus affecté${n > 1 ? 's' : ''}.` : ''}`,
    members: (n) => `${n} membre${n > 1 ? 's' : ''}`,
  },
};

// Coordinator screen for the bank's department structure (Model B):
//   • create / rename / delete departments — pick from the Tunisian-bank catalog
//     or type a custom name (saved to the bank);
//   • one-click seed of the standard Tunisian departments;
//   • assign each analyst to a department (the people who actually fill).
export default function AdminDepartments() {
  const { departments, loading, error, list, create, rename, remove, seedTunisiaDefaults } = useDepartmentsStore();
  const { users, listUsers, setUserDepartment } = useUsersStore();
  const bankName = useAuthStore(s => s.bankName);
  const isOwner = useAuthStore(s => s.role === 'owner');
  const lang = useSettingsStore(s => s.language);
  const c = COPY[lang] || COPY.en;

  const [newDept, setNewDept] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);     // { ok, text }
  const [rowBusy, setRowBusy] = useState(null);

  useEffect(() => { list(); listUsers(); }, [list, listUsers]);

  const analysts = useMemo(
    () => users.filter(u => u.role === 'analyst' && (isOwner || u.bank_name === bankName)),
    [users, isOwner, bankName],
  );

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
    else { setNewDept(''); flash(true, c.added(name)); }
  }

  async function handleSeed() {
    setBusy(true); setMsg(null);
    const { error: err, added } = await seedTunisiaDefaults();
    setBusy(false);
    if (err) flash(false, err);
    else flash(true, added ? c.seeded(added) : c.allExist);
  }

  async function handleRename(d) {
    const next = window.prompt(c.renamePrompt, d.name);
    if (next === null || next.trim() === d.name) return;
    setRowBusy(d.id); setMsg(null);
    const { error: err } = await rename(d.id, next);
    setRowBusy(null);
    if (err) flash(false, err);
  }

  async function handleDelete(d) {
    if (!window.confirm(c.deletePrompt(d.name, counts[d.id] || 0))) return;
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
        {c.ownerNote}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">{c.title}</h2>
        <p className="text-sm text-gray-500">{c.subtitle}</p>
      </div>

      {msg && (
        <p className={`text-sm rounded-lg px-3 py-2 border whitespace-pre-line ${
          msg.ok ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'
        }`}>{msg.text}</p>
      )}
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

      {/* ── Manage departments ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">{c.your}</h3>
          {departments.length === 0 && (
            <button
              onClick={handleSeed}
              disabled={busy}
              className="text-xs font-semibold bg-ey-charcoal text-ey-yellow rounded-lg px-3 py-1.5 hover:bg-gray-800 disabled:opacity-40"
            >
              {c.useStandard}
            </button>
          )}
        </div>

        <form onSubmit={handleAdd} className="flex gap-2 mb-3">
          <input
            list="dept-catalog"
            value={newDept}
            onChange={e => setNewDept(e.target.value)}
            placeholder={c.addPlaceholder}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow"
          />
          <datalist id="dept-catalog">
            {TUNISIA_DEPARTMENT_NAMES.map(n => <option key={n} value={n} />)}
          </datalist>
          <button
            type="submit"
            disabled={busy || !newDept.trim()}
            className="bg-ey-yellow text-ey-charcoal font-semibold rounded-lg px-4 py-2 text-sm hover:bg-yellow-400 disabled:opacity-40"
          >{c.add}</button>
        </form>

        {loading && <p className="text-sm text-gray-400 py-3 text-center">{c.loading}</p>}
        {!loading && departments.length === 0 && (
          <p className="text-sm text-gray-400 py-3 text-center">{c.emptyDepts}</p>
        )}
        {departments.map(d => (
          <div key={d.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-b-0">
            <span className="flex-1 text-sm text-gray-800">{d.name}</span>
            <span className="text-[11px] text-gray-400">{c.members(counts[d.id] || 0)}</span>
            <button onClick={() => handleRename(d)} disabled={rowBusy === d.id} className="text-xs text-gray-500 hover:text-gray-900 disabled:opacity-40">{c.rename}</button>
            <button onClick={() => handleDelete(d)} disabled={rowBusy === d.id} className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40">{c.del}</button>
          </div>
        ))}
      </div>

      {/* ── Assign analysts ────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">{c.assignTitle}</h3>
        <p className="text-xs text-gray-500 mb-3">{c.assignSub}</p>
        {analysts.length === 0 && (
          <p className="text-sm text-gray-400 py-3 text-center">{c.noAnalysts}</p>
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
              <option value="">{c.none}</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
