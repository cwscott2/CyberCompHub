import { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useInactivityTimeout } from '../hooks/useInactivityTimeout';
import InactivityWarningModal from '../components/InactivityWarningModal';
import Dashboard from '../pages/Dashboard';
import ChatPage from '../pages/ChatPage';
import SearchPage from '../pages/SearchPage';
import WizardPage from '../pages/WizardPage';
import KnowledgeBasePage from '../pages/KnowledgeBasePage';
import AccountPage from '../pages/AccountPage';
import FrameworkCategoryPage from '../pages/app/FrameworkCategoryPage';
import AdminGuard from '../components/AdminGuard';
import AdminNav from '../components/AdminNav';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminOrgsPage from '../pages/admin/AdminOrgsPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';
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
  const { user, displayName, isPlatformAdmin, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { showWarning, staySignedIn } = useInactivityTimeout(signOut);

  const isActive = (to: string) => location.pathname === to;

  return (
    <div className="min-h-screen flex flex-col bg-secondary-50">
      {showWarning && <InactivityWarningModal onStay={staySignedIn} onSignOut={signOut} />}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-primary-600 focus:rounded focus:shadow-md"
      >
        Skip to main content
      </a>

      <header className="bg-white border-b border-secondary-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/app/dashboard" className="flex items-center gap-2 shrink-0">
              <svg className="w-7 h-7 text-primary-600" aria-hidden="true" focusable="false" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-base font-semibold text-secondary-900 hidden sm:block" aria-hidden="true">CyberComplianceHub</span>
            </Link>

            {/* Desktop nav */}
            <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  aria-current={isActive(to) ? 'page' : undefined}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive(to)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Desktop user menu */}
            <div className="hidden md:flex items-center gap-3">
              {isPlatformAdmin && (
                <Link
                  to="/app/admin/users"
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/app/admin')
                      ? 'bg-secondary-200 text-primary-700'
                      : 'text-secondary-500 hover:text-secondary-800 hover:bg-secondary-100'
                  }`}
                >
                  Admin
                </Link>
              )}
              <Link
                to="/app/account"
                className="text-xs text-secondary-500 hover:text-secondary-800 truncate max-w-[180px] transition-colors"
                aria-label="Account settings"
              >
                {displayName ?? user?.email}
              </Link>
              <button
                onClick={signOut}
                className="text-sm text-secondary-600 hover:text-secondary-900 transition-colors"
              >
                Sign out
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="md:hidden p-2 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 transition-colors"
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div id="mobile-nav" className="md:hidden border-t border-secondary-100 bg-white">
            <nav aria-label="Mobile navigation" className="px-4 py-3 space-y-1">
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  aria-current={isActive(to) ? 'page' : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(to)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-secondary-700 hover:bg-secondary-100'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <div className="border-t border-secondary-100 pt-3 mt-3">
                {isPlatformAdmin && (
                  <Link
                    to="/app/admin/users"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-md text-sm text-primary-700 font-medium hover:bg-secondary-100"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/app/account"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm text-secondary-700 hover:bg-secondary-100"
                >
                  Account settings
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); signOut(); }}
                  className="w-full text-left px-3 py-2 rounded-md text-sm text-secondary-700 hover:bg-secondary-100"
                >
                  Sign out
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {isPlatformAdmin && location.pathname.startsWith('/app/admin') && <AdminNav />}

      <main id="main-content" className="flex-1">
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="wizard" element={<WizardPage />} />
          <Route path="knowledge-base" element={<KnowledgeBasePage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="frameworks/:category" element={<FrameworkCategoryPage />} />
          <Route path="admin/users" element={<AdminGuard><AdminUsersPage /></AdminGuard>} />
          <Route path="admin/organizations" element={<AdminGuard><AdminOrgsPage /></AdminGuard>} />
          <Route path="admin/settings" element={<AdminGuard><AdminSettingsPage /></AdminGuard>} />
          <Route path="admin" element={<Navigate to="admin/users" replace />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
