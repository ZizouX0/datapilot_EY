import { MATURITY_LEVELS } from '../../store/useAppStore';

export default function MaturityBadge({ score }) {
  const lvl = score !== null
    ? (MATURITY_LEVELS.find(l => score >= l.min && score <= l.max) || MATURITY_LEVELS[4])
    : null;

  if (!lvl) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-500">
        Not yet assessed
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold"
      style={{ background: lvl.bg, color: lvl.color }}
    >
      Level {lvl.level} — {lvl.cmmi}
      <span className="opacity-70 font-normal">/ {lvl.gartner}</span>
    </span>
  );
}
