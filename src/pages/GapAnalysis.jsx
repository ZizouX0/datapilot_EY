import { useState } from 'react';
import useAppStore from '../store/useAppStore';
import { DIMENSIONS, SUBDIM_NAMES } from '../data/indicators';
import { RECOMMENDATIONS, getBand } from '../data/recommendations';
import DimensionPill from '../components/ui/DimensionPill';

const PHASE_CONFIG = [
  { label: 'Phase 1', sub: '0–3 months', desc: 'Critical gaps and BCT compliance', headerClass: 'bg-ey-charcoal text-white' },
  { label: 'Phase 2', sub: '3–6 months', desc: 'Formalization and documentation', headerClass: 'bg-ey-yellow text-ey-charcoal' },
  { label: 'Phase 3', sub: '6–12 months', desc: 'Optimization and continuous improvement', headerClass: 'bg-teal-600 text-white' },
];

function getPhase(score) {
  if (score === null || score < 2.0) return 0;
  if (score < 3.0) return 1;
  return 2;
}

function getPriorityChip(score) {
  if (score === null || score < 1.5) return { label: 'Critical', bg: '#FDECEA', color: '#B71C1C' };
  if (score < 2.5) return { label: 'High', bg: '#FFF3E0', color: '#E65100' };
  if (score < 3.5) return { label: 'Moderate', bg: '#FFFDE7', color: '#827717' };
  return { label: 'Low', bg: '#E8F5E9', color: '#1B5E20' };
}

function getMatrixQuadrant(dim, score, weight) {
  if (score === null || score < 2.0) {
    if (weight >= 0.20) return 'major';
    return 'fillin';
  }
  if (score < 3.0) {
    if (weight >= 0.20) return 'quickwin';
    return 'fillin';
  }
  return 'lowpri';
}

export default function GapAnalysis() {
  const getDimScore = useAppStore(s => s.getDimScore);
  const getSubDimScore = useAppStore(s => s.getSubDimScore);
  const getCriticalGapsCount = useAppStore(s => s.getCriticalGapsCount);

  const [selectedDim, setSelectedDim] = useState('D1');

  const dims = Object.keys(DIMENSIONS);
  const criticalCount = getCriticalGapsCount();

  // Build sub-dim rows sorted by score ascending
  const rows = [];
  dims.forEach(dim => {
    DIMENSIONS[dim].subDims.forEach(sd => {
      const score = getSubDimScore(sd);
      rows.push({ dim, sd, name: SUBDIM_NAMES[sd], score });
    });
  });
  rows.sort((a, b) => {
    if (a.score === null && b.score === null) return 0;
    if (a.score === null) return -1;
    if (b.score === null) return 1;
    return a.score - b.score;
  });

  // Matrix
  const matrix = { quickwin: [], major: [], fillin: [], lowpri: [] };
  dims.forEach(dim => {
    const score = getDimScore(dim);
    const q = getMatrixQuadrant(dim, score, DIMENSIONS[dim].weight);
    matrix[q].push(dim);
  });

  // Selected dim recommendations
  const selScore = getDimScore(selectedDim);
  const band = getBand(selScore);
  const actions = RECOMMENDATIONS[selectedDim][band];

  // Roadmap
  const phases = [[], [], []];
  dims.forEach(dim => {
    const score = getDimScore(dim);
    phases[getPhase(score)].push(dim);
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Alert banner */}
      {criticalCount > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
          ⚠ <strong>{criticalCount} critical gap{criticalCount > 1 ? 's' : ''} identified.</strong>
          &nbsp;BCT compliance at risk. Immediate action required.
        </div>
      )}

      {/* Main layout */}
      <div className="flex gap-4 items-start">
        {/* Left: gap table */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid text-[10px] font-bold uppercase tracking-wide text-gray-400 border-b border-gray-100 px-4 py-2"
              style={{ gridTemplateColumns: '56px 64px 1fr 64px 100px' }}>
              <div>Dim</div><div>Sub-dim</div><div>Sub-dimension name</div><div>Score</div><div>Priority</div>
            </div>
            {rows.map(row => {
              const chip = getPriorityChip(row.score);
              return (
                <div
                  key={row.sd}
                  className="grid items-center px-4 py-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                  style={{ gridTemplateColumns: '56px 64px 1fr 64px 100px' }}
                  onClick={() => setSelectedDim(row.dim)}
                >
                  <div>
                    <DimensionPill dim={row.dim} />
                  </div>
                  <div className="text-xs font-mono text-gray-400">{row.sd}</div>
                  <div className="text-xs text-gray-700 pr-2">{row.name}</div>
                  <div className="text-sm font-bold tabular-nums" style={{ color: DIMENSIONS[row.dim].color }}>
                    {row.score !== null ? row.score.toFixed(2) : '—'}
                  </div>
                  <div>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: chip.bg, color: chip.color }}
                    >
                      {chip.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: matrix + actions */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-3">
          {/* Effort/Impact matrix */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-3">
              Effort / Impact Matrix
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {[
                { key: 'quickwin', label: 'Quick Wins', style: 'bg-green-50 border-green-200 text-green-700' },
                { key: 'major', label: 'Major Projects', style: 'bg-red-50 border-red-200 text-red-700' },
                { key: 'fillin', label: 'Fill-ins', style: 'bg-gray-50 border-gray-200 text-gray-500' },
                { key: 'lowpri', label: 'Low Priority', style: 'bg-gray-50 border-gray-200 text-gray-500' },
              ].map(q => (
                <div key={q.key} className={`rounded-lg border p-3 text-xs font-semibold text-center ${q.style}`}>
                  {q.label}
                  <div className="text-[10px] font-normal mt-1 opacity-80">
                    {matrix[q.key].length > 0 ? matrix[q.key].join(', ') : '—'}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-gray-400 text-center">← Low Effort · High Effort →</div>
          </div>

          {/* Top recommended actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-1">
              Top Recommended Actions
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold" style={{ color: DIMENSIONS[selectedDim].color }}>
                {selectedDim} — {DIMENSIONS[selectedDim].name}
              </span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                style={{
                  background: getPriorityChip(selScore).bg,
                  color: getPriorityChip(selScore).color,
                }}
              >
                {getPriorityChip(selScore).label}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {actions.map((action, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: DIMENSIONS[selectedDim].color }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-xs text-gray-700 leading-snug">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="text-sm font-semibold text-gray-800">Recommended improvement roadmap</div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          {PHASE_CONFIG.map((phase, phaseIdx) => (
            <div key={phase.label}>
              <div className={`px-4 py-3 ${phase.headerClass}`}>
                <div className="font-bold text-sm">{phase.label} · {phase.sub}</div>
                <div className="text-xs opacity-80 mt-0.5">{phase.desc}</div>
              </div>
              <div className="p-3 flex flex-col gap-2">
                {phases[phaseIdx].length === 0 ? (
                  <div className="text-xs text-gray-400 italic py-2">No dimensions in this phase</div>
                ) : (
                  phases[phaseIdx].map(dim => {
                    const dimScore = getDimScore(dim);
                    const dimBand = getBand(dimScore);
                    const dimActions = RECOMMENDATIONS[dim][dimBand];
                    return (
                      <div
                        key={dim}
                        className="rounded-lg border-l-4 pl-3 py-2 bg-gray-50"
                        style={{ borderLeftColor: DIMENSIONS[dim].color }}
                      >
                        <div className="text-[10px] font-semibold mb-1" style={{ color: DIMENSIONS[dim].color }}>
                          {dim} — {DIMENSIONS[dim].name}
                        </div>
                        {dimActions.slice(0, 2).map((a, ai) => (
                          <div key={ai} className="text-xs text-gray-600 leading-snug mb-1">
                            · {a}
                            {a.toLowerCase().includes('bct') && (
                              <span className="ml-1 text-[9px] border border-orange-400 text-orange-600 px-1 rounded">BCT</span>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
