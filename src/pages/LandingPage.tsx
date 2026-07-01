import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const FRAMEWORKS = [
  { name: 'NIST CSF 2.0', category: 'Cybersecurity', color: 'bg-blue-100 text-blue-700' },
  { name: 'SP 800-53 Rev 5', category: 'Cybersecurity', color: 'bg-blue-100 text-blue-700' },
  { name: 'CMMC 2.0', category: 'Defense', color: 'bg-indigo-100 text-indigo-700' },
  { name: 'FedRAMP Moderate', category: 'Federal', color: 'bg-indigo-100 text-indigo-700' },
  { name: 'ISO 27001', category: 'International', color: 'bg-purple-100 text-purple-700' },
  { name: 'SOC 2 Type II', category: 'Financial', color: 'bg-amber-100 text-amber-700' },
  { name: 'NIST AI RMF', category: 'AI Governance', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'EU AI Act', category: 'AI Governance', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'MITRE ATLAS', category: 'AI Security', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'ISO 42001', category: 'AI Governance', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'GDPR', category: 'Privacy', color: 'bg-rose-100 text-rose-700' },
  { name: 'PCI DSS v4', category: 'Financial', color: 'bg-amber-100 text-amber-700' },
];

const FEATURES = [
  {
    icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
    title: 'AI Compliance Assistant',
    description: 'Ask plain-language questions across 15+ frameworks and get sourced, cited answers in seconds — not hours of manual research.',
  },
  {
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    title: 'Semantic Document Search',
    description: 'Find the exact control, requirement, or guideline you need across every ingested framework, ranked by relevance.',
  },
  {
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    title: 'Policy & Document Generator',
    description: 'Generate policies, procedures, checklists, POA&Ms, and gap assessments grounded in actual framework content — not templates guessing at requirements.',
  },
  {
    icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582 4 8 4s8 1.79 8 4',
    title: 'Knowledge Base Audit',
    description: 'Inspect exactly what content has been ingested per framework. Know before you trust a citation what source material backs it up.',
  },
  {
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    title: 'Cross-Framework Coverage',
    description: 'Work across cybersecurity, AI governance, financial, and privacy frameworks in one place — useful whether you\'re a solo practitioner or a multi-framework compliance team.',
  },
  {
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    title: 'Export-Ready Outputs',
    description: 'Export generated documents as Markdown, DOCX, or XLSX — ready for your documentation system, GRC tool, or client deliverable.',
  },
];

const PRICING = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Enough to evaluate every feature before committing.',
    cta: 'Start free',
    ctaTo: '/signup',
    highlighted: false,
    features: [
      '10 AI chat messages per day',
      '3 document generations per month',
      'Full semantic search',
      'Knowledge Base access',
      'All frameworks',
    ],
    limits: ['No document export', 'No document history'],
  },
  {
    name: 'Pro',
    price: '$39',
    period: '/month',
    description: 'For practitioners who need unlimited research and generation.',
    cta: 'Start Pro trial',
    ctaTo: '/signup?plan=pro',
    highlighted: true,
    features: [
      'Unlimited AI chat',
      'Unlimited document generation',
      'All export formats (MD, DOCX, XLSX)',
      'Document history',
      'All frameworks + new ones as added',
      'Priority support',
    ],
    limits: [],
  },
  {
    name: 'Team',
    price: '$149',
    period: '/month',
    description: 'For teams that need shared workspaces and member management.',
    cta: 'Start Team trial',
    ctaTo: '/signup?plan=team',
    highlighted: false,
    features: [
      'Everything in Pro',
      '5 seats included ($29/additional)',
      'Shared document library',
      'Team member management',
      'Usage dashboard',
    ],
    limits: [],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-secondary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-7 h-7 text-primary-600" aria-hidden="true" focusable="false" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-lg font-semibold text-secondary-900">CyberComplianceHub</span>
          </div>
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-secondary-600 hover:text-secondary-900 transition-colors">Features</a>
            <a href="#frameworks" className="text-sm text-secondary-600 hover:text-secondary-900 transition-colors">Frameworks</a>
            <a href="#pricing" className="text-sm text-secondary-600 hover:text-secondary-900 transition-colors">Pricing</a>
            <Link to="/login" className="text-sm text-secondary-600 hover:text-secondary-900 transition-colors">Sign in</Link>
            <Link to="/signup" className="btn-primary text-sm">Get started free</Link>
          </nav>
          <div className="flex md:hidden items-center gap-3">
            <Link to="/login" className="text-sm text-secondary-600">Sign in</Link>
            <Link to="/signup" className="btn-primary text-sm">Get started</Link>
          </div>
        </div>
      </header>

      <main id="main-content">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary-50 to-white pt-20 pb-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-full text-xs text-primary-700 font-medium mb-6">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" aria-hidden="true" />
              15+ frameworks · AI-powered · Built on primary sources
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-900 leading-tight mb-6">
              The Compliance Research Platform Built for{' '}
              <span className="text-primary-600">Cybersecurity and AI Governance</span>
            </h1>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto mb-4 leading-relaxed">
              Ask expert questions. Search primary sources. Generate ready-to-use governance artifacts — policies, procedures, gap assessments, POA&Ms, and checklists — grounded in NIST, CMMC, FedRAMP, ISO, EU AI Act, and 10+ more frameworks.
            </p>
            {/* Secondary tagline */}
            <p className="text-base font-semibold text-secondary-800 mb-8 tracking-wide">
              Cybersecurity &amp; AI Knowledge In.{' '}
              <span className="text-primary-600">Compliance Artifacts Out.</span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="btn-primary text-base px-8 py-3 w-full sm:w-auto text-center">
                Start for free — no credit card
              </Link>
              <Link to="/login" className="btn-secondary text-base px-8 py-3 w-full sm:w-auto text-center">
                Sign in
              </Link>
            </div>
            <p className="mt-4 text-sm text-secondary-500">
              Free tier includes 10 AI chat messages/day and 3 document generations/month.
            </p>
          </div>
        </section>

        {/* Framework badges */}
        <section id="frameworks" className="py-16 px-4 bg-white border-y border-secondary-100">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-center text-2xl font-bold text-secondary-900 mb-2">
              Coverage across every major framework
            </h2>
            <p className="text-center text-secondary-600 mb-8 max-w-xl mx-auto text-sm">
              Content is aggregated from publicly available primary sources — NIST, CISA, DoD, EU Commission, and more — so you can compare, evaluate, and build on authoritative material.{' '}
              <Link to="/disclaimer" className="text-primary-600 hover:underline">See our content disclaimer</Link>.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {FRAMEWORKS.map((fw) => (
                <span
                  key={fw.name}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${fw.color}`}
                >
                  {fw.name}
                  <span className="text-xs opacity-60">· {fw.category}</span>
                </span>
              ))}
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-secondary-100 text-secondary-600">
                + more being added
              </span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 px-4 bg-secondary-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-secondary-900 mb-3">Everything in one place</h2>
              <p className="text-secondary-600 max-w-xl mx-auto">
                Stop context-switching between PDFs, browser tabs, and GRC tools. CyberComplianceHub is the research layer your compliance workflow is missing.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="bg-white rounded-xl border border-secondary-200 p-6 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-primary-600" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-secondary-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-secondary-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-secondary-900 mb-10">Built for people who live in compliance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {[
                {
                  role: 'Compliance Consultants',
                  desc: 'Research across multiple client frameworks in minutes. Generate tailored policies and gap assessments without starting from scratch for each engagement.',
                  icon: '👔',
                },
                {
                  role: 'Internal Compliance Teams',
                  desc: 'Answer team questions instantly. Generate documentation grounded in actual framework requirements rather than best-guess templates.',
                  icon: '🏢',
                },
                {
                  role: 'GRC Analysts',
                  desc: 'Use as the research layer above your GRC tool — quick lookups, cross-framework comparisons, and document generation that your platform can\'t do natively.',
                  icon: '📊',
                },
              ].map(({ role, desc, icon }) => (
                <div key={role} className="flex flex-col gap-3">
                  <span className="text-3xl" aria-hidden="true">{icon}</span>
                  <h3 className="font-semibold text-secondary-900 text-lg">{role}</h3>
                  <p className="text-secondary-600 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 px-4 bg-secondary-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-secondary-900 mb-3">Simple, transparent pricing</h2>
              <p className="text-secondary-600">Start free. Upgrade when you need more.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PRICING.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl border p-6 flex flex-col ${
                    plan.highlighted
                      ? 'border-primary-500 bg-primary-600 text-white shadow-lg shadow-primary-200'
                      : 'border-secondary-200 bg-white'
                  }`}
                >
                  <div className="mb-5">
                    <h3 className={`font-bold text-lg mb-1 ${plan.highlighted ? 'text-white' : 'text-secondary-900'}`}>
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-secondary-900'}`}>
                        {plan.price}
                      </span>
                      <span className={`text-sm ${plan.highlighted ? 'text-primary-200' : 'text-secondary-500'}`}>
                        {plan.period}
                      </span>
                    </div>
                    <p className={`text-sm ${plan.highlighted ? 'text-primary-100' : 'text-secondary-600'}`}>
                      {plan.description}
                    </p>
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <svg className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlighted ? 'text-primary-200' : 'text-accent-600'}`} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className={plan.highlighted ? 'text-primary-100' : 'text-secondary-700'}>{f}</span>
                      </li>
                    ))}
                    {plan.limits.map((l) => (
                      <li key={l} className="flex items-start gap-2 text-sm">
                        <svg className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlighted ? 'text-primary-300' : 'text-secondary-400'}`} aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className={plan.highlighted ? 'text-primary-200' : 'text-secondary-500'}>{l}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={plan.ctaTo}
                    className={`text-center py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                      plan.highlighted
                        ? 'bg-white text-primary-600 hover:bg-primary-50'
                        : 'btn-primary'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-secondary-500 mt-6">
              Need enterprise pricing, SSO, or custom framework coverage?{' '}
              <a href="mailto:hello@cybercompliancehub.com" className="text-primary-600 hover:underline">Contact us</a>.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 bg-primary-600">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Start your free account today
            </h2>
            <p className="text-primary-100 mb-8">
              No credit card. No setup. Immediate access to 15+ frameworks and AI-powered research.
            </p>
            <Link to="/signup" className="inline-block bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-primary-50 transition-colors">
              Create free account
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
