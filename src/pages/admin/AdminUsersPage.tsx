import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface AdminUser {
  id: string;
  display_name: string | null;
  is_platform_admin: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<AdminUser | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, is_platform_admin, created_at')
      .order('created_at', { ascending: false });
    if (error) { setError(error.message); setLoading(false); return; }
    setUsers(data ?? []);
    setLoading(false);
  };

  const openEdit = (user: AdminUser) => {
    setEditUser(user);
    setEditName(user.display_name ?? '');
    setEditIsAdmin(user.is_platform_admin);
    setSaveError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setSaving(true);
    setSaveError(null);

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: editName.trim() || null, is_platform_admin: editIsAdmin })
      .eq('id', editUser.id);

    if (error) {
      setSaveError(error.message);
      setSaving(false);
      return;
    }

    setUsers((prev) => prev.map((u) =>
      u.id === editUser.id
        ? { ...u, display_name: editName.trim() || null, is_platform_admin: editIsAdmin }
        : u
    ));
    setEditUser(null);
    setSaving(false);
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.display_name?.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
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
          placeholder="Search by name or user ID…"
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
                <th className="text-left px-4 py-3 font-medium text-secondary-600">User ID</th>
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
                  </td>
                  <td className="px-4 py-3 text-secondary-500 font-mono text-xs">{user.id}</td>
                  <td className="px-4 py-3">
                    {user.is_platform_admin ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                        Platform Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-600">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-secondary-500">
                    {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(user)}
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
