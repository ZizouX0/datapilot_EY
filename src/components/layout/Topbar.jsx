import useAppStore from '../../store/useAppStore';

export default function Topbar() {
  const profile = useAppStore(s => s.profile);
  const fillRandomAnswers = useAppStore(s => s.fillRandomAnswers);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-ey-charcoal flex items-center px-6 gap-4 no-print">
      <div className="flex items-center gap-3">
        <span className="bg-ey-yellow text-ey-charcoal font-bold px-2 py-0.5 rounded text-sm leading-none">
          EY
        </span>
        <span className="text-white font-semibold text-base">DataPilot</span>
        <span className="text-gray-400 text-sm hidden sm:inline">Data Maturity Steering Tool</span>
      </div>
      <div className="ml-auto flex items-center gap-2 text-sm">
        {/* DEV ONLY — quick fill for testing. Hide before release. */}
        <button
          onClick={fillRandomAnswers}
          title="Fill all indicators with random scores (dev/test only)"
          className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1 rounded text-xs font-medium"
        >
          ⚡ Skip evaluation
        </button>
        {profile.respondentName && (
          <span className="text-gray-300">{profile.respondentName}</span>
        )}
        {profile.bankName && (
          <span className="bg-gray-700 text-gray-200 px-3 py-1 rounded text-xs">
            🏦 {profile.bankName}
          </span>
        )}
      </div>
    </header>
  );
}
