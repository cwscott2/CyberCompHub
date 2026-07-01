import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

export default function AccountPage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user!.id, display_name: displayName, updated_at: new Date().toISOString() });

    if (error) {
      setError(error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { setPasswordError('Password must be at least 8 characters.'); return; }
    setChangingPassword(true);
    setPasswordError(null);
    setPasswordSaved(false);

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSaved(true);
      setNewPassword('');
      setTimeout(() => setPasswordSaved(false), 3000);
    }
    setChangingPassword(false);
  };

  const PLAN_LABELS: Record<string, { label: string; color: string }> = {
    free: { label: 'Free', color: 'bg-secondary-100 text-secondary-700' },
    pro: { label: 'Pro', color: 'bg-primary-100 text-primary-700' },
    team: { label: 'Team', color: 'bg-purple-100 text-purple-700' },
    enterprise: { label: 'Enterprise', color: 'bg-amber-100 text-amber-700' },
  };
  const plan = PLAN_LABELS['free']; // Will be dynamic once billing is wired

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-secondary-900 mb-8">Account Settings</h2>

      {/* Plan */}
      <section className="card mb-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-semibold text-secondary-900">Current Plan</h3>
          <span className={`badge ${plan.color}`}>{plan.label}</span>
        </div>
        <p className="text-sm text-secondary-600 mb-4">
          Free tier: 10 AI chat messages/day, 3 document generations/month.
        </p>
        <a
          href="/#pricing"
          className="btn-primary text-sm"
        >
          Upgrade plan
        </a>
      </section>

      {/* Profile */}
      <section className="card mb-6">
        <h3 className="text-base font-semibold text-secondary-900 mb-4">Profile</h3>
        <div className="mb-4">
          <p className="text-sm text-secondary-500 mb-1">Email</p>
          <p className="text-sm font-medium text-secondary-900">{user?.email}</p>
        </div>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label htmlFor="display-name" className="block text-sm font-medium text-secondary-700 mb-1">
              Display name
            </label>
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="input w-full"
            />
          </div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-50">
              {saving ? 'Saving…' : 'Save profile'}
            </button>
            {saved && <span className="text-sm text-accent-600">Saved</span>}
          </div>
        </form>
      </section>

      {/* Change Password */}
      <section className="card mb-6">
        <h3 className="text-base font-semibold text-secondary-900 mb-4">Change Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-secondary-700 mb-1">
              New password <span className="text-secondary-400 font-normal">(min. 8 characters)</span>
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input w-full"
            />
          </div>
          {passwordError && <p role="alert" className="text-sm text-red-600">{passwordError}</p>}
          <div className="flex items-center gap-3">
            <button type="submit" disabled={changingPassword} className="btn-primary text-sm disabled:opacity-50">
              {changingPassword ? 'Updating…' : 'Update password'}
            </button>
            {passwordSaved && <span className="text-sm text-accent-600">Password updated</span>}
          </div>
        </form>
      </section>

      {/* Danger zone */}
      <section className="card border-red-200">
        <h3 className="text-base font-semibold text-red-700 mb-2">Delete Account</h3>
        <p className="text-sm text-secondary-600 mb-4">
          Permanently delete your account and all associated data. This cannot be undone.
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
              // Deletion request — handled manually until a dedicated edge function is built
              window.location.href = 'mailto:support@cybercompliancehub.com?subject=Account deletion request&body=Please delete my account: ' + user?.email;
            }
          }}
          className="px-4 py-2 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors"
        >
          Request account deletion
        </button>
      </section>
    </div>
  );
}
