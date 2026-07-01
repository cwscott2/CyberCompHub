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

export default function AdminOrgsPage() {
  const [orgs, setOrgs] = useState<AdminOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    setLoading(true);
    setError(null);

    const { data: orgsData, error: orgsErr } = await supabase
      .from('organizations')
      .select('id, name, slug, plan, seat_limit, created_at')
      .order('created_at', { ascending: false });

    if (orgsErr) { setError(orgsErr.message); setLoading(false); return; }

    const { data: membersData } = await supabase
      .from('org_members')
      .select('org_id');

    const memberCounts: Record<string, number> = {};
    (membersData ?? []).forEach((m) => {
      memberCounts[m.org_id] = (memberCounts[m.org_id] ?? 0) + 1;
    });

    setOrgs((orgsData ?? []).map((o) => ({ ...o, member_count: memberCounts[o.id] ?? 0 })));
    setLoading(false);
  };

  const handlePlanChange = async (orgId: string, newPlan: string) => {
    setUpdatingPlan(orgId);
    const { error } = await supabase
      .from('organizations')
      .update({ plan: newPlan })
      .eq('id', orgId);
    if (error) {
      alert(`Failed to update plan: ${error.message}`);
    } else {
      setOrgs((prev) => prev.map((o) => o.id === orgId ? { ...o, plan: newPlan } : o));
    }
    setUpdatingPlan(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-secondary-900">Organizations</h2>
        <p className="text-sm text-secondary-500 mt-1">{orgs.length} total organizations</p>
      </div>

      {error && (
        <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
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
    </div>
  );
}
