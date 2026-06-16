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
const Welcome = lazy(() => import('./pages/Welcome'));
const Profile = lazy(() => import('./pages/Profile'));
const Questionnaire = lazy(() => import('./pages/Questionnaire'));
const Results = lazy(() => import('./pages/Results'));
const GapAnalysis = lazy(() => import('./pages/GapAnalysis'));
const Compliance = lazy(() => import('./pages/Compliance'));
const Admin = lazy(() => import('./pages/Admin'));

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

function RequireComplete({ children }) {
  const isComplete = useAppStore(s => s.isAssessmentComplete());
  if (!isComplete) return <Navigate to="/assessment" replace />;
  return children;
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

      {/* Everything below requires authentication. */}
      <Route path="/" element={<RequireAuth><Welcome /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><Layout><Profile /></Layout></RequireAuth>} />
      <Route path="/assessment" element={<RequireAuth><Layout><Questionnaire /></Layout></RequireAuth>} />
      <Route
        path="/results"
        element={<RequireAuth><Layout><RequireComplete><Results /></RequireComplete></Layout></RequireAuth>}
      />
      <Route
        path="/gap-analysis"
        element={<RequireAuth><Layout><RequireComplete><GapAnalysis /></RequireComplete></Layout></RequireAuth>}
      />
      <Route
        path="/compliance"
        element={<RequireAuth><Layout><RequireComplete><Compliance /></RequireComplete></Layout></RequireAuth>}
      />

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
