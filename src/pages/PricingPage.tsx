import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Enough to evaluate every feature before committing.',
    cta: 'Start free',
    ctaTo: '/signup',
    highlighted: false,
    features: [
      { text: '10 AI chat messages per day', included: true },
      { text: '3 document generations per month', included: true },
      { text: 'Full semantic document search', included: true },
      { text: 'Knowledge Base access', included: true },
      { text: 'All 15+ frameworks', included: true },
      { text: 'Document export (MD, DOCX, XLSX)', included: false },
      { text: 'Document history', included: false },
      { text: 'Team workspace', included: false },
    ],
  },
  {
    name: 'Pro',
    price: '$39',
    period: '/month',
    annual: '$390/year (save $78)',
    description: 'For practitioners who need unlimited research and generation.',
    cta: 'Start 14-day free trial',
    ctaTo: '/signup?plan=pro',
    highlighted: true,
    features: [
      { text: 'Unlimited AI chat messages', included: true },
      { text: 'Unlimited document generations', included: true },
      { text: 'Full semantic document search', included: true },
      { text: 'Knowledge Base access', included: true },
      { text: 'All 15+ frameworks + new as added', included: true },
      { text: 'All export formats (MD, DOCX, XLSX)', included: true },
      { text: 'Document history', included: true },
      { text: 'Priority email support', included: true },
    ],
  },
  {
    name: 'Team',
    price: '$149',
    period: '/month',
    annual: '$1,490/year (save $298)',
    description: 'For teams that need shared workspaces and member management.',
    cta: 'Start 14-day free trial',
    ctaTo: '/signup?plan=team',
    highlighted: false,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: '5 seats included', included: true },
      { text: '$29/month per additional seat', included: true },
      { text: 'Shared document library', included: true },
      { text: 'Team member management', included: true },
      { text: 'Usage dashboard', included: true },
      { text: 'Centralized billing', included: true },
      { text: 'Team onboarding support', included: true },
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For organizations with advanced security and compliance requirements.',
    cta: 'Contact us',
    ctaTo: 'mailto:sales@cybercompliancehub.com',
    highlighted: false,
    isExternal: true,
    features: [
      { text: 'Everything in Team', included: true },
      { text: 'SSO / bring your own IdP', included: true },
      { text: 'Audit log', included: true },
      { text: 'Custom framework coverage', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'SLA guarantee', included: true },
      { text: 'Volume seat pricing', included: true },
      { text: 'Security review / BAA on request', included: true },
    ],
  },
];

const FAQ = [
  {
    q: 'What counts as a "document generation"?',
    a: 'Each time you use the Policy Generator to produce a compliance artifact (policy, procedure, checklist, POA&M, gap assessment) counts as one generation. Exporting an already-generated document does not count.',
  },
  {
    q: 'Can I change plans at any time?',
    a: 'Yes. Upgrades take effect immediately. Downgrades take effect at the end of your current billing period.',
  },
  {
    q: 'Is there a contract for paid plans?',
    a: 'No. All plans are month-to-month. Annual billing is available at a discount if you prefer predictable costs.',
  },
  {
    q: 'What happens when I hit the free tier limits?',
    a: 'Chat and generation are paused until the next day/month reset. Search and Knowledge Base remain fully available on the free tier.',
  },
  {
    q: 'Do you offer discounts for nonprofits or educational institutions?',
    a: 'Yes. Contact us at sales@cybercompliancehub.com with your organization details.',
  },
  {
    q: 'What AI models power the platform?',
    a: 'The platform uses Anthropic Claude and OpenAI models for generation and embeddings. No personally identifiable information from your inputs is used to train third-party models under our data processing agreements.',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <svg className="w-7 h-7 text-primary-600" aria-hidden="true" focusable="false" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-lg font-semibold text-secondary-900">CyberComplianceHub</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-secondary-600 hover:text-secondary-900">Sign in</Link>
            <Link to="/signup" className="btn-primary text-sm">Get started free</Link>
          </div>
        </div>
      </header>

      <main id="main-content">
        {/* Hero */}
        <section className="py-16 px-4 text-center bg-secondary-50">
          <h1 className="text-4xl font-bold text-secondary-900 mb-3">Simple, transparent pricing</h1>
          <p className="text-secondary-600 max-w-xl mx-auto mb-2">
            Start free. No credit card required. Upgrade when you need more.
          </p>
          <p className="text-sm text-secondary-500">All paid plans include a 14-day free trial.</p>
        </section>

        {/* Plans */}
        <section className="py-12 px-4" aria-label="Pricing plans">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border flex flex-col ${
                  plan.highlighted
                    ? 'border-primary-500 bg-primary-600 shadow-lg shadow-primary-100'
                    : 'border-secondary-200 bg-white'
                }`}
              >
                <div className="p-6 flex-1">
                  <h2 className={`font-bold text-lg mb-1 ${plan.highlighted ? 'text-white' : 'text-secondary-900'}`}>
                    {plan.name}
                  </h2>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={`text-3xl font-bold ${plan.highlighted ? 'text-white' : 'text-secondary-900'}`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className={`text-sm ${plan.highlighted ? 'text-primary-200' : 'text-secondary-500'}`}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                  {plan.annual && (
                    <p className={`text-xs mb-2 ${plan.highlighted ? 'text-primary-200' : 'text-secondary-500'}`}>
                      {plan.annual}
                    </p>
                  )}
                  <p className={`text-sm mb-5 ${plan.highlighted ? 'text-primary-100' : 'text-secondary-600'}`}>
                    {plan.description}
                  </p>
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f.text} className="flex items-start gap-2 text-sm">
                        {f.included ? (
                          <svg className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlighted ? 'text-primary-200' : 'text-accent-500'}`} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 mt-0.5 shrink-0 text-secondary-300" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span className={
                          plan.highlighted
                            ? f.included ? 'text-primary-100' : 'text-primary-300'
                            : f.included ? 'text-secondary-700' : 'text-secondary-400'
                        }>
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6 pt-0">
                  {plan.isExternal ? (
                    <a
                      href={plan.ctaTo}
                      className={`block text-center py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                        plan.highlighted ? 'bg-white text-primary-600 hover:bg-primary-50' : 'btn-primary'
                      }`}
                    >
                      {plan.cta}
                    </a>
                  ) : (
                    <Link
                      to={plan.ctaTo}
                      className={`block text-center py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                        plan.highlighted ? 'bg-white text-primary-600 hover:bg-primary-50' : 'btn-primary'
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison callout */}
        <section className="py-8 px-4 bg-secondary-50">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-secondary-700 text-sm">
              <strong>How we compare:</strong> Vanta and Drata are compliance <em>management</em> platforms (evidence collection, audit prep) starting at $10k+/year.
              CyberComplianceHub is the compliance <em>knowledge and generation</em> layer — the research tool your team uses daily, whether or not you have a GRC platform.
              Many teams use both.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-secondary-900 mb-8 text-center">Frequently asked questions</h2>
            <dl className="space-y-6">
              {FAQ.map(({ q, a }) => (
                <div key={q} className="border-b border-secondary-100 pb-6 last:border-0">
                  <dt className="font-semibold text-secondary-900 mb-2">{q}</dt>
                  <dd className="text-secondary-600 text-sm leading-relaxed">{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 bg-primary-600 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to start?</h2>
          <p className="text-primary-100 mb-6 text-sm">Free tier available. No credit card needed.</p>
          <Link to="/signup" className="inline-block bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-primary-50 transition-colors">
            Create free account
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
