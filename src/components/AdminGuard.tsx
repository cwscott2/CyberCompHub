import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { loading, isPlatformAdmin } = useAuth();

  if (loading) return null;
  if (!isPlatformAdmin) return <Navigate to="/app/dashboard" replace />;

  return <>{children}</>;
}
