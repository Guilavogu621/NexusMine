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
        } catch {
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

      // Mettre à jour l'utilisateur
      setUser: (userData) => set({ user: userData }),

      // Vérifier si admin
      isAdmin: () => get().user?.role === 'ADMIN',
      
      // Vérifier si responsable de site minier
      isSiteManager: () => ['ADMIN', 'SITE_MANAGER'].includes(get().user?.role),

      // Vérifier si superviseur (DEPRECATED - use isSiteManager)
      isSupervisor: () => ['ADMIN', 'SITE_MANAGER'].includes(get().user?.role),

      // Vérifier si technicien
      isTechnicien: () => get().user?.role === 'TECHNICIEN',

      // Vérifier si analyste
      isAnalyst: () => get().user?.role === 'ANALYST',

      // Vérifier si MMG (audit)
      isMMG: () => get().user?.role === 'MMG',

      // Récupérer les sites assignés (détails)
      getAssignedSites: () => get().user?.assigned_sites_details || [],

      // Vérifier si l'utilisateur a accès à un site spécifique
      hasSiteAccess: (siteId) => {
        const user = get().user;
        if (!user) return false;
        // ADMIN, SITE_MANAGER et ANALYST voient tout
        if (['ADMIN', 'SITE_MANAGER', 'ANALYST'].includes(user.role)) return true;
        // Autres rôles : vérifier si le site est assigné
        return (user.assigned_sites || []).includes(siteId);
      },

      // Vérifier si l'utilisateur voit tous les sites (ADMIN/SITE_MANAGER/ANALYST)
      seesAllSites: () => {
        const user = get().user;
        if (!user) return false;
        return ['ADMIN', 'SITE_MANAGER', 'ANALYST'].includes(user.role);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
