import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import SearchPage from './pages/SearchPage';
import WizardPage from './pages/WizardPage';

function App() {
  return (
    <div className="min-h-screen bg-secondary-50">
      <header className="bg-white border-b border-secondary-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <svg
                className="w-8 h-8 text-primary-600"
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
              <h1 className="text-xl font-semibold text-secondary-900">
                CyberComplianceHub
              </h1>
            </div>
            <nav className="flex items-center gap-6">
              <a
                href="/"
                className="text-secondary-600 hover:text-primary-600 font-medium transition-colors"
              >
                Dashboard
              </a>
              <a
                href="/chat"
                className="text-secondary-600 hover:text-primary-600 font-medium transition-colors"
              >
                Chat
              </a>
              <a
                href="/search"
                className="text-secondary-600 hover:text-primary-600 font-medium transition-colors"
              >
                Search
              </a>
              <a
                href="/wizard"
                className="text-secondary-600 hover:text-primary-600 font-medium transition-colors"
              >
                Generate
              </a>
            </nav>
          </div>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/wizard" element={<WizardPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
