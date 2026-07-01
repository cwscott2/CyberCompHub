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

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function AdminOrgsPage() {
  const [orgs, setOrgs] = useState<AdminOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);

  // New org modal state
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newPlan, setNewPlan] = useState('free');
  const [newSeatLimit, setNewSeatLimit] = useState(1);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    const { error } = await supabase.from('organizations').insert({
      name: newName.trim(),
      slug: newSlug.trim() || slugify(newName.trim()),
      plan: newPlan,
      seat_limit: newSeatLimit,
    });

    if (error) {
      setCreateError(error.message);
      setCreating(false);
      return;
    }

    setShowModal(false);
    setNewName(''); setNewSlug(''); setNewPlan('free'); setNewSeatLimit(1);
    await fetchOrgs();
    setCreating(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Organizations</h2>
          <p className="text-sm text-secondary-500 mt-1">{orgs.length} total organizations</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm">
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
                      {['free', 'beta', 'pro', 'team', 'enterprise'].map((p) => (
                        <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-secondary-600">{org.member_count}</td>
                  <td className="px-4 py-3 text-secondary-600">{org.seat_limit}</td>
                  <td className="px-4 py-3 text-secondary-500">
                    {new Date(org.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Organization Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true" aria-labelledby="new-org-title">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 id="new-org-title" className="text-lg font-semibold text-secondary-900 mb-4">New Organization</h3>
            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); if (!newSlug) setNewSlug(slugify(e.target.value)); }}
                  className="input w-full"
                  placeholder="Acme Corp"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Slug <span className="text-secondary-400 font-normal">(auto-generated)</span></label>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="input w-full font-mono text-sm"
                  placeholder="acme-corp"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Plan</label>
                  <select value={newPlan} onChange={(e) => setNewPlan(e.target.value)} className="input w-full">
                    {['free', 'beta', 'pro', 'team', 'enterprise'].map((p) => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Seat Limit</label>
                  <input
                    type="number"
                    min={1}
                    value={newSeatLimit}
                    onChange={(e) => setNewSeatLimit(Number(e.target.value))}
                    className="input w-full"
                  />
                </div>
              </div>
              {createError && <p role="alert" className="text-sm text-red-600">{createError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={creating} className="flex-1 btn-primary disabled:opacity-50">
                  {creating ? 'Creating…' : 'Create Organization'}
                </button>
                <button type="button" onClick={() => { setShowModal(false); setCreateError(null); }} className="flex-1 btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
