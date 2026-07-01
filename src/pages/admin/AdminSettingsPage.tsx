export default function AdminSettingsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-secondary-900 mb-6">Platform Settings</h2>

      <div className="card mb-6">
        <h3 className="text-base font-semibold text-secondary-900 mb-1">Plan Limits</h3>
        <p className="text-sm text-secondary-500">
          Usage enforcement gates (chat messages/day, document generations/month) — configurable once Stripe billing is wired.
        </p>
      </div>

      <div className="card mb-6">
        <h3 className="text-base font-semibold text-secondary-900 mb-1">Email / SMTP</h3>
        <p className="text-sm text-secondary-500">
          Custom SMTP configuration for branded invite and transactional emails — configure in Supabase → Authentication → Settings → SMTP once domain is finalized.
        </p>
      </div>

      <div className="card mb-6">
        <h3 className="text-base font-semibold text-secondary-900 mb-1">Session Policy</h3>
        <p className="text-sm text-secondary-500">
          30-minute inactivity timeout — pending implementation. Supabase JWT expiry: 1 hour. Refresh token: 24 hours (set in Supabase → Authentication → Sessions).
        </p>
      </div>

      <div className="card">
        <h3 className="text-base font-semibold text-secondary-900 mb-1">Analytics</h3>
        <p className="text-sm text-secondary-500">
          Plausible Analytics active on cyber-compliance-hub.vercel.app. Internal usage_events instrumentation — pending implementation.
        </p>
      </div>
    </div>
  );
}
