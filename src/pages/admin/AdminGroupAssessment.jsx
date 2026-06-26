import { useEffect, useMemo, useState } from 'react';
import useAssessmentStore from '../../store/useAssessmentStore';
import useDepartmentsStore from '../../store/useDepartmentsStore';
import useSettingsStore from '../../store/useSettingsStore';
import { DIMENSIONS, INDICATORS } from '../../data/indicators';
import { TUNISIA_SUGGESTED_MAPPING } from '../../data/tunisiaDefaults';

const COPY = {
  en: {
    title: 'Group assessment',
    introCreate: 'One shared assessment your departments fill together. Create the draft, assign each dimension to a department, then finalize when everyone’s done.',
    nameLabel: 'Assessment name (optional)',
    namePlaceholder: 'e.g. 2026 Data Maturity Assessment',
    create: 'Create group assessment',
    createdMsg: 'Draft assessment created. Now assign each dimension to a department.',
    suggested: '⚡ Suggested Tunisian mapping',
    needDepts: 'Create your departments first (Departments tab).',
    suggestedMsg: 'Applied the suggested Tunisian mapping. Adjust any dimension as needed.',
    draft: 'Draft',
    finalized: 'Finalized',
    introDraft: 'Assign each dimension to the department that owns it. Analysts then fill only their dimensions.',
    introFinal: 'This assessment is locked and has been added to Submissions.',
    colDim: 'Dimension',
    colDept: 'Owning department',
    colProg: 'Progress',
    suggestedFor: 'Suggested',
    unassigned: '— Unassigned —',
    globalScore: 'Global score',
    maturity: 'Maturity',
    level: (n) => `Level ${n}`,
    bct: 'BCT rate',
    finalize: 'Finalize & submit',
    finalizing: 'Finalizing…',
    startNew: 'Start a new assessment',
    confirmFinalize: 'Finalize this assessment? It will be locked and added to Submissions.',
    finalizedMsg: (s) => `Assessment finalized and submitted (global score ${s}/5). See the Submissions tab.`,
    loading: 'Loading…',
  },
  fr: {
    title: 'Évaluation groupée',
    introCreate: 'Une évaluation partagée que vos départements remplissent ensemble. Créez le brouillon, affectez chaque dimension à un département, puis finalisez une fois que tout le monde a terminé.',
    nameLabel: 'Nom de l’évaluation (facultatif)',
    namePlaceholder: 'ex. Évaluation de maturité des données 2026',
    create: 'Créer l’évaluation groupée',
    createdMsg: 'Brouillon créé. Affectez maintenant chaque dimension à un département.',
    suggested: '⚡ Affectation tunisienne suggérée',
    needDepts: 'Créez d’abord vos départements (onglet Départements).',
    suggestedMsg: 'Affectation tunisienne suggérée appliquée. Ajustez chaque dimension si nécessaire.',
    draft: 'Brouillon',
    finalized: 'Finalisée',
    introDraft: 'Affectez chaque dimension au département qui en est responsable. Les analystes ne remplissent alors que leurs dimensions.',
    introFinal: 'Cette évaluation est verrouillée et a été ajoutée aux Évaluations.',
    colDim: 'Dimension',
    colDept: 'Département responsable',
    colProg: 'Avancement',
    suggestedFor: 'Suggéré',
    unassigned: '— Non affecté —',
    globalScore: 'Score global',
    maturity: 'Maturité',
    level: (n) => `Niveau ${n}`,
    bct: 'Taux BCT',
    finalize: 'Finaliser et soumettre',
    finalizing: 'Finalisation…',
    startNew: 'Démarrer une nouvelle évaluation',
    confirmFinalize: 'Finaliser cette évaluation ? Elle sera verrouillée et ajoutée aux Évaluations.',
    finalizedMsg: (s) => `Évaluation finalisée et soumise (score global ${s}/5). Voir l’onglet Évaluations.`,
    loading: 'Chargement…',
  },
};

// Coordinator screen for a group (Model B) assessment: create the shared draft,
// map each dimension to its owning department, watch live progress and scores,
// then finalize into a submissions row (feeds the existing review/export).
export default function AdminGroupAssessment() {
  const {
    assessment, assignments, answers, loading, saving, error,
    loadActive, createAssessment, setAssignment, applySuggestedMapping, scores, finalize,
  } = useAssessmentStore();
  const { departments, list: listDepartments } = useDepartmentsStore();
  const lang = useSettingsStore(s => s.language);
  const c = COPY[lang] || COPY.en;

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
    else { setTitle(''); flash(true, c.createdMsg); }
  }

  async function handleAssign(dimCode, departmentId) {
    setBusy(true); setMsg(null);
    const { error: err } = await setAssignment(dimCode, departmentId);
    setBusy(false);
    if (err) flash(false, err);
  }

  async function handleSuggested() {
    if (!departments.length) { flash(false, c.needDepts); return; }
    setBusy(true); setMsg(null);
    const { error: err } = await applySuggestedMapping(departments);
    setBusy(false);
    if (err) flash(false, err);
    else flash(true, c.suggestedMsg);
  }

  async function handleFinalize() {
    if (!window.confirm(c.confirmFinalize)) return;
    setBusy(true); setMsg(null);
    const { error: err } = await finalize();
    setBusy(false);
    if (err) flash(false, err);
    else flash(true, c.finalizedMsg(s.globalScore ?? '—'));
  }

  if (loading) return <p className="text-sm text-gray-400 py-6 text-center">{c.loading}</p>;

  // ── No assessment yet → create one ────────────────────────────────────
  if (!assessment) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{c.title}</h2>
          <p className="text-sm text-gray-500">{c.introCreate}</p>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        {msg && <p className={`text-sm rounded-lg px-3 py-2 border ${msg.ok ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'}`}>{msg.text}</p>}
        <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col gap-3 max-w-lg">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{c.nameLabel}</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={c.namePlaceholder}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow"
          />
          <button
            onClick={handleCreate}
            disabled={busy}
            className="self-start bg-ey-yellow text-ey-charcoal font-semibold rounded-lg px-4 py-2 text-sm hover:bg-yellow-400 disabled:opacity-40"
          >{c.create}</button>
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
            {assessment.title || c.title}
            <span className={`ml-2 text-[11px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide ${
              finalized ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'
            }`}>{finalized ? c.finalized : c.draft}</span>
          </h2>
          <p className="text-sm text-gray-500">{finalized ? c.introFinal : c.introDraft}</p>
        </div>
        {!finalized && (
          <button
            onClick={handleSuggested}
            disabled={busy}
            className="text-xs font-semibold bg-ey-charcoal text-ey-yellow rounded-lg px-3 py-1.5 hover:bg-gray-800 disabled:opacity-40 flex-shrink-0"
          >{c.suggested}</button>
        )}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
      {msg && <p className={`text-sm rounded-lg px-3 py-2 border ${msg.ok ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'}`}>{msg.text}</p>}

      {/* Dimension → department mapping + progress */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 bg-gray-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          <span>{c.colDim}</span><span className="w-56">{c.colDept}</span><span className="w-24 text-right">{c.colProg}</span>
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
                <div className="text-[11px] text-gray-400">{c.suggestedFor}: {TUNISIA_SUGGESTED_MAPPING[d] || '—'}</div>
              </div>
              <select
                value={assignedDept[d] || ''}
                disabled={busy || finalized}
                onChange={e => handleAssign(d, e.target.value)}
                className="w-56 border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-ey-yellow disabled:opacity-60"
              >
                <option value="">{c.unassigned}</option>
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
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{c.globalScore}</div>
            <div className="text-3xl font-bold font-mono text-ey-charcoal">{s.globalScore ?? '—'}<span className="text-base text-gray-400">/5</span></div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{c.maturity}</div>
            <div className="text-xl font-semibold text-gray-700">{s.maturityLevel ? c.level(s.maturityLevel) : '—'}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{c.bct}</div>
            <div className="text-xl font-semibold text-gray-700">{s.bctRate}%</div>
          </div>
        </div>
        {!finalized && (
          <button
            onClick={handleFinalize}
            disabled={busy || saving}
            className="bg-ey-yellow text-ey-charcoal font-semibold rounded-lg px-5 py-2.5 text-sm hover:bg-yellow-400 disabled:opacity-40"
          >{saving ? c.finalizing : c.finalize}</button>
        )}
        {finalized && (
          <button
            onClick={handleCreate}
            disabled={busy}
            className="text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 disabled:opacity-40"
          >{c.startNew}</button>
        )}
      </div>
    </div>
  );
}
