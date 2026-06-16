import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import useAppStore from '../../store/useAppStore';
import useAuthStore from '../../store/useAuthStore';

const TABS = [
  { label: 'Bank Profile', path: '/profile', locked: false },
  { label: 'Assessment', path: '/assessment', locked: false },
  { label: 'Results', path: '/results', locked: true },
  { label: 'Gap Analysis', path: '/gap-analysis', locked: true },
  { label: 'Compliance', path: '/compliance', locked: true },
];

export default function NavBar() {
  const profile = useAppStore(s => s.profile);
  const isAssessmentComplete = useAppStore(s => s.isAssessmentComplete());
  const isAdmin = useAuthStore(s => s.isAdmin());
  const [tooltip, setTooltip] = useState(null);

  // The Admin tab is only ever rendered for administrators; analysts never see it.
  const tabs = isAdmin ? [...TABS, { label: 'Admin', path: '/admin', locked: false }] : TABS;

  const profileDone = !!(profile.bankName && profile.respondentName);

  const doneMap = {
    '/profile': profileDone,
    '/assessment': isAssessmentComplete,
    '/results': isAssessmentComplete,
    '/gap-analysis': isAssessmentComplete,
    '/compliance': isAssessmentComplete,
  };

  return (
    <nav className="fixed top-14 left-0 right-0 z-40 bg-white border-b border-gray-200 no-print">
      <div className="flex items-center px-6">
        {tabs.map(tab => {
          const isLocked = tab.locked && !isAssessmentComplete;
          const isDone = doneMap[tab.path];

          if (isLocked) {
            return (
              <div key={tab.path} className="relative">
                <button
                  className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 border-transparent text-gray-300 cursor-not-allowed select-none"
                  onMouseEnter={() => setTooltip(tab.path)}
                  onMouseLeave={() => setTooltip(null)}
                  onClick={() => setTooltip(tab.path)}
                >
                  <svg className="w-3 h-3 opacity-60" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  {tab.label}
                </button>
                {tooltip === tab.path && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-ey-charcoal text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg pointer-events-none">
                    Complete the full assessment to unlock results.
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-ey-charcoal rotate-45" />
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-ey-yellow text-ey-charcoal font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`
              }
            >
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${isDone ? 'bg-green-500' : 'bg-gray-300'}`}
              />
              {tab.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
