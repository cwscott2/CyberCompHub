import { Link, useLocation } from 'react-router-dom';

const ADMIN_LINKS = [
  { to: '/app/admin/users', label: 'Users' },
  { to: '/app/admin/organizations', label: 'Organizations' },
  { to: '/app/admin/settings', label: 'Settings' },
];

export default function AdminNav() {
  const location = useLocation();

  return (
    <div className="bg-red-50 border-b border-red-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1 py-2" aria-label="Admin navigation">
          <span className="text-xs font-semibold text-red-500 uppercase tracking-wider mr-3">Admin</span>
          {ADMIN_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                location.pathname === to
                  ? 'bg-red-100 text-red-700'
                  : 'text-red-500 hover:text-red-700 hover:bg-red-100'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
