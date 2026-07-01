import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface AdminUser {
  id: string;
  display_name: string | null;
  is_platform_admin: boolean;
  created_at: string;
  org_id: string | null;
  org_name: string | null;
  org_role: string | null;
}

interface OrgOption {
  id: string;
  name: string;
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
};

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-amber-100 text-amber-700',
  admin: 'bg-primary-100 text-primary-700',
  member: 'bg-secondary-100 text-secondary-600',
};

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orgs, setOrgs] = useState<OrgOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<AdminUser | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [editOrgId, setEditOrgId] = useState<string>('');
  const [editOrgRole, setEditOrgRole] = useState<string>('member');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);

    const [profilesRes, membersRes, orgsRes] = await Promise.all([
      supabase.from('profiles').select('id, display_name, is_platform_admin, created_at').order('created_at', { ascending: false }),
      supabase.from('org_members').select('user_id, org_id, role, organizations(name)'),
      supabase.from('organizations').select('id, name').order('name'),
    ]);

    if (profilesRes.error) { setError(profilesRes.error.message); setLoading(false); return; }

    // Build a map of user_id → first org membership
    const memberMap: Record<string, { org_id: string; org_name: string; org_role: string }> = {};
    (membersRes.data ?? []).forEach((m: any) => {
      if (!memberMap[m.user_id]) {
        memberMap[m.user_id] = {
          org_id: m.org_id,
          org_name: m.organizations?.name ?? null,
          org_role: m.role,
        };
      }
    });

    setUsers((profilesRes.data ?? []).map((p) => ({
      ...p,
      org_id: memberMap[p.id]?.org_id ?? null,
      org_name: memberMap[p.id]?.org_name ?? null,
      org_role: memberMap[p.id]?.org_role ?? null,
    })));

    setOrgs(orgsRes.data ?? []);
    setLoading(false);
  };

  const openEdit = (user: AdminUser) => {
    setEditUser(user);
    setEditName(user.display_name ?? '');
    setEditIsAdmin(user.is_platform_admin);
    setEditOrgId(user.org_id ?? '');
    setEditOrgRole(user.org_role ?? 'member');
    setSaveError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setSaving(true);
    setSaveError(null);

    // Update profile
    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ display_name: editName.trim() || null, is_platform_admin: editIsAdmin })
      .eq('id', editUser.id);

    if (profileErr) { setSaveError(profileErr.message); setSaving(false); return; }

    // Handle org membership changes
    const prevOrgId = editUser.org_id;
    const newOrgId = editOrgId || null;

    if (prevOrgId && prevOrgId !== newOrgId) {
      // Remove from previous org
      await supabase.from('org_members').delete().eq('user_id', editUser.id).eq('org_id', prevOrgId);
    }

    if (newOrgId && newOrgId !== prevOrgId) {
      // Add to new org
      const { error: memberErr } = await supabase.from('org_members').insert({
        user_id: editUser.id,
        org_id: newOrgId,
        role: editOrgRole,
      });
      if (memberErr) { setSaveError(memberErr.message); setSaving(false); return; }
    } else if (newOrgId && newOrgId === prevOrgId && editOrgRole !== editUser.org_role) {
      // Update role in same org
      const { error: roleErr } = await supabase.from('org_members')
        .update({ role: editOrgRole })
        .eq('user_id', editUser.id)
        .eq('org_id', newOrgId);
      if (roleErr) { setSaveError(roleErr.message); setSaving(false); return; }
    }

    await fetchAll();
    setEditUser(null);
    setSaving(false);
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.display_name?.toLowerCase().includes(q) || u.id.toLowerCase().includes(q) || u.org_name?.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Users</h2>
          <p className="text-sm text-secondary-500 mt-1">{users.length} total users</p>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="search"
          placeholder="Search by name, user ID, or organization…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input w-full max-w-sm"
        />
      </div>

      {error && (
        <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="card text-center py-12 text-secondary-400" role="status">Loading users…</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12 text-secondary-400">No users found.</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-secondary-600">User</th>
                <th className="text-left px-4 py-3 font-medium text-secondary-600">Organization</th>
                <th className="text-left px-4 py-3 font-medium text-secondary-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-secondary-600">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-secondary-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-secondary-900">
                      {user.display_name ?? <span className="text-secondary-400 italic">No name set</span>}
                    </div>
                    <div className="text-xs text-secondary-400 font-mono">{user.id}</div>
                    {user.is_platform_admin && (
                      <span className="inline-flex items-center mt-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-700">
                        Platform Admin
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-secondary-600">
                    {user.org_name ?? <span className="text-secondary-400 italic">None</span>}
                  </td>
                  <td className="px-4 py-3">
                    {user.org_role ? (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.org_role] ?? 'bg-secondary-100 text-secondary-600'}`}>
                        {ROLE_LABELS[user.org_role] ?? user.org_role}
                      </span>
                    ) : (
                      <span className="text-secondary-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-secondary-500">
                    {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(user)} className="text-xs text-secondary-400 hover:text-primary-600 transition-colors">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-1">Edit User</h3>
            <p className="text-xs text-secondary-400 font-mono mb-4">{editUser.id}</p>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input w-full"
                  placeholder="Full name"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary-50 border border-secondary-200">
                <div>
                  <div className="text-sm font-medium text-secondary-900">Platform Admin</div>
                  <div className="text-xs text-secondary-500">Full access to admin area</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={editIsAdmin}
                  disabled={editUser.id === currentUser?.id}
                  onClick={() => setEditIsAdmin((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${editIsAdmin ? 'bg-primary-600' : 'bg-secondary-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${editIsAdmin ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              {editUser.id === currentUser?.id && (
                <p className="text-xs text-secondary-400">You cannot remove your own admin access.</p>
              )}

              <div className="border-t border-secondary-100 pt-4">
                <p className="text-sm font-medium text-secondary-700 mb-3">Organization</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-secondary-500 mb-1">Organization</label>
                    <select value={editOrgId} onChange={(e) => setEditOrgId(e.target.value)} className="input w-full text-sm">
                      <option value="">— None —</option>
                      {orgs.map((o) => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-secondary-500 mb-1">Role</label>
                    <select value={editOrgRole} onChange={(e) => setEditOrgRole(e.target.value)} disabled={!editOrgId} className="input w-full text-sm disabled:opacity-40">
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                    </select>
                  </div>
                </div>
              </div>

              {saveError && <p role="alert" className="text-sm text-red-600">{saveError}</p>}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditUser(null)} className="flex-1 btn-secondary">
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
