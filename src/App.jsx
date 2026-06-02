import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Topbar from './components/layout/Topbar';
import NavBar from './components/layout/NavBar';
import ProgressBar from './components/layout/ProgressBar';
import useAppStore from './store/useAppStore';

// Route-based code splitting — each page (and its heavy chart deps) loads on demand.
const Welcome = lazy(() => import('./pages/Welcome'));
const Profile = lazy(() => import('./pages/Profile'));
const Questionnaire = lazy(() => import('./pages/Questionnaire'));
const Results = lazy(() => import('./pages/Results'));
const GapAnalysis = lazy(() => import('./pages/GapAnalysis'));
const Compliance = lazy(() => import('./pages/Compliance'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-32 text-gray-400">
      <span className="animate-pulse">Loading…</span>
    </div>
  );
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
      <Route path="/" element={<Welcome />} />
      <Route path="/profile" element={<Layout><Profile /></Layout>} />
      <Route path="/assessment" element={<Layout><Questionnaire /></Layout>} />
      <Route
        path="/results"
        element={<Layout><RequireComplete><Results /></RequireComplete></Layout>}
      />
      <Route
        path="/gap-analysis"
        element={<Layout><RequireComplete><GapAnalysis /></RequireComplete></Layout>}
      />
      <Route
        path="/compliance"
        element={<Layout><RequireComplete><Compliance /></RequireComplete></Layout>}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
