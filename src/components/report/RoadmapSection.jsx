import useAppStore, { MATURITY_LEVELS } from '../../store/useAppStore';
import { buildRoadmap, PHASE_META } from '../../lib/roadmap';
import RoadmapCard from './RoadmapCard';

// Self-contained, print-friendly improvement roadmap. Used to append the phased
// remediation plan to the Results report so one PDF covers diagnosis +
// recommendations. (The Gap Analysis page has its own interactive version with
// AI actions; this one shows the standard recommendations.)
export default function RoadmapSection() {
  const getSubDimScore = useAppStore(s => s.getSubDimScore);
  const getEffectiveScore = useAppStore(s => s.getEffectiveScore);
  const getGlobalScore = useAppStore(s => s.getGlobalScore);
  const targetLevel = useAppStore(s => s.targetLevel);

  const { phases, summary } = buildRoadmap({ getSubDimScore, getEffectiveScore, targetLevel });
  const targetLvl = MATURITY_LEVELS.find(l => l.level === summary.target) || MATURITY_LEVELS[2];
  const globalScore = getGlobalScore();

  return (
    <div className="report-table bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header + summary stats */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-gray-800">Recommended improvement roadmap</div>
          <div className="text-xs text-gray-400 mt-0.5">
            Sequenced by regulatory risk and business impact (weight × gap)
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-800 tabular-nums">
              {globalScore !== null ? globalScore.toFixed(2) : '—'}
              <span className="text-gray-300 font-normal mx-1">→</span>
              <span style={{ color: targetLvl.color }}>{summary.target.toFixed(1)}</span>
            </div>
            <div className="text-[9px] uppercase tracking-wide text-gray-400">Current → Target ({targetLvl.cmmi})</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold tabular-nums text-red-700">{summary.criticalActions}</div>
            <div className="text-[9px] uppercase tracking-wide text-gray-400">Critical actions</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold tabular-nums text-orange-600">{summary.bctItems}</div>
            <div className="text-[9px] uppercase tracking-wide text-gray-400">BCT items</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold tabular-nums text-gray-800">{summary.totalActions}</div>
            <div className="text-[9px] uppercase tracking-wide text-gray-400">Total actions</div>
          </div>
        </div>
      </div>

      {summary.totalActions === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-gray-400">
          All assessed areas already meet the target maturity level of {summary.target.toFixed(1)}.
          No remediation actions required.
        </div>
      ) : (
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          {PHASE_META.map((phase, phaseIdx) => (
            <div key={phase.label}>
              <div className={`px-4 py-3 ${phase.headerClass}`}>
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm">{phase.label} · {phase.sub}</div>
                  <div className="text-xs font-bold opacity-90 tabular-nums">{phases[phaseIdx].length}</div>
                </div>
                <div className="text-xs opacity-80 mt-0.5">{phase.desc}</div>
              </div>
              <div className="p-3 flex flex-col gap-2 bg-gray-50/50 min-h-[80px]">
                {phases[phaseIdx].length === 0 ? (
                  <div className="text-xs text-gray-400 italic py-2 text-center">No actions in this phase</div>
                ) : (
                  phases[phaseIdx].map(item => <RoadmapCard key={item.sd} item={item} />)
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
