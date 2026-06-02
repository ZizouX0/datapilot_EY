import { DIMENSIONS } from '../../data/indicators';

export default function DimensionPill({ dim, showWeight = false }) {
  const d = DIMENSIONS[dim];
  if (!d) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white"
      style={{ background: d.color }}
    >
      {dim} {showWeight && <span className="opacity-80">·{Math.round(d.weight * 100)}%</span>}
    </span>
  );
}
