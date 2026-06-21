import { useState } from 'react';
import useContentStore from '../../store/useContentStore';
import { isSupabaseConfigured } from '../../lib/supabase';
import { DIMENSIONS, INDICATORS, SUBDIM_NAMES } from '../../data/indicators';

// ── Editor for one dimension's name, weight and colour ──────────────────────
function DimensionRow({ code, dim, totalWeight, onSave, onDelete }) {
  const [name, setName] = useState(dim.name);
  const [weight, setWeight] = useState(String(dim.weight));
  const [color, setColor] = useState(dim.color || '#888888');
  const [desc, setDesc] = useState(dim.desc || '');
  const [status, setStatus] = useState('idle');
  const [err, setErr] = useState(null);

  const pct = totalWeight > 0 ? Math.round((Number(weight) / totalWeight) * 100) : 0;
  const dirty =
    name !== dim.name ||
    Number(weight) !== dim.weight ||
    color !== (dim.color || '#888888') ||
    desc !== (dim.desc || '');

  async function save() {
    setStatus('saving'); setErr(null);
    const { error } = await onSave(code, { name, weight: Number(weight), color, description: desc });
    if (error) { setStatus('error'); setErr(error); return; }
    setStatus('saved'); setTimeout(() => setStatus('idle'), 1500);
  }

  return (
    <div className="px-4 py-2.5 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <input
          type="color" value={color} onChange={e => setColor(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer border border-gray-200 flex-shrink-0"
          title="Dimension colour"
        />
        <span className="text-xs font-mono text-gray-400 w-7">{code}</span>
        <input
          value={name} onChange={e => setName(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow"
        />
        <input
          type="number" step="0.05" min="0" value={weight} onChange={e => setWeight(e.target.value)}
          className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow"
        />
        <span className="text-xs text-gray-500 w-10 text-right">{pct}%</span>
        <button
          onClick={save} disabled={!dirty || status === 'saving'}
          className="text-xs font-semibold rounded-lg px-3 py-1.5 bg-ey-charcoal text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved ✓' : 'Save'}
        </button>
        <button
          onClick={() => onDelete(code, dim.name)}
          className="text-xs font-medium rounded-lg px-2.5 py-1.5 text-red-600 hover:bg-red-50"
          title="Delete this dimension and all its indicators"
        >
          🗑
        </button>
      </div>
      <input
        value={desc}
        onChange={e => setDesc(e.target.value)}
        placeholder="Short description shown to users for this dimension…"
        className="ml-10 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-ey-yellow"
      />
      {err && <span className="text-xs text-red-600 ml-10">{err}</span>}
    </div>
  );
}

// ── Editor for one indicator ────────────────────────────────────────────────
function IndicatorRow({ ind, onSave, onDelete }) {
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
          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Question</label>
          <textarea value={q} onChange={e => setQ(e.target.value)} rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Hint / guidance</label>
          <textarea value={hint} onChange={e => setHint(e.target.value)} rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow" />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={bct} onChange={e => setBct(e.target.checked)} />
          Mandatory BCT indicator (cannot be skipped)
        </label>
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Scoring rubric — levels 1 to 5
          </label>
          <div className="flex flex-col gap-2">
            {rubric.map((level, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="w-6 h-6 mt-1 flex-shrink-0 rounded-full bg-ey-charcoal text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <textarea value={level} onChange={e => setLevel(i, e.target.value)} rows={2}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={save} disabled={status === 'saving'}
            className="text-sm font-semibold rounded-lg px-4 py-2 bg-ey-yellow text-ey-charcoal hover:bg-yellow-400 disabled:opacity-40">
            {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved ✓' : 'Save indicator'}
          </button>
          <button onClick={() => onDelete(ind.id, ind.q)}
            className="text-sm font-medium rounded-lg px-3 py-2 text-red-600 hover:bg-red-50">
            🗑 Delete indicator
          </button>
          {err && <span className="text-xs text-red-600">{err}</span>}
        </div>
      </div>
    </details>
  );
}

export default function AdminQuestionnaire() {
  const source = useContentStore(s => s.source);
  const version = useContentStore(s => s.version);
  const {
    seedDefaults, saveDimension, saveIndicator,
    addIndicator, deleteIndicator,
    addSubDimension, renameSubDimension, deleteSubDimension,
    addDimension, deleteDimension,
  } = useContentStore();

  const [seeding, setSeeding] = useState(false);
  const [seedErr, setSeedErr] = useState(null);

  async function handleSeed() {
    setSeeding(true); setSeedErr(null);
    const { error } = await seedDefaults();
    setSeeding(false);
    if (error) setSeedErr(error);
  }

  // Wrap a structural action so any error surfaces instead of failing silently.
  async function run(promise) {
    const { error } = await promise;
    if (error) alert(`Could not complete that change:\n${error}`);
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Editing the questionnaire requires the Supabase backend to be configured.
        The app is currently running on its built-in defaults.
      </div>
    );
  }

  if (source !== 'remote') {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Start editing the questionnaire</h2>
        <p className="text-sm text-gray-500 mb-4">
          The content database is empty, so the app is using its built-in default
          questionnaire (5 dimensions, {INDICATORS.length} indicators). Load those
          defaults into the database to begin editing. This is safe — it won't change
          anything analysts have already answered.
        </p>
        <button onClick={handleSeed} disabled={seeding}
          className="bg-ey-yellow text-ey-charcoal font-semibold rounded-lg px-4 py-2.5 text-sm hover:bg-yellow-400 disabled:opacity-40">
          {seeding ? 'Loading…' : 'Load defaults into database'}
        </button>
        {seedErr && <p className="text-sm text-red-600 mt-3">{seedErr}</p>}
      </div>
    );
  }

  const dimEntries = Object.entries(DIMENSIONS);
  const totalWeight = dimEntries.reduce((a, [, d]) => a + (Number(d.weight) || 0), 0);

  // ── Structural action handlers ────────────────────────────────────────────
  const onAddDimension = () => {
    const name = prompt('Name for the new dimension?');
    if (name?.trim()) run(addDimension({ name: name.trim() }));
  };
  const onDeleteDimension = (code, name) => {
    if (confirm(`Delete dimension "${code} · ${name}" and ALL its indicators? This cannot be undone.`)) {
      run(deleteDimension(code));
    }
  };
  const onAddSub = (dim) => {
    const name = prompt('Name for the new sub-dimension?');
    if (name?.trim()) run(addSubDimension(dim, name.trim()));
  };
  const onRenameSub = (dim, sub, current) => {
    const name = prompt('Rename sub-dimension:', current);
    if (name?.trim() && name.trim() !== current) run(renameSubDimension(dim, sub, name.trim()));
  };
  const onDeleteSub = (dim, sub, name) => {
    if (confirm(`Delete sub-dimension "${sub} · ${name}" and all its indicators?`)) {
      run(deleteSubDimension(dim, sub));
    }
  };
  const onAddIndicator = (dim, sub) => run(addIndicator(dim, sub, SUBDIM_NAMES[sub] || sub));
  const onDeleteIndicator = (id, q) => {
    if (confirm(`Delete indicator "${id}"?\n\n${q}`)) run(deleteIndicator(id));
  };

  return (
    <div key={version} className="flex flex-col gap-8">
      {/* Dimensions & weights */}
      <section>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-gray-800">Dimensions &amp; weights</h2>
          <button onClick={onAddDimension}
            className="text-xs font-semibold rounded-lg px-3 py-1.5 border border-ey-charcoal text-ey-charcoal hover:bg-gray-50">
            + Add dimension
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-3">
          Weights are relative — percentages show each dimension's share of the overall
          score and need not add up to 100%.
        </p>
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
          {dimEntries.map(([code, dim]) => (
            <DimensionRow key={code} code={code} dim={dim} totalWeight={totalWeight}
              onSave={saveDimension} onDelete={onDeleteDimension} />
          ))}
          {dimEntries.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-gray-400">No dimensions. Add one to begin.</div>
          )}
        </div>
      </section>

      {/* Indicators grouped by dimension → sub-dimension */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Indicators &amp; rubrics</h2>
        <p className="text-sm text-gray-500 mb-3">
          Indicators are grouped by sub-dimension. Add, rename or remove groups and
          indicators with the buttons on each section.
        </p>
        <div className="flex flex-col gap-8">
          {dimEntries.map(([code, dim]) => (
            <div key={code} className="border-l-2 pl-4" style={{ borderColor: dim.color || '#ddd' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-800">{code} · {dim.name}</h3>
                <button onClick={() => onAddSub(code)}
                  className="text-xs font-medium text-gray-600 border border-gray-300 rounded-lg px-2.5 py-1 hover:bg-gray-50">
                  + Add sub-dimension
                </button>
              </div>

              {(dim.subDims || []).length === 0 && (
                <p className="text-xs text-gray-400 mb-3">No sub-dimensions yet — add one above.</p>
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
                        <div className="flex gap-1 ml-2">
                          <button onClick={() => onRenameSub(code, sub, subName)}
                            className="text-[11px] text-gray-500 hover:text-gray-800 px-1.5 py-0.5 rounded hover:bg-gray-100">Rename</button>
                          <button onClick={() => onAddIndicator(code, sub)}
                            className="text-[11px] text-ey-charcoal font-medium px-1.5 py-0.5 rounded hover:bg-gray-100">+ Indicator</button>
                          <button onClick={() => onDeleteSub(code, sub, subName)}
                            className="text-[11px] text-red-600 px-1.5 py-0.5 rounded hover:bg-red-50">Delete</button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {inds.map(ind => (
                          <IndicatorRow key={ind.id} ind={ind} onSave={saveIndicator} onDelete={onDeleteIndicator} />
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
