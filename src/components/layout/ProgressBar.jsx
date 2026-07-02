import useAppStore from '../../store/useAppStore';
import useContentStore from '../../store/useContentStore';
import { INDICATORS } from '../../data/indicators';

export default function ProgressBar() {
  const getAnsweredCount = useAppStore(s => s.getAnsweredCount);
  useContentStore(s => s.version); // re-render when the questionnaire is re-hydrated
  const answered = getAnsweredCount();
  const total = INDICATORS.length;
  const pct = total ? Math.round((answered / total) * 100) : 0;

  return (
    <div className="fixed top-[104px] left-0 right-0 z-30 h-0.5 bg-gray-200 no-print">
      <div
        className="h-full bg-ey-yellow transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
