import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

interface GeneratedDoc {
  id: string;
  title: string;
  created_at: string;
  is_starred: boolean;
  deleted_at: string | null;
  framework: { name: string; abbreviation: string } | null;
  template: { name: string; template_type: string } | null;
}

export default function AccountPage() {
  const { user, refreshDisplayName } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDoc[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [activeFrameworkFilter, setActiveFrameworkFilter] = useState<string | null>(null);
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<GeneratedDoc | null>(null);
  const [modalContent, setModalContent] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [exportingDocId, setExportingDocId] = useState<string | null>(null);
  const [exportingDataGdpr, setExportingDataGdpr] = useState(false);
  const [gdprError, setGdprError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDocs() {
      const { data } = await supabase
        .from('generated_documents')
        .select('id, title, created_at, is_starred, deleted_at, framework:compliance_frameworks(name, abbreviation), template:templates(name, template_type)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50);
      setGeneratedDocs((data as unknown as GeneratedDoc[]) ?? []);
      setDocsLoading(false);
    }
    loadDocs();
  }, []);

  const handleToggleStar = async (doc: GeneratedDoc) => {
    const newValue = !doc.is_starred;
    setGeneratedDocs(prev => prev.map(d => d.id === doc.id ? { ...d, is_starred: newValue } : d));
    if (selectedDoc?.id === doc.id) setSelectedDoc(prev => prev ? { ...prev, is_starred: newValue } : null);
    await supabase.from('generated_documents').update({ is_starred: newValue }).eq('id', doc.id);
  };

  const handleSoftDelete = async (docId: string) => {
    const deletedAt = new Date().toISOString();
    setGeneratedDocs(prev => prev.filter(d => d.id !== docId));
    setSelectedDoc(null);
    setModalContent(null);
    await supabase.from('generated_documents').update({ deleted_at: deletedAt }).eq('id', docId);
  };

  const handleOpenModal = async (doc: GeneratedDoc) => {
    setSelectedDoc(doc);
    setModalContent(null);
    setModalLoading(true);
    const { data } = await supabase
      .from('generated_documents')
      .select('content_markdown')
      .eq('id', doc.id)
      .single();
    setModalContent((data as { content_markdown: string } | null)?.content_markdown ?? null);
    setModalLoading(false);
  };

  const handleExportFromModal = async (format: 'markdown' | 'docx' | 'xlsx') => {
    if (!selectedDoc) return;
    setExportingDocId(selectedDoc.id);
    try {
      const { data, error } = await supabase.functions.invoke('export-document', {
        body: { document_id: selectedDoc.id, format },
      });
      if (error) throw error;
      const blob = new Blob([data], {
        type: format === 'markdown' ? 'text/markdown' : format === 'docx'
          ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedDoc.title}.${format === 'markdown' ? 'md' : format}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportingDocId(null);
    }
  };

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
      await refreshDisplayName();
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
    beta: { label: 'Beta', color: 'bg-blue-100 text-blue-700' },
    pro: { label: 'Pro', color: 'bg-primary-100 text-primary-700' },
    team: { label: 'Team', color: 'bg-purple-100 text-purple-700' },
    enterprise: { label: 'Enterprise', color: 'bg-amber-100 text-amber-700' },
  };
  const TYPE_LABELS: Record<string, string> = {
    policy: 'Policy',
    checklist: 'Checklist',
    procedure: 'Procedure',
    poam: 'POA&M',
    gap_assessment: 'Gap Assessment',
  };
  const plan = PLAN_LABELS['free'];

  const distinctFrameworks = Array.from(
    new Map(
      generatedDocs
        .filter(d => d.framework)
        .map(d => [d.framework!.abbreviation, d.framework!])
    ).values()
  );

  const distinctTypes = Array.from(
    new Set(generatedDocs.map(d => d.template?.template_type).filter(Boolean))
  ) as string[];

  const filteredDocs = generatedDocs.filter(doc => {
    if (showStarredOnly && !doc.is_starred) return false;
    if (activeFrameworkFilter && doc.framework?.abbreviation !== activeFrameworkFilter) return false;
    if (activeTypeFilter && doc.template?.template_type !== activeTypeFilter) return false;
    return true;
  });

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
        <a href="/#pricing" className="btn-primary text-sm">Upgrade plan</a>
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

      {/* Generated Documents History */}
      <section className="card mb-6">
        <h3 className="text-base font-semibold text-secondary-900 mb-4">Generated Documents</h3>
        {docsLoading ? (
          <p className="text-sm text-secondary-400">Loading…</p>
        ) : generatedDocs.length === 0 ? (
          <p className="text-sm text-secondary-500">
            No documents generated yet.{' '}
            <a href="/app/wizard" className="text-primary-600 hover:underline">Generate your first document →</a>
          </p>
        ) : (
          <div className="divide-y divide-secondary-100">
            {generatedDocs.map(doc => (
              <div key={doc.id} className="py-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-secondary-900 truncate">{doc.title}</p>
                  <p className="text-xs text-secondary-500 mt-0.5">
                    {doc.framework?.abbreviation ?? '—'} · {doc.template?.name ?? '—'} ·{' '}
                    {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <a
                  href={`/app/wizard?doc=${doc.id}`}
                  className="text-xs text-primary-600 hover:underline shrink-0"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        )}
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
