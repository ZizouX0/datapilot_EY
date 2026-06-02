import { MATURITY_LEVELS } from '../../store/useAppStore';

export default function ScoreBadge({ score }) {
  if (score === null || score === undefined) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-500">
        Pending
      </span>
    );
  }
  const lvl = MATURITY_LEVELS[Math.min(score - 1, 4)];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold"
      style={{ background: lvl.bg, color: lvl.color }}
    >
      {score}/5
    </span>
  );
}
