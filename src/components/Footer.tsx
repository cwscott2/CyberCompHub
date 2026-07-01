import { Link } from 'react-router-dom';

const LEGAL_LINKS = [
  { to: '/terms', label: 'Terms of Service' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/disclaimer', label: 'Disclaimer' },
  { to: '/accessibility', label: 'Accessibility' },
  { to: '/cookies', label: 'Cookie Policy' },
];

const FRAMEWORK_LINKS = [
  { to: '/app/search?category=nist', label: 'NIST Frameworks' },
  { to: '/app/search?category=cmmc', label: 'CMMC' },
  { to: '/app/search?category=fedramp', label: 'FedRAMP' },
  { to: '/app/search?category=iso', label: 'ISO Standards' },
  { to: '/app/search?category=ai-safety', label: 'AI Governance' },
];

const PRODUCT_LINKS = [
  { to: '/app/chat', label: 'AI Assistant' },
  { to: '/app/search', label: 'Document Search' },
  { to: '/app/wizard', label: 'Policy Generator' },
  { to: '/app/knowledge-base', label: 'Knowledge Base' },
  { to: '/pricing', label: 'Pricing' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-secondary-900 text-secondary-300 mt-auto" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-6 h-6 text-primary-400" aria-hidden="true" focusable="false" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-white font-semibold">CyberComplianceHub</span>
            </div>
            <p className="text-sm text-secondary-400 leading-relaxed">
              AI-powered compliance research and document generation across 15+ frameworks.
            </p>
            <p className="text-xs text-secondary-500 mt-3">
              Content is aggregated from publicly available resources for research and evaluation purposes.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">Product</h3>
            <ul className="space-y-2">
              {PRODUCT_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-secondary-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Frameworks */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">Frameworks</h3>
            <ul className="space-y-2">
              {FRAMEWORK_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-secondary-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">Legal</h3>
            <ul className="space-y-2">
              {LEGAL_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-secondary-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-secondary-500">
            &copy; {year} CyberComplianceHub. All rights reserved.
          </p>
          <p className="text-xs text-secondary-500 text-center sm:text-right max-w-md">
            <strong className="text-secondary-400">Not legal advice.</strong>{' '}
            Content is provided for informational and evaluation purposes only.
            Always consult a qualified compliance professional for your specific needs.
          </p>
        </div>
      </div>
    </footer>
  );
}
