import useAuthStore from '../store/authStore.js';

// Thin wrapper so components import from one place
export const useAuth = () => {
  const user          = useAuthStore((s) => s.user);
  const isLoading     = useAuthStore((s) => s.isLoading);
  const login         = useAuthStore((s) => s.login);
  const register      = useAuthStore((s) => s.register);
  const logout        = useAuthStore((s) => s.logout);
  const updateUser    = useAuthStore((s) => s.updateUser);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAdmin       = useAuthStore((s) => s.isAdmin);

  return { user, isLoading, login, register, logout, updateUser, isAuthenticated, isAdmin };
};