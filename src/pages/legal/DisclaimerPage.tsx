import { Link } from 'react-router-dom';
import Footer from '../../components/Footer';

export default function DisclaimerPage() {
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
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Disclaimer</h1>
        <p className="text-secondary-500 text-sm mb-8">Last updated: June 30, 2026</p>

        <div className="prose prose-secondary max-w-none space-y-6 text-secondary-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">Not Legal or Professional Compliance Advice</h2>
            <p>
              CyberComplianceHub, operated by Cybersecurity Compliance Knowledge Hub, LLC, is an information and research tool. Nothing on this platform — including AI-generated responses, document outputs, framework summaries, or any other content — constitutes legal advice, professional compliance advice, or a guarantee of regulatory compliance.
            </p>
            <p className="mt-3">
              Compliance with cybersecurity, AI governance, financial, privacy, or other regulatory frameworks is a complex undertaking that depends on facts specific to your organization, jurisdiction, and circumstances. Always consult a qualified attorney, certified compliance professional, or subject-matter expert before making compliance decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">Content Sources and Aggregation</h2>
            <p>
              CyberComplianceHub aggregates publicly available information from primary sources including U.S. government agencies (NIST, CISA, DoD, GSA), international standards bodies, regulatory authorities, and other public-domain publications. This content is provided to enable comparison, evaluation, research, and knowledge sharing.
            </p>
            <p className="mt-3">
              We do not reproduce, distribute, or derive content from commercially licensed publications (such as ISO standards available for purchase). Where ISO or other commercially licensed frameworks are referenced, we link to official sources so users can obtain authoritative, licensed copies directly.
            </p>
            <p className="mt-3">
              Links to third-party official sources are provided for convenience. CyberComplianceHub does not control the content of those sites and makes no warranties regarding their accuracy, completeness, or availability.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">AI-Generated Content</h2>
            <p>
              This platform uses artificial intelligence to generate responses, documents, and analyses. AI-generated content may contain errors, omissions, or inaccuracies. It may not reflect the most current version of a standard or regulation. All AI-generated outputs should be reviewed by a qualified professional before use in compliance programs, audits, assessments, or any other consequential decision.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">No Warranty</h2>
            <p>
              Content is provided "as is" without warranty of any kind, express or implied, including but not limited to warranties of accuracy, completeness, fitness for a particular purpose, or non-infringement. CyberComplianceHub expressly disclaims all liability for any errors or omissions in the content, or for any actions taken in reliance on it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">Framework Versioning</h2>
            <p>
              Compliance frameworks are updated periodically by their issuing bodies. CyberComplianceHub makes reasonable efforts to maintain current content, but does not guarantee that all ingested framework content reflects the most recent version. Always verify version currency against the official issuing body's publication.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">Questions</h2>
            <p>
              If you have questions about this disclaimer, contact us at{' '}
              <a href="mailto:legal@cybercompliancehub.com" className="text-primary-600 hover:underline">legal@cybercompliancehub.com</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
