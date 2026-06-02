import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Profile from './pages/Profile';
import Questionnaire from './pages/Questionnaire';
import Results from './pages/Results';
import GapAnalysis from './pages/GapAnalysis';
import Compliance from './pages/Compliance';
import Topbar from './components/layout/Topbar';
import NavBar from './components/layout/NavBar';
import ProgressBar from './components/layout/ProgressBar';
import useAppStore from './store/useAppStore';

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
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
