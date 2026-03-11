import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService.js';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:        null,
      accessToken: null,
      isLoading:   false,
      isInitialized: false,

      // ── Actions ──────────────────────────────────────────────────────────────
      setUser: (user) => set({ user }),

      initialize: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          set({ isInitialized: true });
          return;
        }
        try {
          const { data } = await authService.getMe();
          set({ user: data.data.user, isInitialized: true });
        } catch {
          localStorage.removeItem('accessToken');
          set({ user: null, isInitialized: true });
        }
      },

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const { data } = await authService.login(credentials);
          localStorage.setItem('accessToken', data.data.accessToken);
          set({ user: data.data.user, accessToken: data.data.accessToken, isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const { data } = await authService.register(userData);
          localStorage.setItem('accessToken', data.data.accessToken);
          set({ user: data.data.user, accessToken: data.data.accessToken, isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
      },

      logout: async () => {
        try { await authService.logout(); } catch { /* ignore */ }
        localStorage.removeItem('accessToken');
        set({ user: null, accessToken: null });
      },

      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),

      isAuthenticated: () => !!get().user,
      isAdmin:         () => get().user?.role === 'admin',
    }),
    {
      name:    'apni-rasoi-auth',
      partialize: (state) => ({ user: state.user }),   // Only persist user, not token
    }
  )
);

export default useAuthStore;