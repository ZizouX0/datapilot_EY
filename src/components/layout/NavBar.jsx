import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAppStore from '../../store/useAppStore';
import useAuthStore from '../../store/useAuthStore';
import useAssessmentStore from '../../store/useAssessmentStore';
import useSettingsStore from '../../store/useSettingsStore';
import { INDICATORS } from '../../data/indicators';

const TABS = [
  { key: 'nav.assessment', path: '/assessment', locked: false },
  { key: 'nav.results', path: '/results', locked: true },
  { key: 'nav.gap', path: '/gap-analysis', locked: true },
  { key: 'nav.compliance', path: '/compliance', locked: true },
];

export default function NavBar() {
  const isAssessmentComplete = useAppStore(s => s.isAssessmentComplete());
  const isAdmin = useAuthStore(s => s.isAdmin());
  const t = useSettingsStore(s => s.t);
  const [tooltip, setTooltip] = useState(null);

  // Group (Model B): an analyst whose department owns a dimension on the bank's
  // active draft gets a persistent link to it (they'd otherwise only reach it
  // from the Welcome card). Load the assessment once for analysts.
  const groupAssessment = useAssessmentStore(s => s.assessment);
  const groupAnswers = useAssessmentStore(s => s.answers);
  useAssessmentStore(s => s.assignments); // re-render when assignments load
  const loadActive = useAssessmentStore(s => s.loadActive);
  const myAssignedDims = useAssessmentStore(s => s.myAssignedDims);
  useEffect(() => {
    if (!isAdmin && !groupAssessment) loadActive();
  }, [isAdmin, groupAssessment, loadActive]);

  // Show the group link for BOTH an open draft (to contribute) and a finalized
  // assessment the analyst's department owned (to review the read-only result).
  const groupDims = (!isAdmin && groupAssessment) ? myAssignedDims() : [];
  const hasGroup = groupDims.length > 0;
  const groupDone = hasGroup && INDICATORS.filter(i => groupDims.includes(i.dim)).every(i => {
    const a = groupAnswers[i.id];
    return a && (a.skipped || (a.score !== null && a.score !== undefined));
  });

  // Admins and super-admins don't run assessments — they only get the admin
  // back-office, so they see just the Admin tab. Analysts get the assessment
  // workflow, plus a Group assessment link when their department is assigned.
  const tabs = isAdmin
    ? [{ key: 'nav.admin', path: '/admin', locked: false }]
    : (hasGroup ? [{ key: 'nav.group', path: '/group', locked: false }, ...TABS] : TABS);

  const doneMap = {
    '/group': groupDone,
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
                  {t(tab.key)}
                </button>
                {tooltip === tab.path && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-ey-charcoal text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg pointer-events-none">
                    {t('nav.locked')}
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
              {t(tab.key)}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
