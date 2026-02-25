import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return '/api';
  // Si l'URL contient un point (domaine) mais pas de protocole
  if (envUrl.includes('.') && !envUrl.includes('://') && !envUrl.startsWith('/')) {
    return `https://${envUrl}`;
  }
  return envUrl;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs et rafraîchir le token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si erreur 401 et pas déjà réessayé
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const refreshUrl = import.meta.env.VITE_API_BASE_URL
            ? `${import.meta.env.VITE_API_BASE_URL}/token/refresh/`
            : '/api/token/refresh/';

          const response = await axios.post(refreshUrl, {
            refresh: refreshToken,
          });
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch {
          // Token invalide, déconnecter l'utilisateur
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
