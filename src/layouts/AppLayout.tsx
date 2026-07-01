import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from '../pages/Dashboard';
import ChatPage from '../pages/ChatPage';
import SearchPage from '../pages/SearchPage';
import WizardPage from '../pages/WizardPage';
import KnowledgeBasePage from '../pages/KnowledgeBasePage';
import Footer from '../components/Footer';

const NAV_LINKS = [
  { to: '/app/dashboard', label: 'Dashboard' },
  { to: '/app/chat', label: 'Chat' },
  { to: '/app/search', label: 'Search' },
  { to: '/app/wizard', label: 'Generate' },
  { to: '/app/knowledge-base', label: 'Knowledge Base' },
];

export default function AppLayout() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-secondary-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-primary-600 focus:rounded focus:shadow-md"
      >
        Skip to main content
      </a>

      <header className="bg-white border-b border-secondary-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <svg className="w-7 h-7 text-primary-600" aria-hidden="true" focusable="false" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-lg font-semibold text-secondary-900" aria-hidden="true">CyberComplianceHub</span>
            </Link>

            <nav aria-label="Main navigation" className="hidden md:flex items-center gap-5">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  aria-current={location.pathname === to ? 'page' : undefined}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === to
                      ? 'text-primary-600'
                      : 'text-secondary-600 hover:text-primary-600'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-xs text-secondary-500 truncate max-w-[180px]">
                {user?.email}
              </span>
              <button
                onClick={signOut}
                className="text-sm text-secondary-600 hover:text-secondary-900 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="wizard" element={<WizardPage />} />
          <Route path="knowledge-base" element={<KnowledgeBasePage />} />
          {/* default: redirect to dashboard */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
