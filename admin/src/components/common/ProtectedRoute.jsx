import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore.js';

export function AdminRoute({ children }) {
  const user          = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  // Still initializing — render nothing (App shows PageLoader above this)
  if (!isInitialized) return null;

  // Not logged in or not admin → send to login
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function GuestRoute({ children }) {
  const user          = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  // Wait for initialization before acting on stale persisted user
  if (!isInitialized) return null;

  // Already logged in as admin → send to dashboard
  if (user?.role === 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}