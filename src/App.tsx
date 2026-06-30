import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import SearchPage from './pages/SearchPage';
import WizardPage from './pages/WizardPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';

const NAV_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/chat', label: 'Chat' },
  { to: '/search', label: 'Search' },
  { to: '/wizard', label: 'Generate' },
  { to: '/knowledge-base', label: 'Knowledge Base' },
];

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* H9: Skip navigation — keyboard users skip header on every page */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-primary-600 focus:rounded focus:shadow-md"
      >
        Skip to main content
      </a>

      <header className="bg-white border-b border-secondary-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {/* H1: decorative SVG — hidden from screen readers */}
              <svg
                className="w-8 h-8 text-primary-600"
                aria-hidden="true"
                focusable="false"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span className="text-xl font-semibold text-secondary-900" aria-hidden="true">
                CyberComplianceHub
              </span>
            </div>

            {/* H7: Named nav landmark */}
            <nav aria-label="Main navigation" className="flex items-center gap-6">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  aria-current={location.pathname === to ? 'page' : undefined}
                  className="text-secondary-600 hover:text-primary-600 font-medium transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* H9: main landmark with id for skip-nav */}
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/wizard" element={<WizardPage />} />
          <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
