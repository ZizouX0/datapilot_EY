import { useState } from 'react';
import { DIMENSIONS, INDICATORS, SUBDIM_NAMES } from '../data/indicators';
import useAppStore from '../store/useAppStore';

export default function DimensionBars({ showGap = false, targetLevel = 3, expandable = false }) {
  const [expanded, setExpanded] = useState({});
  const getDimScore = useAppStore(s => s.getDimScore);
  const getSubDimScore = useAppStore(s => s.getSubDimScore);

  const dims = Object.keys(DIMENSIONS);

  return (
    <div className="flex flex-col gap-3">
      {dims.map(dim => {
        const d = DIMENSIONS[dim];
        const score = getDimScore(dim);
        const isExpanded = expanded[dim];
        const gap = score !== null ? parseFloat((targetLevel - score).toFixed(2)) : null;

        return (
          <div key={dim}>
            <div
              className={`flex items-center gap-2 ${expandable ? 'cursor-pointer' : ''}`}
              onClick={() => expandable && setExpanded(e => ({ ...e, [dim]: !e[dim] }))}
            >
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: d.color }} />
              <span className="text-xs font-medium text-gray-700 flex-1 min-w-0">
                {d.name}
                <span className="text-gray-400 ml-1">·{Math.round(d.weight * 100)}%</span>
                {d.proxy && (
                  <span className="ml-1 text-[10px] bg-gray-100 text-gray-500 px-1 rounded">Proxy</span>
                )}
              </span>
              {score !== null ? (
                <span className="text-xs font-bold tabular-nums" style={{ color: d.color }}>
                  {score.toFixed(2)}/5
                </span>
              ) : (
                <span className="text-xs text-gray-400">—</span>
              )}
              {showGap && gap !== null && (
                <span className={`text-xs font-semibold tabular-nums w-12 text-right ${gap > 0 ? 'text-orange-500' : 'text-green-600'}`}>
                  {gap > 0 ? `+${gap}` : '✓'}
                </span>
              )}
              {expandable && (
                <span className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
              )}
            </div>

            <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: score !== null ? `${(score / 5) * 100}%` : '0%',
                  background: d.color,
                }}
              />
            </div>

            {expandable && isExpanded && (
              <div className="mt-2 ml-5 flex flex-col gap-2">
                {d.subDims.map(sd => {
                  const sdScore = getSubDimScore(sd);
                  return (
                    <div key={sd}>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-400 w-8">{sd}</span>
                        <span className="text-[10px] text-gray-600 flex-1">{SUBDIM_NAMES[sd]}</span>
                        <span className="text-[10px] font-semibold tabular-nums" style={{ color: d.color }}>
                          {sdScore !== null ? `${sdScore.toFixed(2)}/5` : '—'}
                        </span>
                      </div>
                      <div className="mt-0.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: sdScore !== null ? `${(sdScore / 5) * 100}%` : '0%',
                            background: d.color,
                            opacity: 0.6,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
