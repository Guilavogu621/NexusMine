import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/token/', { email, password });
          const { access, refresh } = response.data;
          
          localStorage.setItem('access_token', access);
          localStorage.setItem('refresh_token', refresh);
          
          // Récupérer les infos utilisateur
          const userResponse = await api.get('/users/me/');
          
          set({
            user: userResponse.data,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return { success: true };
        } catch (error) {
          set({
            error: error.response?.data?.detail || 'Erreur de connexion',
            isLoading: false,
          });
          return { success: false, error: error.response?.data };
        }
      },

      // Logout
      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false });
      },

      // Vérifier l'authentification au chargement
      checkAuth: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const response = await api.get('/users/me/');
          set({ user: response.data, isAuthenticated: true });
        } catch (error) {
          get().logout();
        }
      },

      // Vérifier si l'utilisateur a un rôle spécifique
      hasRole: (roles) => {
        const user = get().user;
        if (!user) return false;
        if (typeof roles === 'string') return user.role === roles;
        return roles.includes(user.role);
      },

      // Vérifier si admin
      isAdmin: () => get().user?.role === 'ADMIN',
      
      // Vérifier si superviseur ou admin
      isSupervisor: () => ['ADMIN', 'SUPERVISOR'].includes(get().user?.role),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
