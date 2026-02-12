import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, hasRole } = useAuthStore();
  const location = useLocation();

  // Si non authentifié, rediriger vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si des rôles sont spécifiés, vérifier l'autorisation
  if (roles && !hasRole(roles)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">403</h1>
          <p className="mt-2 text-gray-600">Accès non autorisé</p>
          <a href="/" className="mt-4 inline-block text-blue-600 hover:text-blue-500">
            Retour au tableau de bord
          </a>
        </div>
      </div>
    );
  }

  return children;
}
