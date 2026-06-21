import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import useAppStore, { MATURITY_LEVELS } from '../store/useAppStore';
import { DIMENSIONS, INDICATORS } from '../data/indicators';
import RadarChart from '../charts/RadarChart';
import DimensionBars from '../charts/DimensionBars';
import MaturityBadge from '../components/ui/MaturityBadge';
import ScoreBadge from '../components/ui/ScoreBadge';
import ReportCover from '../components/ReportCover';
import RoadmapSection from '../components/report/RoadmapSection';

const INTERP = [
  { range: '1.0–1.79', action: 'Assign data owners and document all processes' },
  { range: '1.80–2.59', action: 'Formalize practices and reduce key-person dependency' },
  { range: '2.60–3.39', action: 'Scale standardized practices and align with BCT' },
  { range: '3.40–4.19', action: 'Optimize with continuous improvement and automated reporting' },
  { range: '4.20–5.0', action: 'Benchmark externally and drive sector-level data innovation' },
];

export default function Results() {
  const printRef = useRef();
  const globalScore = useAppStore(s => s.getGlobalScore());
  const getMaturityLevel = useAppStore(s => s.getMaturityLevel);
  const getPercentage = useAppStore(s => s.getPercentage);
  const getDimScore = useAppStore(s => s.getDimScore);
  const targetLevel = useAppStore(s => s.targetLevel);
  const setTargetLevel = useAppStore(s => s.setTargetLevel);
  const getBCTCompliance = useAppStore(s => s.getBCTCompliance);
  const getBCTIndicators = useAppStore(s => s.getBCTIndicators);
  const getEffectiveScore = useAppStore(s => s.getEffectiveScore);
  const getScoredCount = useAppStore(s => s.getScoredCount);
  const getTotalSkipCount = useAppStore(s => s.getTotalSkipCount);
  const getCriticalGapsCount = useAppStore(s => s.getCriticalGapsCount);
  const getFormulaString = useAppStore(s => s.getFormulaString);
  const answers = useAppStore(s => s.answers);
  const profile = useAppStore(s => s.profile);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `DataPilot - ${profile.bankName || 'Bank'} - Maturity Report`,
  });

  const lvl = getMaturityLevel(globalScore);
  const pct = getPercentage(globalScore);
  const bctData = getBCTCompliance();
  const bctInds = getBCTIndicators();

  const radarData = Object.entries(DIMENSIONS).map(([key, d]) => ({
    name: key === 'D5' ? `${d.name} (proxy)` : d.name,
    current: getDimScore(key) ?? 0,
    target: targetLevel,
  }));

  // Rank scored dimensions to drive the executive summary + strengths/priorities.
  const rankedDims = Object.entries(DIMENSIONS)
    .map(([key, d]) => ({ key, name: d.name, color: d.color, score: getDimScore(key) }))
    .filter(d => d.score !== null)
    .sort((a, b) => b.score - a.score);
  const strengths = rankedDims.slice(0, 2);
  const priorities = [...rankedDims].reverse().slice(0, 2);

  return (
    <div ref={printRef}>
      <ReportCover
        title="Data Maturity Assessment"
        subtitle="Global maturity & dimension scoring"
        profile={profile}
      />
      <div className="print-content">
      {/* Export button */}
      <div className="flex flex-col items-end gap-1 mb-4 no-print">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-ey-yellow text-ey-charcoal font-semibold rounded-lg text-sm hover:bg-yellow-400"
        >
          ⤓ Save as PDF
        </button>
        <span className="text-[11px] text-gray-400">
          Opens your browser's save window — choose "Save as PDF" to download the file.
        </span>
      </div>

      {/* Executive summary — auto-written verdict for a non-technical reader */}
      {globalScore !== null && (
        <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-ey-purple p-5 mb-6">
          <div className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-2">
            Executive Summary
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong>{profile.bankName || 'The bank'}</strong> scores <strong>{pct}%</strong>{' '}
            ({globalScore.toFixed(2)} / 5), placing it at maturity{' '}
            <strong>Level {lvl.level} — {lvl.cmmi}</strong> ({lvl.gartner}).
            {strengths[0] && (
              <> Its strongest area is <strong>{strengths[0].name}</strong> ({strengths[0].score.toFixed(2)}/5).</>
            )}
            {priorities[0] && (
              <> The largest gap is <strong>{priorities[0].name}</strong> ({priorities[0].score.toFixed(2)}/5),
              which should be prioritised.</>
            )}
            {' '}BCT regulatory exposure is <strong>{bctData.exposure}</strong>, with {bctData.compliant} of{' '}
            {bctData.total} mandatory indicators compliant.
          </p>
        </div>
      )}

      {/* Strengths & priority focus areas */}
      {rankedDims.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { title: 'Top Strengths', items: strengths, accent: '#1B5E20', label: 'strongest' },
            { title: 'Priority Focus Areas', items: priorities, accent: '#B71C1C', label: 'biggest gaps' },
          ].map(col => (
            <div key={col.title} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="text-[9px] font-bold tracking-widest uppercase mb-3" style={{ color: col.accent }}>
                {col.title}
              </div>
              <div className="flex flex-col gap-3">
                {col.items.map(d => (
                  <div key={d.key} className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-sm text-gray-700 flex-1">{d.name}</span>
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(d.score / 5) * 100}%`, background: d.color }} />
                    </div>
                    <span className="text-sm font-bold tabular-nums w-10 text-right" style={{ color: d.color }}>
                      {d.score.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top 3 cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Card 1: Global score */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-3">
            Global Maturity Index
          </div>
          {globalScore !== null ? (
            <>
              <div className="text-5xl font-bold tabular-nums" style={{ color: lvl.color }}>
                {pct}%
              </div>
              <div className="text-sm text-gray-500 mt-1">{globalScore.toFixed(2)} / 5</div>
              <div className="mt-3">
                <MaturityBadge score={globalScore} />
              </div>
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: lvl.color }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-2">BCT Circulaire N°2025-08</div>
            </>
          ) : (
            <div className="text-gray-400 text-sm">No indicators answered yet</div>
          )}
        </div>

        {/* Card 2: Radar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-2">
            Dimension Radar
          </div>
          <RadarChart data={radarData} />
        </div>

        {/* Card 3: Dimension bars */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-3">
            Dimension Scores
          </div>
          <DimensionBars showGap targetLevel={targetLevel} expandable />
          <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] font-mono text-gray-400 leading-relaxed">
            {getFormulaString() || 'Formula will appear once indicators are answered'}
          </div>
        </div>
      </div>

      {/* Target level selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="text-xs font-semibold text-gray-600 mb-3">Set target maturity level</div>
        <div className="flex gap-2">
          {MATURITY_LEVELS.map(l => (
            <button
              key={l.level}
              onClick={() => setTargetLevel(l.level)}
              className={`flex-1 py-2 px-3 rounded-lg border-2 text-xs font-semibold transition-all ${
                targetLevel === l.level
                  ? 'border-ey-yellow bg-ey-yellow text-ey-charcoal'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
              }`}
            >
              <div className="font-bold">{l.level}</div>
              <div className="font-normal text-[10px] mt-0.5">{l.cmmi}</div>
            </button>
          ))}
        </div>
      </div>

      {/* KPI mini cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          {
            num: `${getScoredCount()} / ${INDICATORS.length}`,
            label: 'Indicators scored',
            sub: `${Math.round((getScoredCount() / INDICATORS.length) * 100)}% coverage`,
            color: '#3D108A',
          },
          {
            num: `${getTotalSkipCount()} / ${INDICATORS.length}`,
            label: 'Indicators skipped',
            sub: 'Excluded from scoring',
            color: '#188CE5',
          },
          {
            num: `${bctData.compliant} / ${bctData.total}`,
            label: 'BCT compliant',
            sub: `Regulatory exposure: ${bctData.exposure}`,
            color: bctData.rate >= 80 ? '#1B5E20' : bctData.rate >= 50 ? '#E65100' : '#B71C1C',
          },
          {
            num: getCriticalGapsCount(),
            label: 'Critical gaps',
            sub: 'Dimensions below 2.0/5',
            color: '#B71C1C',
          },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold tabular-nums" style={{ color: kpi.color }}>
              {kpi.num}
            </div>
            <div className="text-xs font-semibold text-gray-700 mt-1">{kpi.label}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Maturity interpretation grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-3">
          Score Interpretation Grid
        </div>
        <div className="grid grid-cols-5 gap-3">
          {MATURITY_LEVELS.map((l, i) => {
            const isCurrent = lvl.level === l.level;
            return (
              <div
                key={l.level}
                className={`rounded-xl p-4 border-2 relative overflow-hidden ${
                  isCurrent ? 'border-ey-yellow bg-yellow-50' : 'border-gray-100'
                }`}
                style={{ borderTopColor: l.color, borderTopWidth: 3 }}
              >
                {isCurrent && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-ey-yellow rounded-full flex items-center justify-center text-ey-charcoal text-xs font-bold">
                    ✓
                  </div>
                )}
                <div className="text-[10px] text-gray-400 tabular-nums mb-1">{INTERP[i].range}</div>
                <div className="text-base font-bold" style={{ color: l.color }}>{l.cmmi}</div>
                <div className="text-[10px] italic text-gray-500 mb-2">{l.gartner}</div>
                <div className="text-[10px] text-gray-600 leading-snug">{INTERP[i].action}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BCT compliance panel */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-1">
          BCT Regulatory Compliance Status
        </div>
        <p className="text-sm text-gray-700 mb-3">
          {bctData.compliant} of {bctData.total} BCT indicators compliant.{' '}
          <span className={`font-semibold ${
            bctData.exposure === 'Low' ? 'text-green-700' :
            bctData.exposure === 'Medium' ? 'text-orange-600' : 'text-red-700'
          }`}>
            Regulatory exposure: {bctData.exposure}
          </span>
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-[10px] uppercase tracking-wide">
                <th className="text-left py-2 pr-4 font-semibold">Indicator</th>
                <th className="text-left py-2 pr-4 font-semibold">Score</th>
                <th className="text-left py-2 pr-4 font-semibold">Status</th>
                <th className="text-left py-2 font-semibold">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {bctInds.map(ind => {
                const eff = getEffectiveScore(ind.id);
                const ans = answers[ind.id] || {};
                const compliant = eff !== null && eff >= 3;
                const pending = eff === null;
                return (
                  <tr
                    key={ind.id}
                    className={`border-b border-gray-50 ${!compliant && !pending ? 'bg-red-50' : ''}`}
                  >
                    <td className="py-2 pr-4 text-gray-700 leading-snug">
                      <span className="font-mono text-gray-400 mr-1">{ind.id}</span>
                      {ind.q.length > 55 ? ind.q.slice(0, 55) + '…' : ind.q}
                    </td>
                    <td className="py-2 pr-4">
                      <ScoreBadge score={eff} />
                    </td>
                    <td className="py-2 pr-4">
                      {pending ? (
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-semibold">Pending</span>
                      ) : compliant ? (
                        <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-semibold">Compliant</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-semibold">Non-compliant</span>
                      )}
                    </td>
                    <td className="py-2 text-gray-500 italic">
                      {ans.evidence ? ans.evidence.slice(0, 60) : 'No evidence provided'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Improvement roadmap — appended so one PDF covers diagnosis + plan */}
      <div className="mt-6">
        <div className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-3">
          Improvement Roadmap
        </div>
        <RoadmapSection />
      </div>

      {/* Methodology & references appendix */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mt-6 text-xs text-gray-600 leading-relaxed">
        <div className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-3">
          Methodology &amp; References
        </div>
        <ul className="flex flex-col gap-1.5 list-disc pl-4">
          <li>Maturity is scored 1–5 on a CMMI-aligned scale; the global index is a weighted average of the five dimensions.</li>
          <li>A score of 3 or above requires documented evidence; without it the score is capped at 2/5.</li>
          <li>Up to 20% of indicators per dimension may be skipped; BCT-flagged indicators are mandatory and cannot be skipped.</li>
          <li>Dimension 5 (Skills &amp; Culture) is assessed through objective proxy signals rather than direct self-declaration.</li>
          <li>Regulatory references: BCT Circulaire N°2025-08 and BCBS 239 (risk data aggregation &amp; reporting).</li>
        </ul>
      </div>
      </div>
    </div>
  );
}
