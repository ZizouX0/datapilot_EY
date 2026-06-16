import { useState } from 'react';
import useContentStore from '../../store/useContentStore';
import { isSupabaseConfigured } from '../../lib/supabase';
import { DIMENSIONS, INDICATORS } from '../../data/indicators';

// ── Editor for one dimension's name + weight ────────────────────────────────
function DimensionRow({ code, dim, totalWeight, onSave }) {
  const [name, setName] = useState(dim.name);
  const [weight, setWeight] = useState(String(dim.weight));
  const [status, setStatus] = useState('idle'); // idle | saving | saved | error
  const [err, setErr] = useState(null);

  const pct = totalWeight > 0 ? Math.round((Number(weight) / totalWeight) * 100) : 0;
  const dirty = name !== dim.name || Number(weight) !== dim.weight;

  async function save() {
    setStatus('saving');
    setErr(null);
    const { error } = await onSave(code, { name, weight: Number(weight) });
    if (error) { setStatus('error'); setErr(error); return; }
    setStatus('saved');
    setTimeout(() => setStatus('idle'), 1500);
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <span
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ background: dim.color || '#999' }}
      />
      <span className="text-xs font-mono text-gray-400 w-7">{code}</span>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow"
      />
      <input
        type="number"
        step="0.05"
        min="0"
        value={weight}
        onChange={e => setWeight(e.target.value)}
        className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow"
      />
      <span className="text-xs text-gray-500 w-12 text-right">{pct}%</span>
      <button
        onClick={save}
        disabled={!dirty || status === 'saving'}
        className="text-xs font-semibold rounded-lg px-3 py-1.5 bg-ey-charcoal text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved ✓' : 'Save'}
      </button>
      {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  );
}

// ── Editor for one indicator (question, hint, BCT, 5 rubric levels) ──────────
function IndicatorRow({ ind, onSave }) {
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

  function setLevel(i, val) {
    setRubric(r => r.map((x, idx) => (idx === i ? val : x)));
  }

  async function save() {
    setStatus('saving');
    setErr(null);
    const { error } = await onSave(ind.id, { q, hint, bct, rubric });
    if (error) { setStatus('error'); setErr(error); return; }
    setStatus('saved');
    setTimeout(() => setStatus('idle'), 1500);
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
          <textarea
            value={q}
            onChange={e => setQ(e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Hint / guidance</label>
          <textarea
            value={hint}
            onChange={e => setHint(e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow"
          />
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
                <span className="w-6 h-6 mt-1 flex-shrink-0 rounded-full bg-ey-charcoal text-white text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <textarea
                  value={level}
                  onChange={e => setLevel(i, e.target.value)}
                  rows={2}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ey-yellow"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={status === 'saving'}
            className="text-sm font-semibold rounded-lg px-4 py-2 bg-ey-yellow text-ey-charcoal hover:bg-yellow-400 disabled:opacity-40"
          >
            {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved ✓' : 'Save indicator'}
          </button>
          {err && <span className="text-xs text-red-600">{err}</span>}
        </div>
      </div>
    </details>
  );
}

export default function AdminQuestionnaire() {
  // Subscribe to source + version so the editor re-renders after a save/seed.
  const source = useContentStore(s => s.source);
  const version = useContentStore(s => s.version);
  const seedDefaults = useContentStore(s => s.seedDefaults);
  const saveDimension = useContentStore(s => s.saveDimension);
  const saveIndicator = useContentStore(s => s.saveIndicator);

  const [seeding, setSeeding] = useState(false);
  const [seedErr, setSeedErr] = useState(null);

  async function handleSeed() {
    setSeeding(true);
    setSeedErr(null);
    const { error } = await seedDefaults();
    setSeeding(false);
    if (error) setSeedErr(error);
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
      <div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 max-w-2xl">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Start editing the questionnaire</h2>
          <p className="text-sm text-gray-500 mb-4">
            The content database is empty, so the app is using its built-in default
            questionnaire (5 dimensions, {INDICATORS.length} indicators). Load those
            defaults into the database to begin editing the questions, rubrics and weights.
            This is safe to run — it won't change anything analysts have already answered.
          </p>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="bg-ey-yellow text-ey-charcoal font-semibold rounded-lg px-4 py-2.5 text-sm hover:bg-yellow-400 disabled:opacity-40"
          >
            {seeding ? 'Loading…' : 'Load defaults into database'}
          </button>
          {seedErr && <p className="text-sm text-red-600 mt-3">{seedErr}</p>}
        </div>
      </div>
    );
  }

  const dimEntries = Object.entries(DIMENSIONS);
  const totalWeight = dimEntries.reduce((a, [, d]) => a + (Number(d.weight) || 0), 0);

  return (
    // key on version forces child editors to reset to fresh values after a save.
    <div key={version} className="flex flex-col gap-8">
      {/* Dimensions & weights */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Dimensions &amp; weights</h2>
        <p className="text-sm text-gray-500 mb-3">
          Weights are relative — the percentages show each dimension's share of the
          overall score. They don't need to add up to exactly 100%.
        </p>
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
          {dimEntries.map(([code, dim]) => (
            <DimensionRow
              key={code}
              code={code}
              dim={dim}
              totalWeight={totalWeight}
              onSave={saveDimension}
            />
          ))}
        </div>
      </section>

      {/* Indicators grouped by dimension */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Indicators &amp; rubrics</h2>
        <p className="text-sm text-gray-500 mb-3">
          Click an indicator to edit its question, guidance, BCT flag and 5-level
          scoring rubric.
        </p>
        <div className="flex flex-col gap-6">
          {dimEntries.map(([code, dim]) => {
            const inds = INDICATORS.filter(i => i.dim === code);
            return (
              <div key={code}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: dim.color || '#999' }} />
                  <h3 className="text-sm font-semibold text-gray-700">
                    {code} · {dim.name}
                    <span className="ml-2 text-xs font-normal text-gray-400">{inds.length} indicators</span>
                  </h3>
                </div>
                <div className="flex flex-col gap-2">
                  {inds.map(ind => (
                    <IndicatorRow key={ind.id} ind={ind} onSave={saveIndicator} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
