import { Link } from 'react-router-dom';
import Footer from '../../components/Footer';

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-secondary-100 py-4 px-6">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <svg className="w-6 h-6 text-primary-600" aria-hidden="true" focusable="false" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="font-semibold text-secondary-900">CyberComplianceHub</span>
        </Link>
      </header>
      <main id="main-content" className="flex-1 max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Accessibility Statement</h1>
        <p className="text-secondary-500 text-sm mb-8">Last updated: June 30, 2026</p>

        <div className="prose prose-secondary max-w-none space-y-6 text-secondary-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">Our Commitment</h2>
            <p>
              CyberComplianceHub is committed to ensuring digital accessibility for people with disabilities. We are continuously improving the user experience for everyone and applying relevant accessibility standards.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">Conformance Status</h2>
            <p>
              We aim to conform to the{' '}
              <a href="https://www.w3.org/TR/WCAG21/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                Web Content Accessibility Guidelines (WCAG) 2.1, Level AA<span className="sr-only"> (opens in new tab)</span>
              </a>
              {' '}and{' '}
              <a href="https://www.access-board.gov/ict/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                Section 508 of the Rehabilitation Act<span className="sr-only"> (opens in new tab)</span>
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">Measures Taken</h2>
            <p>We have implemented the following accessibility measures across the platform:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Keyboard navigation:</strong> All interactive elements are reachable and operable via keyboard. A skip-navigation link is available on all pages.</li>
              <li><strong>Screen reader support:</strong> ARIA landmarks, roles, labels, and live regions are used throughout. Decorative images and icons are hidden from assistive technology.</li>
              <li><strong>Color and contrast:</strong> Text meets minimum contrast ratios. Information is not conveyed by color alone.</li>
              <li><strong>Form accessibility:</strong> All form inputs have associated visible or screen-reader-accessible labels.</li>
              <li><strong>Motion:</strong> Animations are suppressed for users who have requested reduced motion via their operating system preferences (<code>prefers-reduced-motion</code>).</li>
              <li><strong>Focus management:</strong> Focus is managed when UI state changes (e.g., modal open, navigation, suggestion selection).</li>
              <li><strong>Semantic HTML:</strong> Headings, lists, tables, and navigation elements use appropriate semantic markup.</li>
              <li><strong>Live regions:</strong> Dynamic content updates (chat messages, loading states, errors) are announced to screen readers via ARIA live regions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">Known Limitations</h2>
            <p>
              While we strive for full conformance, some areas may not yet fully meet WCAG 2.1 AA:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Complex data visualizations (if added in future) may have limited accessible alternatives.</li>
              <li>Third-party components may introduce accessibility issues outside our direct control.</li>
            </ul>
            <p className="mt-3">We are committed to addressing known gaps on an ongoing basis.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">Feedback and Contact</h2>
            <p>
              We welcome your feedback on the accessibility of CyberComplianceHub. If you experience any barriers, please contact us:
            </p>
            <ul className="list-none mt-3 space-y-1">
              <li>Email: <a href="mailto:accessibility@cybercompliancehub.com" className="text-primary-600 hover:underline">accessibility@cybercompliancehub.com</a></li>
            </ul>
            <p className="mt-3">
              We aim to respond to accessibility feedback within 2 business days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">Formal Complaints</h2>
            <p>
              If you are not satisfied with our response, you may contact the U.S. Access Board at{' '}
              <a href="https://www.access-board.gov/contact/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                access-board.gov<span className="sr-only"> (opens in new tab)</span>
              </a>{' '}
              or your local accessibility authority.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
