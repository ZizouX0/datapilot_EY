import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import useAppStore, { MATURITY_LEVELS } from '../store/useAppStore';
import useSettingsStore from '../store/useSettingsStore';
import { DIMENSIONS, SUBDIM_NAMES } from '../data/indicators';
import { RECOMMENDATIONS, getBand } from '../data/recommendations';
import { buildRoadmap, PHASE_META } from '../lib/roadmap';
import DimensionPill from '../components/ui/DimensionPill';
import ReportCover from '../components/ReportCover';

const COPY = {
  en: {
    coverTitle: 'Improvement Roadmap',
    coverSubtitle: 'Prioritized gap remediation plan',
    docTitleSuffix: 'Improvement Roadmap',
    bankFallback: 'Bank',
    savePdf: '⤓ Save as PDF',
    savePdfHint: 'Opens your browser’s save window — choose "Save as PDF" to download the file.',
    criticalAlert: (n) => `${n} critical gap${n > 1 ? 's' : ''} identified.`,
    criticalAlertTail: 'BCT compliance at risk. Immediate action required.',
    thDim: 'Dim',
    thSubDim: 'Sub-dim',
    thSubDimName: 'Sub-dimension name',
    thScore: 'Score',
    thPriority: 'Priority',
    matrixTitle: 'Effort / Impact Matrix',
    quickWins: 'Quick Wins',
    majorProjects: 'Major Projects',
    fillIns: 'Fill-ins',
    lowPriority: 'Low Priority',
    effortAxis: '← Low Effort · High Effort →',
    topActionsTitle: 'Top Recommended Actions',
    roadmapTitle: 'Recommended improvement roadmap',
    generating: 'Generating…',
    regenerateAi: '✦ Regenerate AI actions',
    generateAi: '✦ Generate AI actions',
    roadmapSubtitle: 'Sequenced by regulatory risk and business impact (weight × gap)',
    aiUnavailable: (msg) => `AI unavailable: ${msg} — showing standard recommendations.`,
    currentTarget: (cmmi) => `Current → Target (${cmmi})`,
    criticalActions: 'Critical actions',
    bctItems: 'BCT items',
    totalActions: 'Total actions',
    allMeet: (target) => `All assessed areas already meet the target maturity level of ${target}. No remediation actions required.`,
    noActionsPhase: 'No actions in this phase',
    // Priority labels
    pCritical: 'Critical',
    pHigh: 'High',
    pModerate: 'Moderate',
    pLow: 'Low',
    // Card chrome
    items: (n) => `item${n > 1 ? 's' : ''}`,
    effortSuffix: 'effort',
    weightLabel: 'weight',
    regulatoryToClose: 'Regulatory items to close',
    aiTailored: '✦ AI-tailored',
    targetTitle: (t) => `Target ${t}`,
    // Effort labels
    eHigh: 'High',
    eMedium: 'Medium',
    eLow: 'Low',
  },
  fr: {
    coverTitle: 'Feuille de route d’amélioration',
    coverSubtitle: 'Plan priorisé de remédiation des écarts',
    docTitleSuffix: 'Feuille de route d’amélioration',
    bankFallback: 'Banque',
    savePdf: '⤓ Enregistrer en PDF',
    savePdfHint: 'Ouvre la fenêtre d’enregistrement de votre navigateur — choisissez « Enregistrer en PDF » pour télécharger le fichier.',
    criticalAlert: (n) => `${n} écart${n > 1 ? 's' : ''} critique${n > 1 ? 's' : ''} identifié${n > 1 ? 's' : ''}.`,
    criticalAlertTail: 'Conformité BCT menacée. Action immédiate requise.',
    thDim: 'Dim',
    thSubDim: 'Sous-dim',
    thSubDimName: 'Nom de la sous-dimension',
    thScore: 'Score',
    thPriority: 'Priorité',
    matrixTitle: 'Matrice Effort / Impact',
    quickWins: 'Gains rapides',
    majorProjects: 'Projets majeurs',
    fillIns: 'Tâches d’appoint',
    lowPriority: 'Priorité faible',
    effortAxis: '← Effort faible · Effort élevé →',
    topActionsTitle: 'Principales actions recommandées',
    roadmapTitle: 'Feuille de route d’amélioration recommandée',
    generating: 'Génération…',
    regenerateAi: '✦ Régénérer les actions IA',
    generateAi: '✦ Générer les actions IA',
    roadmapSubtitle: 'Séquencée par risque réglementaire et impact métier (poids × écart)',
    aiUnavailable: (msg) => `IA indisponible : ${msg} — affichage des recommandations standard.`,
    currentTarget: (cmmi) => `Actuel → Cible (${cmmi})`,
    criticalActions: 'Actions critiques',
    bctItems: 'Éléments BCT',
    totalActions: 'Total des actions',
    allMeet: (target) => `Tous les domaines évalués atteignent déjà le niveau de maturité cible de ${target}. Aucune action de remédiation requise.`,
    noActionsPhase: 'Aucune action dans cette phase',
    // Priority labels
    pCritical: 'Critique',
    pHigh: 'Élevée',
    pModerate: 'Modérée',
    pLow: 'Faible',
    // Card chrome
    items: (n) => `élément${n > 1 ? 's' : ''}`,
    effortSuffix: 'd’effort',
    weightLabel: 'poids',
    regulatoryToClose: 'Éléments réglementaires à traiter',
    aiTailored: '✦ Personnalisé par IA',
    targetTitle: (t) => `Cible ${t}`,
    // Effort labels
    eHigh: 'Élevé',
    eMedium: 'Moyen',
    eLow: 'Faible',
  },
};

function getPriorityChip(score, c) {
  if (score === null || score < 1.5) return { label: c.pCritical, bg: '#FDECEA', color: '#B71C1C' };
  if (score < 2.5) return { label: c.pHigh, bg: '#FFF3E0', color: '#E65100' };
  if (score < 3.5) return { label: c.pModerate, bg: '#FFFDE7', color: '#827717' };
  return { label: c.pLow, bg: '#E8F5E9', color: '#1B5E20' };
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

const EFFORT_STYLE = {
  High: { bg: '#FDECEA', color: '#B71C1C' },
  Medium: { bg: '#FFF3E0', color: '#E65100' },
  Low: { bg: '#E8F5E9', color: '#1B5E20' },
};

// Translated label for a data-keyed effort value ('High' | 'Medium' | 'Low').
function effortLabel(effort, c) {
  if (effort === 'High') return c.eHigh;
  if (effort === 'Medium') return c.eMedium;
  return c.eLow;
}

// Mini current → target progress bar with a target marker.
function ProgressBar({ current, target, color, c }) {
  const curPct = Math.max(0, Math.min(100, (current / 5) * 100));
  const tgtPct = Math.max(0, Math.min(100, (target / 5) * 100));
  return (
    <div className="relative h-2 rounded-full bg-gray-200 overflow-visible my-1.5">
      <div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{ width: `${curPct}%`, background: color }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3.5 bg-ey-charcoal"
        style={{ left: `${tgtPct}%` }}
        title={c.targetTitle(target.toFixed(1))}
      />
    </div>
  );
}

function RoadmapCard({ item, aiActions, c }) {
  const usingAi = Array.isArray(aiActions) && aiActions.length > 0;
  const actions = usingAi ? aiActions : item.actions;
  return (
    <div
      className="rounded-lg border border-gray-200 border-l-4 bg-white p-3"
      style={{ borderLeftColor: item.color }}
    >
      {/* Header: dim pill + sub-dim name */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <DimensionPill dim={item.dim} />
          <span className="text-xs font-semibold text-gray-800 truncate">{item.sdName}</span>
        </div>
        <span
          className="px-1.5 py-0.5 rounded text-[9px] font-bold flex-shrink-0"
          style={{ background: item.priority.bg, color: item.priority.color }}
        >
          {item.priority.label}
        </span>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-1.5 mb-1">
        {item.hasBctGap && (
          <span className="text-[9px] font-bold border border-orange-400 text-orange-600 px-1.5 py-0.5 rounded">
            BCT · {item.bctGaps.length} {c.items(item.bctGaps.length)}
          </span>
        )}
        <span
          className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
          style={{ background: EFFORT_STYLE[item.effort].bg, color: EFFORT_STYLE[item.effort].color }}
        >
          {effortLabel(item.effort, c)} {c.effortSuffix}
        </span>
        <span className="text-[9px] font-medium text-gray-400">
          {c.weightLabel} {Math.round(item.weight * 100)}%
        </span>
      </div>

      {/* Current → target bar */}
      <ProgressBar current={item.current} target={item.target} color={item.color} c={c} />
      <div className="flex items-center justify-between text-[10px] mb-2">
        <span className="font-mono text-gray-500">
          {item.current.toFixed(2)} <span className="text-gray-300">→</span>{' '}
          <span className="font-semibold text-gray-700">{item.target.toFixed(1)}</span>
        </span>
        <span className="font-semibold" style={{ color: item.priority.color }}>
          Δ {item.gap.toFixed(2)}
        </span>
      </div>

      {/* Regulatory items (Phase 1 BCT gaps) */}
      {item.hasBctGap && (
        <div className="mb-2 rounded bg-orange-50 border border-orange-100 px-2 py-1.5">
          <div className="text-[8px] font-bold uppercase tracking-wide text-orange-600 mb-0.5">
            {c.regulatoryToClose}
          </div>
          {item.bctGaps.slice(0, 3).map(g => (
            <div key={g.id} className="text-[10px] text-orange-800 leading-snug">
              <span className="font-semibold">{g.ref}</span> — {g.q}
            </div>
          ))}
        </div>
      )}

      {/* Recommended actions */}
      <div className="flex flex-col gap-1">
        {usingAi && (
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
              {c.aiTailored}
            </span>
          </div>
        )}
        {actions.map((a, i) => (
          <div key={i} className="flex items-start gap-1.5">
            <span
              className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: item.color }}
            />
            <span className="text-[11px] text-gray-600 leading-snug">{a}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GapAnalysis() {
  const printRef = useRef();
  const lang = useSettingsStore(s => s.language);
  const c = COPY[lang] || COPY.en;
  const getDimScore = useAppStore(s => s.getDimScore);
  const getSubDimScore = useAppStore(s => s.getSubDimScore);
  const getEffectiveScore = useAppStore(s => s.getEffectiveScore);
  const getCriticalGapsCount = useAppStore(s => s.getCriticalGapsCount);
  const getGlobalScore = useAppStore(s => s.getGlobalScore);
  const targetLevel = useAppStore(s => s.targetLevel);
  const profile = useAppStore(s => s.profile);

  const [selectedDim, setSelectedDim] = useState('D1');
  const [aiActions, setAiActions] = useState(null); // { [sd]: string[] }
  const [aiState, setAiState] = useState({ loading: false, error: null });

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `DataPilot - ${profile.bankName || c.bankFallback} - ${c.docTitleSuffix}`,
  });

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

  // Enriched roadmap
  const { phases, summary } = buildRoadmap({ getSubDimScore, getEffectiveScore, targetLevel });
  const targetLvl = MATURITY_LEVELS.find(l => l.level === summary.target) || MATURITY_LEVELS[2];
  const globalScore = getGlobalScore();

  async function generateAiActions() {
    setAiState({ loading: true, error: null });
    const items = phases.flat().map(it => ({
      sd: it.sd,
      dimName: it.dimName,
      sdName: it.sdName,
      current: it.current,
      gap: it.gap,
      weight: it.weight,
      bctGaps: it.bctGaps.map(g => ({ ref: g.ref, q: g.q })),
    }));
    try {
      const res = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankName: profile.bankName, targetLevel: summary.target, items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (lang === 'fr' ? `Échec de la requête (${res.status}).` : `Request failed (${res.status}).`));
      setAiActions(data.actionsBySd || {});
      setAiState({ loading: false, error: null });
    } catch (err) {
      setAiState({ loading: false, error: err.message });
    }
  }

  return (
    <div ref={printRef}>
      <ReportCover
        title={c.coverTitle}
        subtitle={c.coverSubtitle}
        profile={profile}
      />
      <div className="print-content flex flex-col gap-4">
        {/* Export button */}
        <div className="flex flex-col items-end gap-1 no-print">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-ey-yellow text-ey-charcoal font-semibold rounded-lg text-sm hover:bg-yellow-400"
          >
            {c.savePdf}
          </button>
          <span className="text-[11px] text-gray-400">
            {c.savePdfHint}
          </span>
        </div>

        {/* Alert banner */}
        {criticalCount > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
            ⚠ <strong>{c.criticalAlert(criticalCount)}</strong>
            &nbsp;{c.criticalAlertTail}
          </div>
        )}

        {/* Main layout */}
        <div className="flex gap-4 items-start">
          {/* Left: gap table */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="grid text-[10px] font-bold uppercase tracking-wide text-gray-500 bg-gray-50 border-b border-gray-200 px-4 py-2.5"
                style={{ gridTemplateColumns: '56px 64px 1fr 64px 100px' }}>
                <div>{c.thDim}</div><div>{c.thSubDim}</div><div>{c.thSubDimName}</div><div>{c.thScore}</div><div>{c.thPriority}</div>
              </div>
              {rows.map(row => {
                const chip = getPriorityChip(row.score, c);
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
                {c.matrixTitle}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {[
                  { key: 'quickwin', label: c.quickWins, style: 'bg-green-50 border-green-200 text-green-700' },
                  { key: 'major', label: c.majorProjects, style: 'bg-red-50 border-red-200 text-red-700' },
                  { key: 'fillin', label: c.fillIns, style: 'bg-gray-50 border-gray-200 text-gray-500' },
                  { key: 'lowpri', label: c.lowPriority, style: 'bg-gray-50 border-gray-200 text-gray-500' },
                ].map(q => (
                  <div key={q.key} className={`rounded-lg border p-3 text-xs font-semibold text-center ${q.style}`}>
                    {q.label}
                    <div className="text-[10px] font-normal mt-1 opacity-80">
                      {matrix[q.key].length > 0 ? matrix[q.key].join(', ') : '—'}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-gray-400 text-center">{c.effortAxis}</div>
            </div>

            {/* Top recommended actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-1">
                {c.topActionsTitle}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold" style={{ color: DIMENSIONS[selectedDim].color }}>
                  {selectedDim} — {DIMENSIONS[selectedDim].name}
                </span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                  style={{
                    background: getPriorityChip(selScore, c).bg,
                    color: getPriorityChip(selScore, c).color,
                  }}
                >
                  {getPriorityChip(selScore, c).label}
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
        <div className="roadmap-print bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-gray-800">{c.roadmapTitle}</div>
                {summary.totalActions > 0 && (
                  <button
                    onClick={generateAiActions}
                    disabled={aiState.loading}
                    className="no-print text-[11px] font-semibold px-2 py-1 rounded border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-50"
                  >
                    {aiState.loading ? c.generating : aiActions ? c.regenerateAi : c.generateAi}
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {c.roadmapSubtitle}
              </div>
              {aiState.error && (
                <div className="text-[11px] text-red-600 mt-1 no-print">
                  {c.aiUnavailable(aiState.error)}
                </div>
              )}
            </div>
            {/* Summary stats */}
            <div className="flex items-center gap-5">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800 tabular-nums">
                  {globalScore !== null ? globalScore.toFixed(2) : '—'}
                  <span className="text-gray-300 font-normal mx-1">→</span>
                  <span style={{ color: targetLvl.color }}>{summary.target.toFixed(1)}</span>
                </div>
                <div className="text-[9px] uppercase tracking-wide text-gray-400">{c.currentTarget(targetLvl.cmmi)}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold tabular-nums text-red-700">{summary.criticalActions}</div>
                <div className="text-[9px] uppercase tracking-wide text-gray-400">{c.criticalActions}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold tabular-nums text-orange-600">{summary.bctItems}</div>
                <div className="text-[9px] uppercase tracking-wide text-gray-400">{c.bctItems}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold tabular-nums text-gray-800">{summary.totalActions}</div>
                <div className="text-[9px] uppercase tracking-wide text-gray-400">{c.totalActions}</div>
              </div>
            </div>
          </div>

          {summary.totalActions === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">
              {c.allMeet(summary.target.toFixed(1))}
            </div>
          ) : (
            <div className="roadmap-phases grid grid-cols-3 divide-x divide-gray-100">
              {PHASE_META.map((phase, phaseIdx) => {
                const items = phases[phaseIdx];
                const header = (
                  <div className={`px-4 py-3 ${phase.headerClass}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm">{phase.label} · {phase.sub}</div>
                      <div className="text-xs font-bold opacity-90 tabular-nums">{items.length}</div>
                    </div>
                    <div className="text-xs opacity-80 mt-0.5">{phase.desc}</div>
                  </div>
                );
                return (
                  <div key={phase.label} className="roadmap-phase">
                    {/* Header + first card kept together so the header is never orphaned. */}
                    <div className="roadmap-phase-lead">
                      {header}
                      <div className="px-3 pt-3 pb-2 bg-gray-50/50">
                        {items.length === 0 ? (
                          <div className="text-xs text-gray-400 italic py-2 text-center">{c.noActionsPhase}</div>
                        ) : (
                          <RoadmapCard item={items[0]} aiActions={aiActions?.[items[0].sd]} c={c} />
                        )}
                      </div>
                    </div>
                    {items.length > 1 && (
                      <div className="px-3 pb-3 flex flex-col gap-2 bg-gray-50/50">
                        {items.slice(1).map(item => (
                          <RoadmapCard key={item.sd} item={item} aiActions={aiActions?.[item.sd]} c={c} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
