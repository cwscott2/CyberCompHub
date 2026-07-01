import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

interface AdminOrg {
  id: string;
  name: string;
  slug: string;
  plan: string;
  seat_limit: number;
  created_at: string;
  member_count: number;
}

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-secondary-100 text-secondary-700',
  beta: 'bg-purple-100 text-purple-700',
  pro: 'bg-primary-100 text-primary-700',
  team: 'bg-blue-100 text-blue-700',
  enterprise: 'bg-amber-100 text-amber-700',
};

const PLANS = ['free', 'beta', 'pro', 'team', 'enterprise'];

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

interface OrgFormProps {
  title: string;
  initialName?: string;
  initialSlug?: string;
  initialPlan?: string;
  initialSeatLimit?: number;
  submitLabel: string;
  onSubmit: (values: { name: string; slug: string; plan: string; seat_limit: number }) => Promise<string | null>;
  onClose: () => void;
}

function OrgFormModal({ title, initialName = '', initialSlug = '', initialPlan = 'free', initialSeatLimit = 1, submitLabel, onSubmit, onClose }: OrgFormProps) {
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(initialSlug);
  const [slugEdited, setSlugEdited] = useState(!!initialSlug);
  const [plan, setPlan] = useState(initialPlan);
  const [seatLimit, setSeatLimit] = useState(initialSeatLimit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const err = await onSubmit({ name: name.trim(), slug: slug.trim() || slugify(name.trim()), plan, seat_limit: seatLimit });
    if (err) { setError(err); setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => { setName(e.target.value); if (!slugEdited) setSlug(slugify(e.target.value)); }}
              className="input w-full"
              placeholder="Acme Corp"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Slug <span className="text-secondary-400 font-normal">(auto-generated)</span></label>
            <input
              type="text"
              value={slug}
              onChange={(e) => { setSlugEdited(true); setSlug(e.target.value); }}
              className="input w-full font-mono text-sm"
              placeholder="acme-corp"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Plan</label>
              <select value={plan} onChange={(e) => setPlan(e.target.value)} className="input w-full">
                {PLANS.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Seat Limit</label>
              <input
                type="number"
                min={1}
                value={seatLimit}
                onChange={(e) => setSeatLimit(Number(e.target.value))}
                className="input w-full"
              />
            </div>
          </div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-50">
              {saving ? 'Saving…' : submitLabel}
            </button>
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminOrgsPage() {
  const [orgs, setOrgs] = useState<AdminOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editOrg, setEditOrg] = useState<AdminOrg | null>(null);

  useEffect(() => { fetchOrgs(); }, []);

  const fetchOrgs = async () => {
    setLoading(true);
    setError(null);

    const { data: orgsData, error: orgsErr } = await supabase
      .from('organizations')
      .select('id, name, slug, plan, seat_limit, created_at')
      .order('created_at', { ascending: false });

    if (orgsErr) { setError(orgsErr.message); setLoading(false); return; }

    const { data: membersData } = await supabase.from('org_members').select('org_id');
    const memberCounts: Record<string, number> = {};
    (membersData ?? []).forEach((m) => { memberCounts[m.org_id] = (memberCounts[m.org_id] ?? 0) + 1; });

    setOrgs((orgsData ?? []).map((o) => ({ ...o, member_count: memberCounts[o.id] ?? 0 })));
    setLoading(false);
  };

  const handlePlanChange = async (orgId: string, newPlan: string) => {
    setUpdatingPlan(orgId);
    const { error } = await supabase.from('organizations').update({ plan: newPlan }).eq('id', orgId);
    if (error) {
      alert(`Failed to update plan: ${error.message}`);
    } else {
      setOrgs((prev) => prev.map((o) => o.id === orgId ? { ...o, plan: newPlan } : o));
    }
    setUpdatingPlan(null);
  };

  const handleCreate = async (values: { name: string; slug: string; plan: string; seat_limit: number }) => {
    const { error } = await supabase.from('organizations').insert(values);
    if (error) return error.message;
    setShowCreate(false);
    await fetchOrgs();
    return null;
  };

  const handleEdit = async (values: { name: string; slug: string; plan: string; seat_limit: number }) => {
    if (!editOrg) return null;
    const { error } = await supabase.from('organizations').update(values).eq('id', editOrg.id);
    if (error) return error.message;
    setEditOrg(null);
    await fetchOrgs();
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Organizations</h2>
          <p className="text-sm text-secondary-500 mt-1">{orgs.length} total organizations</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">
          + New Organization
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="card text-center py-12 text-secondary-400" role="status">Loading organizations…</div>
      ) : orgs.length === 0 ? (
        <div className="card text-center py-12 text-secondary-400">No organizations yet.</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-secondary-600">Organization</th>
                <th className="text-left px-4 py-3 font-medium text-secondary-600">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-secondary-600">Members</th>
                <th className="text-left px-4 py-3 font-medium text-secondary-600">Seat Limit</th>
                <th className="text-left px-4 py-3 font-medium text-secondary-600">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {orgs.map((org) => (
                <tr key={org.id} className="hover:bg-secondary-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-secondary-900">{org.name}</div>
                    <div className="text-xs text-secondary-400 font-mono">{org.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={org.plan}
                      onChange={(e) => handlePlanChange(org.id, e.target.value)}
                      disabled={updatingPlan === org.id}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${PLAN_COLORS[org.plan] ?? 'bg-secondary-100 text-secondary-700'}`}
                      aria-label={`Plan for ${org.name}`}
                    >
                      {PLANS.map((p) => (
                        <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-secondary-600">{org.member_count}</td>
                  <td className="px-4 py-3 text-secondary-600">{org.seat_limit}</td>
                  <td className="px-4 py-3 text-secondary-500">
                    {new Date(org.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditOrg(org)}
                      className="text-xs text-secondary-400 hover:text-primary-600 transition-colors"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <OrgFormModal
          title="New Organization"
          submitLabel="Create Organization"
          onSubmit={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}

      {editOrg && (
        <OrgFormModal
          title={`Edit — ${editOrg.name}`}
          initialName={editOrg.name}
          initialSlug={editOrg.slug}
          initialPlan={editOrg.plan}
          initialSeatLimit={editOrg.seat_limit}
          submitLabel="Save Changes"
          onSubmit={handleEdit}
          onClose={() => setEditOrg(null)}
        />
      )}
    </div>
  );
}
