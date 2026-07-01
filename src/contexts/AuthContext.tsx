import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  displayName: string | null;
  isPlatformAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshDisplayName: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  displayName: null,
  isPlatformAdmin: false,
  loading: true,
  signOut: async () => {},
  refreshDisplayName: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);

  const fetchDisplayName = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('display_name, is_platform_admin')
      .eq('id', userId)
      .maybeSingle();
    if (error) console.error('[AuthContext] fetchDisplayName error:', error);
    console.log('[AuthContext] profile data:', data);

    if (data?.display_name) {
      setDisplayName(data.display_name);
    } else {
      // Fall back to OAuth provider name (Google full_name, etc.)
      const { data: { user } } = await supabase.auth.getUser();
      const oauthName = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? null;
      setDisplayName(oauthName);
    }
    setIsPlatformAdmin(data?.is_platform_admin ?? false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) await fetchDisplayName(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchDisplayName(session.user.id);
      } else {
        setDisplayName(null);
        setIsPlatformAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshDisplayName = async () => {
    if (session?.user) await fetchDisplayName(session.user.id);
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, displayName, isPlatformAdmin, loading, signOut, refreshDisplayName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
