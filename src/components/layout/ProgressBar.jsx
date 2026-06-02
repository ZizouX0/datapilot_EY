import useAppStore from '../../store/useAppStore';
import { INDICATORS } from '../../data/indicators';

export default function ProgressBar() {
  const getAnsweredCount = useAppStore(s => s.getAnsweredCount);
  const answered = getAnsweredCount();
  const total = INDICATORS.length;
  const pct = Math.round((answered / total) * 100);

  return (
    <div className="fixed top-[104px] left-0 right-0 z-30 h-0.5 bg-gray-200 no-print">
      <div
        className="h-full bg-ey-yellow transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
