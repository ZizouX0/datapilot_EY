import useAuthStore from '../store/useAuthStore';

// Admin-only landing area. Phase 1 only proves that role-gating works
// end-to-end (this page is unreachable for analysts). The actual admin
// tools — editing questions / rubrics / weights and managing users & roles —
// are built in Phase 2.
export default function Admin() {
  const user = useAuthStore(s => s.user);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-semibold text-gray-800">Administration</h1>
        <span className="bg-ey-purple text-white text-[11px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide">
          Admin
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-8">
        Signed in as <span className="font-medium text-gray-700">{user?.email}</span>.
        You have administrator privileges.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="text-sm font-semibold text-gray-800 mb-1">
            Questions, rubrics &amp; weights
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Edit the assessment indicators, scoring rubrics and dimension weights.
          </p>
          <span className="inline-block mt-3 text-[11px] font-semibold text-ey-purple uppercase tracking-wide">
            Coming in Phase 2
          </span>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="text-sm font-semibold text-gray-800 mb-1">Users &amp; roles</div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Invite assessors and assign the admin or analyst role.
          </p>
          <span className="inline-block mt-3 text-[11px] font-semibold text-ey-purple uppercase tracking-wide">
            Coming in Phase 2
          </span>
        </div>
      </div>
    </div>
  );
}
