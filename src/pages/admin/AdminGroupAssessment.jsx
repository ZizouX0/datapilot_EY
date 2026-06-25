import { useEffect, useMemo, useState } from 'react';
import useAssessmentStore from '../../store/useAssessmentStore';
import useDepartmentsStore from '../../store/useDepartmentsStore';
import { DIMENSIONS, INDICATORS } from '../../data/indicators';
import { TUNISIA_SUGGESTED_MAPPING } from '../../data/tunisiaDefaults';

// Coordinator screen for a group (Model B) assessment:
//   • create the shared draft for the bank;
//   • map each dimension to the department that owns it (or apply the suggested
//     Tunisian mapping in one click);
//   • watch live per-dimension progress and scores as analysts fill;
//   • finalize into a submissions row (feeds the existing review/export).
export default function AdminGroupAssessment() {
  const {
    assessment, assignments, answers, loading, saving, error,
    loadActive, createAssessment, setAssignment, applySuggestedMapping, scores, finalize,
  } = useAssessmentStore();
  const { departments, list: listDepartments } = useDepartmentsStore();

  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => { loadActive(); listDepartments(); }, [loadActive, listDepartments]);

  const dims = Object.keys(DIMENSIONS);
  const assignedDept = useMemo(() => {
    const m = {};
    assignments.forEach(a => { m[a.dim_code] = a.department_id || ''; });
    return m;
  }, [assignments]);

  // Per-dimension answered/total from the shared answers + content.
  const progress = useMemo(() => {
    const p = {};
    dims.forEach(d => {
      const inds = INDICATORS.filter(i => i.dim === d);
      const done = inds.filter(i => {
        const a = answers[i.id];
        return a && (a.skipped || (a.score !== null && a.score !== undefined));
      }).length;
      p[d] = { done, total: inds.length };
    });
    return p;
  }, [answers, dims]);

  const s = scores();

  function flash(ok, text) { setMsg({ ok, text }); }

  async function handleCreate() {
    setBusy(true); setMsg(null);
    const { error: err } = await createAssessment({ title });
    setBusy(false);
    if (err) flash(false, err);
    else { setTitle(''); flash(true, 'Draft assessment created. Now assign each dimension to a department.'); }
  }

  async function handleAssign(dimCode, departmentId) {
    setBusy(true); setMsg(null);
    const { error: err } = await setAssignment(dimCode, departmentId);
    setBusy(false);
    if (err) flash(false, err);
  }

  async function handleSuggested() {
    if (!departments.length) { flash(false, 'Create your departments first (Departments tab).'); return; }
    setBusy(true); setMsg(null);
    const { error: err } = await applySuggestedMapping(departments);
    setBusy(false);
    if (err) flash(false, err);
    else flash(true, 'Applied the suggested Tunisian mapping. Adjust any dimension as needed.');
  }

  async function handleFinalize() {
    if (!window.confirm('Finalize this assessment? It will be locked and added to Submissions.')) return;
    setBusy(true); setMsg(null);
    const { error: err } = await finalize();
    setBusy(false);
    if (err) flash(false, err);
    else flash(true, `Assessment finalized and submitted (global score ${s.globalScore ?? '—'}/5). See the Submissions tab.`);
  }

  if (loading) return <p className="text-sm text-gray-400 py-6 text-center">Loading…</p>;

  // ── No assessment yet → create one ────────────────────────────────────
  if (!assessment) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Group assessment</h2>
          <p className="text-sm text-gray-500">
            One shared assessment your departments fill together. Create the draft, assign each
            dimension to a department, then finalize when everyone’s done.
          </p>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        {msg && <p className={`text-sm rounded-lg px-3 py-2 border ${msg.ok ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'}`}>{msg.text}</p>}
        <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col gap-3 max-w-lg">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Assessment name (optional)</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. 2026 Data Maturity Assessment"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow"
          />
          <button
            onClick={handleCreate}
            disabled={busy}
            className="self-start bg-ey-yellow text-ey-charcoal font-semibold rounded-lg px-4 py-2 text-sm hover:bg-yellow-400 disabled:opacity-40"
          >Create group assessment</button>
        </div>
      </div>
    );
  }

  const finalized = assessment.status === 'finalized';

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {assessment.title || 'Group assessment'}
            <span className={`ml-2 text-[11px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide ${
              finalized ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'
            }`}>{finalized ? 'Finalized' : 'Draft'}</span>
          </h2>
          <p className="text-sm text-gray-500">
            {finalized
              ? 'This assessment is locked and has been added to Submissions.'
              : 'Assign each dimension to the department that owns it. Analysts then fill only their dimensions.'}
          </p>
        </div>
        {!finalized && (
          <button
            onClick={handleSuggested}
            disabled={busy}
            className="text-xs font-semibold bg-ey-charcoal text-ey-yellow rounded-lg px-3 py-1.5 hover:bg-gray-800 disabled:opacity-40 flex-shrink-0"
          >⚡ Suggested Tunisian mapping</button>
        )}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
      {msg && <p className={`text-sm rounded-lg px-3 py-2 border ${msg.ok ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'}`}>{msg.text}</p>}

      {/* Dimension → department mapping + progress */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 bg-gray-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          <span>Dimension</span><span className="w-56">Owning department</span><span className="w-24 text-right">Progress</span>
        </div>
        {dims.map(d => {
          const dim = DIMENSIONS[d];
          const pr = progress[d];
          const pct = pr.total ? Math.round((pr.done / pr.total) * 100) : 0;
          return (
            <div key={d} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center px-4 py-2.5 border-t border-gray-100">
              <div className="min-w-0">
                <span className="text-sm font-medium" style={{ color: dim.color }}>{d}</span>
                <span className="text-sm text-gray-700"> · {dim.name}</span>
                <div className="text-[11px] text-gray-400">Suggested: {TUNISIA_SUGGESTED_MAPPING[d] || '—'}</div>
              </div>
              <select
                value={assignedDept[d] || ''}
                disabled={busy || finalized}
                onChange={e => handleAssign(d, e.target.value)}
                className="w-56 border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-ey-yellow disabled:opacity-60"
              >
                <option value="">— Unassigned —</option>
                {departments.map(dep => <option key={dep.id} value={dep.id}>{dep.name}</option>)}
              </select>
              <div className="w-24 text-right">
                <div className="text-xs text-gray-500">{pr.done}/{pr.total}</div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: dim.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live score + finalize */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Global score</div>
            <div className="text-3xl font-bold font-mono text-ey-charcoal">{s.globalScore ?? '—'}<span className="text-base text-gray-400">/5</span></div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Maturity</div>
            <div className="text-xl font-semibold text-gray-700">{s.maturityLevel ? `Level ${s.maturityLevel}` : '—'}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">BCT rate</div>
            <div className="text-xl font-semibold text-gray-700">{s.bctRate}%</div>
          </div>
        </div>
        {!finalized && (
          <button
            onClick={handleFinalize}
            disabled={busy || saving}
            className="bg-ey-yellow text-ey-charcoal font-semibold rounded-lg px-5 py-2.5 text-sm hover:bg-yellow-400 disabled:opacity-40"
          >{saving ? 'Finalizing…' : 'Finalize & submit'}</button>
        )}
        {finalized && (
          <button
            onClick={handleCreate}
            disabled={busy}
            className="text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 disabled:opacity-40"
          >Start a new assessment</button>
        )}
      </div>
    </div>
  );
}
