import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthGuard from './components/AuthGuard';
import AppLayout from './layouts/AppLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DisclaimerPage from './pages/legal/DisclaimerPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import TermsPage from './pages/legal/TermsPage';
import AccessibilityPage from './pages/legal/AccessibilityPage';
import CookiePage from './pages/legal/CookiePage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Legal */}
        <Route path="/disclaimer" element={<DisclaimerPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/accessibility" element={<AccessibilityPage />} />
        <Route path="/cookies" element={<CookiePage />} />

        {/* Authenticated app — all /app/* routes */}
        <Route
          path="/app/*"
          element={
            <AuthGuard>
              <AppLayout />
            </AuthGuard>
          }
        />

        {/* Legacy redirects — old routes now live under /app/ */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/chat" element={<Navigate to="/app/chat" replace />} />
        <Route path="/search" element={<Navigate to="/app/search" replace />} />
        <Route path="/wizard" element={<Navigate to="/app/wizard" replace />} />
        <Route path="/knowledge-base" element={<Navigate to="/app/knowledge-base" replace />} />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
