import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import SocialLoginButtons from '../../components/SocialLoginButtons';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.session) {
      // Auto-confirmed (local dev or email confirm disabled)
      navigate('/app/dashboard', { replace: true });
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-secondary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-sm rounded-xl border border-secondary-200 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-secondary-900 mb-2">Check your email</h2>
            <p className="text-secondary-600 text-sm">
              We sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account.
            </p>
            <Link to="/login" className="mt-6 inline-block text-primary-600 hover:underline text-sm">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <svg className="w-8 h-8 text-primary-600" aria-hidden="true" focusable="false" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-xl font-semibold text-secondary-900">CyberComplianceHub</span>
        </Link>
        <h1 className="text-center text-2xl font-bold text-secondary-900">Create your free account</h1>
        <p className="mt-2 text-center text-sm text-secondary-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm rounded-xl border border-secondary-200">
          {error && (
            <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1">
                Work email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-1">
                Password <span className="text-secondary-400 font-normal">(min. 8 characters)</span>
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input w-full"
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-secondary-700 mb-1">
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input w-full"
                aria-required="true"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" aria-hidden="true" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                'Create free account'
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-secondary-500">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-primary-600 hover:underline">Terms of Service</Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.
          </p>

          <SocialLoginButtons mode="signup" />
        </div>
      </div>
    </div>
  );
}
