import { useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import { roleLabel } from '../lib/roles';
import AdminQuestionnaire from './admin/AdminQuestionnaire';
import AdminUsers from './admin/AdminUsers';
import AdminSubmissions from './admin/AdminSubmissions';
import AdminDepartments from './admin/AdminDepartments';
import AdminGroupAssessment from './admin/AdminGroupAssessment';

// Each tab is shown only to the roles it is actually useful to (a tab with no
// `roles` is for everyone with admin access). This keeps each role's hub free of
// controls the database wouldn't let them use anyway:
//   • Questionnaire editing is admin/owner only (is_bank_admin), so super-admins
//     don't get a Questionnaire tab they couldn't save in.
//   • Group assessment needs a bank, which EY owners don't have.
//   • Departments (org setup) is a super-admin responsibility.
const TABS = [
  { id: 'submissions', label: 'Submissions' },
  { id: 'group', label: 'Group assessment', roles: ['superadmin', 'admin'] },
  { id: 'questionnaire', label: 'Questionnaire', roles: ['owner', 'admin'] },
  { id: 'departments', label: 'Departments', roles: ['superadmin'] },
  { id: 'users', label: 'Users & roles' },
];

const PANELS = {
  submissions: AdminSubmissions,
  group: AdminGroupAssessment,
  questionnaire: AdminQuestionnaire,
  departments: AdminDepartments,
  users: AdminUsers,
};

// Admin back-office hub. Role-gating is enforced upstream by <RequireAdmin> in
// App.jsx, so reaching this component already implies administrator access
// (admin or super-admin).
export default function Admin() {
  const user = useAuthStore(s => s.user);
  const role = useAuthStore(s => s.role);
  const [tab, setTab] = useState('submissions');
  const tabs = TABS.filter(t => !t.roles || t.roles.includes(role));
  // If the current tab isn't available to this role, fall back to the first one.
  const activeTab = tabs.some(t => t.id === tab) ? tab : (tabs[0]?.id || 'submissions');
  const Panel = PANELS[activeTab] || AdminSubmissions;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-2xl font-semibold text-gray-800">Administration</h1>
        <span className="bg-ey-purple text-white text-[11px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide">
          {roleLabel(role)}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Signed in as <span className="font-medium text-gray-700">{user?.email}</span>.
      </p>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === t.id
                ? 'border-ey-yellow text-ey-charcoal font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Panel />
    </div>
  );
}
