import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore.js';

// Requires login
export const ProtectedRoute = ({ children }) => {
  const user          = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const location      = useLocation();

  if (!isInitialized) return null; // Wait for auth check

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

// Requires admin role
export const AdminRoute = ({ children }) => {
  const user          = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const location      = useLocation();

  if (!isInitialized) return null;

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

// Redirect logged-in users away from login/register
export const GuestRoute = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  if (user) return <Navigate to="/" replace />;
  return children;
};