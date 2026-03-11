import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/index.js';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:          null,
      isLoading:     false,
      isInitialized: false,

      initialize: async () => {
        // Prevent running twice (e.g. StrictMode double-invoke)
        if (get().isInitialized) return;

        const token = localStorage.getItem('admin_accessToken');

        // No token — clear any stale persisted user and mark done
        if (!token) {
          set({ isInitialized: true, user: null });
          return;
        }

        try {
          const { data } = await authService.getMe();
          const user = data.data.user;

          if (user.role !== 'admin') {
            localStorage.removeItem('admin_accessToken');
            set({ user: null, isInitialized: true });
            return;
          }

          set({ user, isInitialized: true });
        } catch {
          // Token invalid / expired — clear everything, do NOT redirect here
          // Let the route guard handle the redirect cleanly
          localStorage.removeItem('admin_accessToken');
          set({ user: null, isInitialized: true });
        }
      },

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const { data } = await authService.login(credentials);
          if (data.data.user.role !== 'admin') {
            set({ isLoading: false });
            return { success: false, message: 'Access denied. Admin only.' };
          }
          localStorage.setItem('admin_accessToken', data.data.accessToken);
          set({ user: data.data.user, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, message: err.response?.data?.message || 'Login failed' };
        }
      },

      logout: async () => {
        try { await authService.logout(); } catch {}
        localStorage.removeItem('admin_accessToken');
        set({ user: null, isInitialized: false });
      },

      clearAuth: () => {
        localStorage.removeItem('admin_accessToken');
        set({ user: null, isInitialized: true });
      },
    }),
    {
      name: 'apni-rasoi-admin',
      // Only persist user — never persist isInitialized
      partialize: (s) => ({ user: s.user }),
    }
  )
);

export default useAuthStore;