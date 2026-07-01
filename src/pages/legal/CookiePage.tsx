import { Link } from 'react-router-dom';
import Footer from '../../components/Footer';

export default function CookiePage() {
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
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Cookie Policy</h1>
        <p className="text-secondary-500 text-sm mb-8">Last updated: June 30, 2026</p>

        <div className="prose prose-secondary max-w-none space-y-6 text-secondary-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">What are cookies?</h2>
            <p>
              Cookies are small text files placed on your device by a website. They are widely used to make websites work, or work more efficiently, and to provide information to the site owner.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">Cookies we use</h2>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-xs border-collapse">
                <caption className="sr-only">Cookie details</caption>
                <thead>
                  <tr className="bg-secondary-50">
                    <th scope="col" className="border border-secondary-200 px-3 py-2 text-left font-semibold text-secondary-700">Name</th>
                    <th scope="col" className="border border-secondary-200 px-3 py-2 text-left font-semibold text-secondary-700">Purpose</th>
                    <th scope="col" className="border border-secondary-200 px-3 py-2 text-left font-semibold text-secondary-700">Type</th>
                    <th scope="col" className="border border-secondary-200 px-3 py-2 text-left font-semibold text-secondary-700">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-secondary-200 px-3 py-2 font-mono">sb-*</td>
                    <td className="border border-secondary-200 px-3 py-2">Authentication session management (Supabase)</td>
                    <td className="border border-secondary-200 px-3 py-2">Essential</td>
                    <td className="border border-secondary-200 px-3 py-2">Session / 1 week</td>
                  </tr>
                  <tr className="bg-secondary-50">
                    <td className="border border-secondary-200 px-3 py-2 font-mono">__stripe_*</td>
                    <td className="border border-secondary-200 px-3 py-2">Payment processing fraud prevention (Stripe)</td>
                    <td className="border border-secondary-200 px-3 py-2">Essential</td>
                    <td className="border border-secondary-200 px-3 py-2">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              We currently use only essential cookies required for the platform to function. We do not use advertising or tracking cookies. If we add analytics cookies in the future, this policy will be updated and you will be asked for consent where required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">Managing cookies</h2>
            <p>
              You can control and delete cookies through your browser settings. Deleting or disabling essential cookies (particularly authentication cookies) will prevent you from using the platform. For more information, visit{' '}
              <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                aboutcookies.org<span className="sr-only"> (opens in new tab)</span>
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-secondary-900 mb-3">Contact</h2>
            <p>
              Questions about our use of cookies:{' '}
              <a href="mailto:privacy@cybercompliancehub.com" className="text-primary-600 hover:underline">privacy@cybercompliancehub.com</a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
