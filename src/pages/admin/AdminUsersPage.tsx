import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

interface AdminUser {
  id: string;
  display_name: string | null;
  is_platform_admin: boolean;
  created_at: string;
  email: string | null;
  provider: string | null;
}


export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, is_platform_admin, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Fetch emails from auth.users via the admin view
    const enriched: AdminUser[] = (data ?? []).map((p) => ({
      id: p.id,
      display_name: p.display_name,
      is_platform_admin: p.is_platform_admin,
      created_at: p.created_at,
      email: null,
      provider: null,
    }));

    setUsers(enriched);
    setLoading(false);
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.display_name?.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    );
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
        <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
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
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Platform Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-600">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-secondary-500">
                    {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
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
