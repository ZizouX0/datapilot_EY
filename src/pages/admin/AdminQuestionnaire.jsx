import { useState } from 'react';
import useContentStore from '../../store/useContentStore';
import useAuthStore from '../../store/useAuthStore';
import useSettingsStore from '../../store/useSettingsStore';
import { isSupabaseConfigured } from '../../lib/supabase';
import { DIMENSIONS, INDICATORS, SUBDIM_NAMES } from '../../data/indicators';

// Co-located EN/FR copy for this screen. NOTE: only the editor's chrome
// (labels, buttons, section headings, dialogs) is translated — the editable
// assessment content (dimension/indicator names, questions, hints, rubrics) is
// bank data and is never auto-translated.
const COPY = {
  en: {
    dimColour: 'Dimension colour',
    saving: 'Saving…',
    saved: 'Saved ✓',
    save: 'Save',
    deleteDimTitle: 'Delete this dimension and all its indicators',
    dimDescPlaceholder: 'Short description shown to users for this dimension…',
    question: 'Question',
    hint: 'Hint / guidance',
    mandatoryBct: 'Mandatory BCT indicator (cannot be skipped)',
    scoringRubric: 'Scoring rubric — levels 1 to 5',
    saveIndicator: 'Save indicator',
    deleteIndicator: '🗑 Delete indicator',
    backendRequired: 'Editing the questionnaire requires the Supabase backend to be configured. The app is currently running on its built-in defaults.',
    setupMasterTitle: 'Set up the EY master questionnaire',
    setupBankTitle: (bank) => `Set up ${bank}’s questionnaire`,
    setupMasterDesc: (dims, inds) => `Load the built-in default questionnaire (${dims} dimensions, ${inds} indicators) into the EY master template. Every bank's copy starts from this master.`,
    setupBankDescEdit: 'Create your bank’s own copy of the questionnaire from the EY master. You can then tailor it for your bank without affecting anyone else.',
    setupBankDescReadOnly: 'Your bank’s questionnaire hasn’t been set up yet. Ask your bank’s Admin to create it.',
    loading: 'Loading…',
    loadMaster: 'Load defaults into master',
    createBankCopy: 'Create my bank’s copy from the EY master',
    runningDefaults: 'The app is running on built-in defaults meanwhile.',
    masterScope: 'EY master questionnaire',
    bankScope: (bank) => `${bank} — questionnaire`,
    masterBanner: 'Master — changes seed new banks',
    editingBank: 'Editing your bank’s copy',
    readOnly: 'Read-only',
    dimsWeights: 'Dimensions & weights',
    addDimension: '+ Add dimension',
    weightsNote: "Weights are relative — percentages show each dimension's share of the overall score and need not add up to 100%.",
    weightInvalid: 'Weight must be a number ≥ 0.',
    nameRequired: 'Name is required.',
    totalWeight: (n) => `Total weight: ${n}`,
    noDimensions: 'No dimensions. Add one to begin.',
    indicatorsRubrics: 'Indicators & rubrics',
    indicatorsIntro: 'Indicators are grouped by sub-dimension.',
    indicatorsIntroEdit: ' Add, rename or remove groups and indicators with the buttons on each section.',
    addSubDim: '+ Add sub-dimension',
    noSubDims: 'No sub-dimensions yet.',
    rename: 'Rename',
    addIndicatorBtn: '+ Indicator',
    del: 'Delete',
    addDimPrompt: 'Name for the new dimension?',
    deleteDimPrompt: (code, name) => `Delete dimension "${code} · ${name}" and ALL its indicators? This cannot be undone.`,
    addSubPrompt: 'Name for the new sub-dimension?',
    renameSubPrompt: 'Rename sub-dimension:',
    deleteSubPrompt: (sub, name) => `Delete sub-dimension "${sub} · ${name}" and all its indicators?`,
    deleteIndicatorPrompt: (id, q) => `Delete indicator "${id}"?\n\n${q}`,
    couldNotComplete: (error) => `Could not complete that change:\n${error}`,
  },
  fr: {
    dimColour: 'Couleur de la dimension',
    saving: 'Enregistrement…',
    saved: 'Enregistré ✓',
    save: 'Enregistrer',
    deleteDimTitle: 'Supprimer cette dimension et tous ses indicateurs',
    dimDescPlaceholder: 'Brève description affichée aux utilisateurs pour cette dimension…',
    question: 'Question',
    hint: 'Indication / conseils',
    mandatoryBct: 'Indicateur BCT obligatoire (ne peut être ignoré)',
    scoringRubric: 'Grille de notation — niveaux 1 à 5',
    saveIndicator: 'Enregistrer l’indicateur',
    deleteIndicator: '🗑 Supprimer l’indicateur',
    backendRequired: 'La modification du questionnaire nécessite la configuration du backend Supabase. L’application fonctionne actuellement avec ses paramètres par défaut intégrés.',
    setupMasterTitle: 'Configurer le questionnaire maître EY',
    setupBankTitle: (bank) => `Configurer le questionnaire de ${bank}`,
    setupMasterDesc: (dims, inds) => `Chargez le questionnaire par défaut intégré (${dims} dimensions, ${inds} indicateurs) dans le modèle maître EY. La copie de chaque banque part de ce modèle maître.`,
    setupBankDescEdit: 'Créez la copie propre à votre banque du questionnaire à partir du modèle maître EY. Vous pourrez ensuite l’adapter à votre banque sans incidence pour les autres.',
    setupBankDescReadOnly: 'Le questionnaire de votre banque n’a pas encore été configuré. Demandez à l’Admin de votre banque de le créer.',
    loading: 'Chargement…',
    loadMaster: 'Charger les valeurs par défaut dans le modèle maître',
    createBankCopy: 'Créer la copie de ma banque à partir du modèle maître EY',
    runningDefaults: 'L’application fonctionne entre-temps avec les valeurs par défaut intégrées.',
    masterScope: 'Questionnaire maître EY',
    bankScope: (bank) => `${bank} — questionnaire`,
    masterBanner: 'Modèle maître — les modifications initialisent les nouvelles banques',
    editingBank: 'Modification de la copie de votre banque',
    readOnly: 'Lecture seule',
    dimsWeights: 'Dimensions et pondérations',
    addDimension: '+ Ajouter une dimension',
    weightsNote: 'Les pondérations sont relatives — les pourcentages indiquent la part de chaque dimension dans le score global et n’ont pas à totaliser 100 %.',
    weightInvalid: 'La pondération doit être un nombre ≥ 0.',
    nameRequired: 'Le nom est requis.',
    totalWeight: (n) => `Pondération totale : ${n}`,
    noDimensions: 'Aucune dimension. Ajoutez-en une pour commencer.',
    indicatorsRubrics: 'Indicateurs et grilles',
    indicatorsIntro: 'Les indicateurs sont regroupés par sous-dimension.',
    indicatorsIntroEdit: ' Ajoutez, renommez ou supprimez des groupes et des indicateurs à l’aide des boutons de chaque section.',
    addSubDim: '+ Ajouter une sous-dimension',
    noSubDims: 'Aucune sous-dimension pour l’instant.',
    rename: 'Renommer',
    addIndicatorBtn: '+ Indicateur',
    del: 'Supprimer',
    addDimPrompt: 'Nom de la nouvelle dimension ?',
    deleteDimPrompt: (code, name) => `Supprimer la dimension « ${code} · ${name} » et TOUS ses indicateurs ? Cette action est irréversible.`,
    addSubPrompt: 'Nom de la nouvelle sous-dimension ?',
    renameSubPrompt: 'Renommer la sous-dimension :',
    deleteSubPrompt: (sub, name) => `Supprimer la sous-dimension « ${sub} · ${name} » et tous ses indicateurs ?`,
    deleteIndicatorPrompt: (id, q) => `Supprimer l’indicateur « ${id} » ?\n\n${q}`,
    couldNotComplete: (error) => `Impossible d’effectuer cette modification :\n${error}`,
  },
};

// ── Editor for one dimension's name, weight and colour ──────────────────────
function DimensionRow({ code, dim, totalWeight, canEdit, onSave, onDelete }) {
  const lang = useSettingsStore(s => s.language);
  const c = COPY[lang] || COPY.en;
  const [name, setName] = useState(dim.name);
  const [weight, setWeight] = useState(String(dim.weight));
  const [color, setColor] = useState(dim.color || '#888888');
  const [desc, setDesc] = useState(dim.desc || '');
  const [status, setStatus] = useState('idle');
  const [err, setErr] = useState(null);

  const wNum = parseFloat(weight);
  const weightValid = Number.isFinite(wNum) && wNum >= 0;
  const nameValid = name.trim().length > 0;
  const pct = totalWeight > 0 && weightValid ? Math.round((wNum / totalWeight) * 100) : 0;
  const dirty =
    name !== dim.name ||
    Number(weight) !== dim.weight ||
    color !== (dim.color || '#888888') ||
    desc !== (dim.desc || '');

  async function save() {
    if (!weightValid) { setStatus('error'); setErr(c.weightInvalid); return; }
    if (!nameValid) { setStatus('error'); setErr(c.nameRequired); return; }
    setStatus('saving'); setErr(null);
    const { error } = await onSave(code, { name: name.trim(), weight: wNum, color, description: desc });
    if (error) { setStatus('error'); setErr(error); return; }
    setStatus('saved'); setTimeout(() => setStatus('idle'), 1500);
  }

  return (
    <div className="px-4 py-2.5 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <input
          type="color" value={color} onChange={e => setColor(e.target.value)} disabled={!canEdit}
          className="w-7 h-7 rounded cursor-pointer border border-gray-200 flex-shrink-0 disabled:cursor-default"
          title={c.dimColour}
        />
        <span className="text-xs font-mono text-gray-400 w-7">{code}</span>
        <input
          value={name} onChange={e => setName(e.target.value)} disabled={!canEdit}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow disabled:bg-gray-50 disabled:text-gray-600"
        />
        <input
          type="number" step="0.05" min="0" max="100" value={weight} onChange={e => setWeight(e.target.value)} disabled={!canEdit}
          className={`w-20 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow disabled:bg-gray-50 disabled:text-gray-600 ${weightValid ? 'border-gray-300' : 'border-red-400 bg-red-50'}`}
        />
        <span className="text-xs text-gray-500 w-10 text-right">{pct}%</span>
        {canEdit && (
          <>
            <button
              onClick={save} disabled={!dirty || status === 'saving' || !weightValid || !nameValid}
              className="text-xs font-semibold rounded-lg px-3 py-1.5 bg-ey-charcoal text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {status === 'saving' ? c.saving : status === 'saved' ? c.saved : c.save}
            </button>
            <button
              onClick={() => onDelete(code, dim.name)}
              className="text-xs font-medium rounded-lg px-2.5 py-1.5 text-red-600 hover:bg-red-50"
              title={c.deleteDimTitle}
            >🗑</button>
          </>
        )}
      </div>
      <input
        value={desc} onChange={e => setDesc(e.target.value)} disabled={!canEdit}
        placeholder={c.dimDescPlaceholder}
        className="ml-10 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-ey-yellow disabled:bg-gray-50"
      />
      {err && <span className="text-xs text-red-600 ml-10">{err}</span>}
    </div>
  );
}

// ── Editor for one indicator ────────────────────────────────────────────────
function IndicatorRow({ ind, canEdit, onSave, onDelete }) {
  const lang = useSettingsStore(s => s.language);
  const c = COPY[lang] || COPY.en;
  const [q, setQ] = useState(ind.q);
  const [hint, setHint] = useState(ind.hint || '');
  const [bct, setBct] = useState(!!ind.bct);
  const [rubric, setRubric] = useState(() => {
    const r = Array.isArray(ind.rubric) ? [...ind.rubric] : [];
    while (r.length < 5) r.push('');
    return r.slice(0, 5);
  });
  const [status, setStatus] = useState('idle');
  const [err, setErr] = useState(null);

  const setLevel = (i, val) => setRubric(r => r.map((x, idx) => (idx === i ? val : x)));

  async function save() {
    setStatus('saving'); setErr(null);
    const { error } = await onSave(ind.id, { q, hint, bct, rubric });
    if (error) { setStatus('error'); setErr(error); return; }
    setStatus('saved'); setTimeout(() => setStatus('idle'), 1500);
  }

  return (
    <details className="border border-gray-200 rounded-lg overflow-hidden group">
      <summary className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-gray-50 list-none">
        <span className="text-gray-400 text-xs transition-transform group-open:rotate-90">▶</span>
        <span className="text-xs font-mono text-gray-400">{ind.id}</span>
        {ind.bct && (
          <span className="text-[9px] font-bold bg-ey-maroon text-white px-1.5 py-0.5 rounded uppercase">BCT</span>
        )}
        <span className="text-sm text-gray-700 truncate flex-1">{ind.q}</span>
      </summary>

      <div className="px-4 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">{c.question}</label>
          <textarea value={q} onChange={e => setQ(e.target.value)} rows={2} disabled={!canEdit}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow disabled:bg-gray-100" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">{c.hint}</label>
          <textarea value={hint} onChange={e => setHint(e.target.value)} rows={2} disabled={!canEdit}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow disabled:bg-gray-100" />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={bct} onChange={e => setBct(e.target.checked)} disabled={!canEdit} />
          {c.mandatoryBct}
        </label>
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            {c.scoringRubric}
          </label>
          <div className="flex flex-col gap-2">
            {rubric.map((level, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="w-6 h-6 mt-1 flex-shrink-0 rounded-full bg-ey-charcoal text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <textarea value={level} onChange={e => setLevel(i, e.target.value)} rows={2} disabled={!canEdit}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow disabled:bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
        {canEdit && (
          <div className="flex items-center gap-3">
            <button onClick={save} disabled={status === 'saving'}
              className="text-sm font-semibold rounded-lg px-4 py-2 bg-ey-yellow text-ey-charcoal hover:bg-yellow-400 disabled:opacity-40">
              {status === 'saving' ? c.saving : status === 'saved' ? c.saved : c.saveIndicator}
            </button>
            <button onClick={() => onDelete(ind.id, ind.q)}
              className="text-sm font-medium rounded-lg px-3 py-2 text-red-600 hover:bg-red-50">
              {c.deleteIndicator}
            </button>
            {err && <span className="text-xs text-red-600">{err}</span>}
          </div>
        )}
      </div>
    </details>
  );
}

export default function AdminQuestionnaire() {
  const source = useContentStore(s => s.source);
  const version = useContentStore(s => s.version);
  const seeded = useContentStore(s => s.seeded);
  const {
    seedDefaults, seedBankFromMaster, saveDimension, saveIndicator,
    addIndicator, deleteIndicator,
    addSubDimension, renameSubDimension, deleteSubDimension,
    addDimension, deleteDimension,
  } = useContentStore();

  const role = useAuthStore(s => s.role);
  const bankName = useAuthStore(s => s.bankName);
  const isOwner = role === 'owner';
  const lang = useSettingsStore(s => s.language);
  const c = COPY[lang] || COPY.en;
  // EY edits the master; a bank Admin edits their bank; Super Admins read-only.
  const canEdit = isOwner || role === 'admin';
  const scopeLabel = isOwner ? c.masterScope : c.bankScope(bankName || (lang === 'fr' ? 'Votre banque' : 'Your bank'));

  const [seeding, setSeeding] = useState(false);
  const [seedErr, setSeedErr] = useState(null);

  async function handleSeed() {
    setSeeding(true); setSeedErr(null);
    const { error } = await (isOwner ? seedDefaults() : seedBankFromMaster());
    setSeeding(false);
    if (error) setSeedErr(error);
  }

  async function run(promise) {
    const { error } = await promise;
    if (error) alert(c.couldNotComplete(error));
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {c.backendRequired}
      </div>
    );
  }

  // No copy for this scope yet → seed it (owner: master; admin: from master).
  if (!seeded) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          {isOwner ? c.setupMasterTitle : c.setupBankTitle(bankName || (lang === 'fr' ? 'votre banque' : 'your bank'))}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {isOwner
            ? c.setupMasterDesc(Object.keys(DIMENSIONS).length, INDICATORS.length)
            : canEdit
              ? c.setupBankDescEdit
              : c.setupBankDescReadOnly}
        </p>
        {canEdit && (
          <button onClick={handleSeed} disabled={seeding}
            className="bg-ey-yellow text-ey-charcoal font-semibold rounded-lg px-4 py-2.5 text-sm hover:bg-yellow-400 disabled:opacity-40">
            {seeding ? c.loading : isOwner ? c.loadMaster : c.createBankCopy}
          </button>
        )}
        {seedErr && <p className="text-sm text-red-600 mt-3">{seedErr}</p>}
        {source !== 'remote' && !canEdit && (
          <p className="text-xs text-gray-400 mt-3">{c.runningDefaults}</p>
        )}
      </div>
    );
  }

  const dimEntries = Object.entries(DIMENSIONS);
  const totalWeight = dimEntries.reduce((a, [, d]) => a + (Number(d.weight) || 0), 0);

  // ── Structural action handlers ────────────────────────────────────────────
  const onAddDimension = () => {
    const name = prompt(c.addDimPrompt);
    if (name?.trim()) run(addDimension({ name: name.trim() }));
  };
  const onDeleteDimension = (code, name) => {
    if (confirm(c.deleteDimPrompt(code, name))) {
      run(deleteDimension(code));
    }
  };
  const onAddSub = (dim) => {
    const name = prompt(c.addSubPrompt);
    if (name?.trim()) run(addSubDimension(dim, name.trim()));
  };
  const onRenameSub = (dim, sub, current) => {
    const name = prompt(c.renameSubPrompt, current);
    if (name?.trim() && name.trim() !== current) run(renameSubDimension(dim, sub, name.trim()));
  };
  const onDeleteSub = (dim, sub, name) => {
    if (confirm(c.deleteSubPrompt(sub, name))) {
      run(deleteSubDimension(dim, sub));
    }
  };
  const onAddIndicator = (dim, sub) => run(addIndicator(dim, sub, SUBDIM_NAMES[sub] || sub));
  const onDeleteIndicator = (id, q) => {
    if (confirm(c.deleteIndicatorPrompt(id, q))) run(deleteIndicator(id));
  };

  return (
    <div key={version} className="flex flex-col gap-8">
      {/* Scope banner */}
      <div className={`rounded-lg px-4 py-2.5 text-sm flex items-center justify-between ${
        isOwner ? 'bg-ey-charcoal text-white' : 'bg-gray-100 text-gray-700'
      }`}>
        <span className="font-semibold">{scopeLabel}</span>
        <span className="text-xs opacity-80">
          {canEdit ? (isOwner ? c.masterBanner : c.editingBank) : c.readOnly}
        </span>
      </div>

      {/* Dimensions & weights */}
      <section>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-gray-800">{c.dimsWeights}</h2>
          {canEdit && (
            <button onClick={onAddDimension}
              className="text-xs font-semibold rounded-lg px-3 py-1.5 border border-ey-charcoal text-ey-charcoal hover:bg-gray-50">
              {c.addDimension}
            </button>
          )}
        </div>
        <div className="flex items-center justify-between mb-3 gap-3">
          <p className="text-sm text-gray-500">{c.weightsNote}</p>
          {dimEntries.length > 0 && (
            <span className="text-xs font-semibold text-gray-600 whitespace-nowrap bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1">
              {c.totalWeight(totalWeight.toFixed(2))}
            </span>
          )}
        </div>
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
          {dimEntries.map(([code, dim]) => (
            <DimensionRow key={code} code={code} dim={dim} totalWeight={totalWeight}
              canEdit={canEdit} onSave={saveDimension} onDelete={onDeleteDimension} />
          ))}
          {dimEntries.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">{c.noDimensions}</div>
          )}
        </div>
      </section>

      {/* Indicators grouped by dimension → sub-dimension */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">{c.indicatorsRubrics}</h2>
        <p className="text-sm text-gray-500 mb-3">
          {c.indicatorsIntro}
          {canEdit && c.indicatorsIntroEdit}
        </p>
        <div className="flex flex-col gap-8">
          {dimEntries.map(([code, dim]) => (
            <div key={code} className="border-l-2 pl-4" style={{ borderColor: dim.color || '#ddd' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-800">{code} · {dim.name}</h3>
                {canEdit && (
                  <button onClick={() => onAddSub(code)}
                    className="text-xs font-medium text-gray-600 border border-gray-300 rounded-lg px-2.5 py-1 hover:bg-gray-50">
                    {c.addSubDim}
                  </button>
                )}
              </div>

              {(dim.subDims || []).length === 0 && (
                <p className="text-xs text-gray-400 mb-3">{c.noSubDims}</p>
              )}

              <div className="flex flex-col gap-5">
                {(dim.subDims || []).map(sub => {
                  const subName = SUBDIM_NAMES[sub] || sub;
                  const inds = INDICATORS.filter(i => i.dim === code && i.sub === sub);
                  return (
                    <div key={sub}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-gray-400">{sub}</span>
                        <span className="text-sm font-semibold text-gray-700">{subName}</span>
                        <span className="text-xs text-gray-400">· {inds.length}</span>
                        {canEdit && (
                          <div className="flex gap-1 ml-2">
                            <button onClick={() => onRenameSub(code, sub, subName)}
                              className="text-[11px] text-gray-500 hover:text-gray-800 px-1.5 py-0.5 rounded hover:bg-gray-100">{c.rename}</button>
                            <button onClick={() => onAddIndicator(code, sub)}
                              className="text-[11px] text-ey-charcoal font-medium px-1.5 py-0.5 rounded hover:bg-gray-100">{c.addIndicatorBtn}</button>
                            <button onClick={() => onDeleteSub(code, sub, subName)}
                              className="text-[11px] text-red-600 px-1.5 py-0.5 rounded hover:bg-red-50">{c.del}</button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {inds.map(ind => (
                          <IndicatorRow key={ind.id} ind={ind} canEdit={canEdit}
                            onSave={saveIndicator} onDelete={onDeleteIndicator} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
