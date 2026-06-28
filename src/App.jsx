import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Topbar from './components/layout/Topbar';
import NavBar from './components/layout/NavBar';
import ProgressBar from './components/layout/ProgressBar';
import useAppStore from './store/useAppStore';
import useAuthStore from './store/useAuthStore';
import useContentStore from './store/useContentStore';

// Route-based code splitting — each page (and its heavy chart deps) loads on demand.
const Login = lazy(() => import('./pages/Login'));
const SetPassword = lazy(() => import('./pages/SetPassword'));
const Landing = lazy(() => import('./pages/Landing'));
const Welcome = lazy(() => import('./pages/Welcome'));
const Questionnaire = lazy(() => import('./pages/Questionnaire'));
const GroupContributor = lazy(() => import('./pages/GroupContributor'));
const Results = lazy(() => import('./pages/Results'));
const GapAnalysis = lazy(() => import('./pages/GapAnalysis'));
const Compliance = lazy(() => import('./pages/Compliance'));
const Admin = lazy(() => import('./pages/Admin'));
const Account = lazy(() => import('./pages/Account'));
const Guide = lazy(() => import('./pages/Guide'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-32 text-gray-400">
      <span className="animate-pulse">Loading…</span>
    </div>
  );
}

// Blocks access until a session is confirmed. While the initial session check
// is in flight we show the loader rather than flashing the login screen.
function RequireAuth({ children }) {
  const loading = useAuthStore(s => s.loading);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated());
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

// Admin-only gate. Analysts (or anyone whose role hasn't resolved to admin)
// are redirected home rather than shown a forbidden page.
function RequireAdmin({ children }) {
  const loading = useAuthStore(s => s.loading);
  const isAdmin = useAuthStore(s => s.isAdmin());

  if (loading) return <PageLoader />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

// Analyst-only gate. Admins and super-admins don't run assessments — they
// administer — so the whole assessment workflow (profile, assessment, results,
// gap, compliance, and the Welcome landing) is hidden from them and they are
// sent straight to the admin area.
function RequireAnalyst({ children }) {
  const loading = useAuthStore(s => s.loading);
  const isAdmin = useAuthStore(s => s.isAdmin());

  if (loading) return <PageLoader />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return children;
}

function RequireComplete({ children }) {
  const isComplete = useAppStore(s => s.isAssessmentComplete());
  if (!isComplete) return <Navigate to="/assessment" replace />;
  return children;
}

// The root route. Anyone NOT signed in (any role, or none) sees the public
// landing page that explains the tool. Signed-in admins go to the admin area;
// signed-in analysts get the assessment Welcome/setup.
function Home() {
  const loading = useAuthStore(s => s.loading);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated());
  const isAdmin = useAuthStore(s => s.isAdmin());

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Landing />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return <Welcome />;
}

function Layout({ children }) {
  const location = useLocation();
  const isAssessment = location.pathname === '/assessment';

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <NavBar />
      {isAssessment && <ProgressBar />}
      <main className="pt-28 px-6 pb-10">
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Public — reachable without an existing session. */}
      <Route path="/login" element={<Login />} />
      {/* Invited users land here from the email link (session set from the URL). */}
      <Route path="/set-password" element={<SetPassword />} />

      {/* Root: public landing when signed out, role-aware home when signed in. */}
      <Route path="/" element={<Home />} />

      {/* Everything below requires authentication. */}
      {/* The assessment workflow is analyst-only; admins are sent to /admin. */}
      <Route path="/assessment" element={<RequireAuth><RequireAnalyst><Layout><Questionnaire /></Layout></RequireAnalyst></RequireAuth>} />
      {/* Group (Model B) contributor view — an analyst filling their department's
          assigned dimensions on the bank's shared assessment. */}
      <Route path="/group" element={<RequireAuth><RequireAnalyst><Layout><GroupContributor /></Layout></RequireAnalyst></RequireAuth>} />
      <Route
        path="/results"
        element={<RequireAuth><RequireAnalyst><Layout><RequireComplete><Results /></RequireComplete></Layout></RequireAnalyst></RequireAuth>}
      />
      <Route
        path="/gap-analysis"
        element={<RequireAuth><RequireAnalyst><Layout><RequireComplete><GapAnalysis /></RequireComplete></Layout></RequireAnalyst></RequireAuth>}
      />
      <Route
        path="/compliance"
        element={<RequireAuth><RequireAnalyst><Layout><RequireComplete><Compliance /></RequireComplete></Layout></RequireAnalyst></RequireAuth>}
      />

      {/* Account settings — available to every authenticated role. */}
      <Route path="/account" element={<RequireAuth><Layout><Account /></Layout></RequireAuth>} />

      {/* Role-aware guide — reachable any time from the top bar. */}
      <Route path="/guide" element={<RequireAuth><Layout><Guide /></Layout></RequireAuth>} />

      {/* Admin-only. */}
      <Route
        path="/admin"
        element={<RequireAuth><RequireAdmin><Layout><Admin /></Layout></RequireAdmin></RequireAuth>}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}

// Holds the app render until both the auth session check and the initial
// questionnaire content load have resolved, so pages never render against a
// half-known session or before remote content has had a chance to load.
function Boot({ children }) {
  const authLoading = useAuthStore(s => s.loading);
  const contentLoading = useContentStore(s => s.loading);
  if (authLoading || contentLoading) return <PageLoader />;
  return children;
}

export default function App() {
  // Wire up the auth session listener and load questionnaire content once for
  // the app's lifetime.
  useEffect(() => {
    const unsubscribe = useAuthStore.getState().init();
    useContentStore.getState().loadContent();
    return unsubscribe;
  }, []);

  return (
    <BrowserRouter>
      <Boot>
        <AppRoutes />
      </Boot>
    </BrowserRouter>
  );
}
