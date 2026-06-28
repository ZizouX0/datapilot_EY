import { MATURITY_LEVELS } from '../../store/useAppStore';
import useSettingsStore from '../../store/useSettingsStore';

const COPY = {
  en: { notAssessed: 'Not yet assessed', level: 'Level' },
  fr: { notAssessed: 'Pas encore évalué', level: 'Niveau' },
};

export default function MaturityBadge({ score }) {
  const lang = useSettingsStore(s => s.language);
  const c = COPY[lang] || COPY.en;
  const lvl = score !== null
    ? (MATURITY_LEVELS.find(l => score >= l.min && score <= l.max) || MATURITY_LEVELS[4])
    : null;

  if (!lvl) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-500">
        {c.notAssessed}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold"
      style={{ background: lvl.bg, color: lvl.color }}
    >
      {c.level} {lvl.level} — {lvl.cmmi}
      <span className="opacity-70 font-normal">/ {lvl.gartner}</span>
    </span>
  );
}
