import { Link } from 'react-router-dom';
import Footer from '../../components/Footer';

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Privacy Policy</h1>
        <p className="text-secondary-500 text-sm mb-8">Last updated: June 30, 2026</p>

        <div className="prose prose-secondary max-w-none space-y-6 text-secondary-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">Who we are</h2>
            <p>
              Cybersecurity Compliance Knowledge Hub, LLC ("we," "our," or "us") operates the CyberComplianceHub platform available at cybercompliancehub.com. This policy explains what personal data we collect, how we use it, and your rights. This policy applies to users worldwide, including those in the United States, European Economic Area (EEA), United Kingdom, and other jurisdictions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">What we collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account data:</strong> Email address and password (hashed) when you create an account.</li>
              <li><strong>Usage data:</strong> Chat messages, document generations, and search queries you submit. This data is used to provide the service and may be used to improve AI model performance.</li>
              <li><strong>Profile data:</strong> Display name if you choose to provide one.</li>
              <li><strong>Technical data:</strong> IP address, browser type, and session data collected automatically when you use the platform.</li>
              <li><strong>Payment data:</strong> If you subscribe to a paid plan, payment is processed by Stripe. We do not store your full card number.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">How we use your data</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide and operate the platform.</li>
              <li>To process your requests (chat, search, document generation).</li>
              <li>To send transactional emails (account confirmation, password reset, subscription notices).</li>
              <li>To improve the platform and AI capabilities.</li>
              <li>To comply with legal obligations.</li>
            </ul>
            <p className="mt-3">We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">AI processing</h2>
            <p>
              Chat messages and document generation requests are processed using third-party AI services (Anthropic and/or OpenAI). These providers may process your input under their own privacy policies. We recommend avoiding entering highly sensitive personal information (e.g., SSNs, health data) into chat or document generation inputs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">Data storage and security</h2>
            <p>
              Data is stored using Supabase (hosted on AWS). We implement industry-standard security measures including encryption at rest and in transit, Row Level Security (RLS) on all database tables, and regular security reviews.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">Your rights</h2>
            <p>Depending on your location, you may have the following rights:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data.</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated data.</li>
              <li><strong>Portability:</strong> Request your data in a portable format.</li>
              <li><strong>Objection:</strong> Object to certain processing activities.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email{' '}
              <a href="mailto:privacy@cybercompliancehub.com" className="text-primary-600 hover:underline">privacy@cybercompliancehub.com</a>.
              We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">International Users and GDPR</h2>
            <p>
              CyberComplianceHub is available globally. Regardless of where you are located, we apply privacy protections consistent with GDPR principles as our baseline standard. If you are located in the EEA, UK, or Switzerland, you have enforceable rights under the General Data Protection Regulation or equivalent legislation.
            </p>
            <p className="mt-3">Our legal bases for processing your data are:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Contract performance:</strong> To provide the service you signed up for.</li>
              <li><strong>Legitimate interests:</strong> To improve the platform, prevent fraud, and ensure security.</li>
              <li><strong>Consent:</strong> For marketing communications (you may withdraw at any time).</li>
              <li><strong>Legal obligation:</strong> Where processing is required by applicable law.</li>
            </ul>
            <p className="mt-3">
              EEA/UK users have the right to lodge a complaint with their local supervisory authority (e.g., the ICO in the UK, or your national DPA in the EU). For cross-border data transfers from the EEA to the United States, we rely on Standard Contractual Clauses (SCCs) as approved by the European Commission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">Other Jurisdictions</h2>
            <p>
              If you are located in Canada, Australia, Brazil, Japan, or another jurisdiction with data protection legislation, you have rights similar to those described above. We honor data access, correction, and deletion requests regardless of jurisdiction. Contact us at{' '}
              <a href="mailto:privacy@cybercompliancehub.com" className="text-primary-600 hover:underline">privacy@cybercompliancehub.com</a>{' '}
              to exercise your rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">Cookies</h2>
            <p>
              We use cookies and similar technologies for authentication and session management. See our{' '}
              <Link to="/cookies" className="text-primary-600 hover:underline">Cookie Policy</Link>{' '}
              for details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">Data retention</h2>
            <p>
              We retain account data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where retention is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">Changes to this policy</h2>
            <p>
              We may update this policy. Material changes will be communicated by email or by a notice on the platform at least 14 days before taking effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">Contact</h2>
            <p>
              <a href="mailto:privacy@cybercompliancehub.com" className="text-primary-600 hover:underline">privacy@cybercompliancehub.com</a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
