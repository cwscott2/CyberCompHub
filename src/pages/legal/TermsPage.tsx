import { Link } from 'react-router-dom';
import Footer from '../../components/Footer';

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Terms of Service</h1>
        <p className="text-secondary-500 text-sm mb-8">Last updated: June 30, 2026</p>

        <div className="prose prose-secondary max-w-none space-y-6 text-secondary-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">1. Agreement</h2>
            <p>
              By accessing or using CyberComplianceHub, a service operated by Cybersecurity Compliance Knowledge Hub, LLC ("we," "our," "us," or "the Company"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. These terms apply to all users including free and paid subscribers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">2. Description of Service</h2>
            <p>
              CyberComplianceHub provides an AI-powered compliance research platform including semantic search across compliance frameworks, an AI chat assistant, document generation tools, and a knowledge base. Content is aggregated from publicly available primary sources.
            </p>
            <p className="mt-3">
              The Service is provided for research, evaluation, and informational purposes only. It does not constitute legal, compliance, or professional advice. See our <Link to="/disclaimer" className="text-primary-600 hover:underline">Disclaimer</Link> for full details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">3. Account Registration</h2>
            <p>
              You must create an account to use most features. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. You must provide accurate information and notify us immediately of any unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Use the Service for any unlawful purpose.</li>
              <li>Attempt to reverse-engineer, scrape, or extract underlying models or data at scale.</li>
              <li>Share account credentials or resell access to the Service.</li>
              <li>Input content that violates third-party rights or contains personally identifiable information of others without authorization.</li>
              <li>Attempt to circumvent usage limits or security controls.</li>
              <li>Use AI-generated outputs to make consequential compliance decisions without professional review.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">5. Subscriptions and Payment</h2>
            <p>
              Paid plans are billed in advance on a monthly or annual basis. All fees are non-refundable except where required by applicable law or at our sole discretion. We reserve the right to change pricing with 30 days' notice. Free tier features and limits may change at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">6. Intellectual Property</h2>
            <p>
              The platform, its codebase, and original content created by CyberComplianceHub are owned by us. Framework content aggregated from public sources remains the property of the respective issuing bodies. Documents you generate using the Service are owned by you, subject to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">7. Disclaimers and Limitation of Liability</h2>
            <p>
              The Service is provided "as is." We make no warranties regarding accuracy, completeness, or fitness for any particular purpose. To the maximum extent permitted by law, our total liability for any claim arising from use of the Service shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">8. Termination</h2>
            <p>
              We may suspend or terminate your account for material breach of these Terms. You may cancel your account at any time. Upon termination, your data will be deleted in accordance with our <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">9. Changes to Terms</h2>
            <p>
              We may update these Terms. Continued use of the Service after notice of changes constitutes acceptance. Material changes will be communicated at least 14 days in advance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">10. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law provisions. For users in the European Union, nothing in these Terms limits your rights under applicable EU law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">11. Contact</h2>
            <p>
              <a href="mailto:legal@cybercompliancehub.com" className="text-primary-600 hover:underline">legal@cybercompliancehub.com</a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
