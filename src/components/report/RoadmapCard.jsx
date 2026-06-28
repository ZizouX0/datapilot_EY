import DimensionPill from '../ui/DimensionPill';
import useSettingsStore from '../../store/useSettingsStore';

const COPY = {
  en: {
    target: (t) => `Target ${t}`,
    bctItems: (n) => `BCT · ${n} item${n > 1 ? 's' : ''}`,
    effort: (level) => `${level} effort`,
    weight: (pct) => `weight ${pct}%`,
    regulatoryItems: 'Regulatory items to close',
    aiTailored: '✦ AI-tailored',
  },
  fr: {
    target: (t) => `Cible ${t}`,
    bctItems: (n) => `BCT · ${n} élément${n > 1 ? 's' : ''}`,
    effort: (level) => `effort ${level}`,
    weight: (pct) => `poids ${pct}%`,
    regulatoryItems: 'Éléments réglementaires à traiter',
    aiTailored: '✦ Adapté par IA',
  },
};

const EFFORT_STYLE = {
  High: { bg: '#FDECEA', color: '#B71C1C' },
  Medium: { bg: '#FFF3E0', color: '#E65100' },
  Low: { bg: '#E8F5E9', color: '#1B5E20' },
};

// Mini current → target progress bar with a target marker.
export function ProgressBar({ current, target, color }) {
  const lang = useSettingsStore(s => s.language);
  const c = COPY[lang] || COPY.en;
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
        title={c.target(target.toFixed(1))}
      />
    </div>
  );
}

// One roadmap action card. `roadmap-card` class lets print CSS keep it whole
// across page boundaries. `aiActions` (optional) overrides the standard actions.
export default function RoadmapCard({ item, aiActions }) {
  const lang = useSettingsStore(s => s.language);
  const c = COPY[lang] || COPY.en;
  const usingAi = Array.isArray(aiActions) && aiActions.length > 0;
  const actions = usingAi ? aiActions : item.actions;
  return (
    <div
      className="roadmap-card rounded-lg border border-gray-200 border-l-4 bg-white p-3"
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
            {c.bctItems(item.bctGaps.length)}
          </span>
        )}
        <span
          className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
          style={{ background: EFFORT_STYLE[item.effort].bg, color: EFFORT_STYLE[item.effort].color }}
        >
          {c.effort(item.effort)}
        </span>
        <span className="text-[9px] font-medium text-gray-400">
          {c.weight(Math.round(item.weight * 100))}
        </span>
      </div>

      {/* Current → target bar */}
      <ProgressBar current={item.current} target={item.target} color={item.color} />
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
            {c.regulatoryItems}
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
