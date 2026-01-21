import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  UserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const roleLabels = {
  ADMIN: 'Administrateur',
  SUPERVISOR: 'Superviseur',
  OPERATOR: 'Opérateur',
  ANALYST: 'Analyste',
  REGULATOR: 'Régulateur',
};

const roleColors = {
  ADMIN: 'bg-red-100 text-red-800',
  SUPERVISOR: 'bg-purple-100 text-purple-800',
  OPERATOR: 'bg-blue-100 text-blue-800',
  ANALYST: 'bg-green-100 text-green-800',
  REGULATOR: 'bg-yellow-100 text-yellow-800',
};

const roleDescriptions = {
  ADMIN: 'Accès complet à toutes les fonctionnalités et paramètres du système.',
  SUPERVISOR: 'Peut gérer les opérations, le personnel et les équipements.',
  OPERATOR: 'Peut consulter et saisir les données opérationnelles.',
  ANALYST: 'Peut consulter les rapports et les indicateurs de performance.',
  REGULATOR: 'Accès en lecture seule pour la conformité réglementaire.',
};

export default function UsersDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${id}/`);
      setUser(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      await api.patch(`/users/${id}/`, { is_active: !user.is_active });
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la modification');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }
    try {
      await api.delete(`/users/${id}/`);
      navigate('/users');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (!isAdmin()) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Accès refusé. Réservé aux administrateurs.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Utilisateur non trouvé</p>
        <Link to="/users" className="mt-4 text-gray-900 hover:text-gray-700">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/users"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xl font-medium text-gray-600">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleActive}
            className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              user.is_active
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-green-600 text-white hover:bg-green-500'
            }`}
          >
            {user.is_active ? (
              <>
                <XCircleIcon className="h-4 w-4 mr-2" />
                Désactiver
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Activer
              </>
            )}
          </button>
          <Link
            to={`/users/${id}/edit`}
            className="inline-flex items-center rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50 transition-colors"
          >
            <PencilSquareIcon className="h-4 w-4 mr-2" />
            Modifier
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 transition-colors"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Supprimer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Role card */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
            <div className="flex items-center gap-4 mb-4">
              <ShieldCheckIcon className="h-8 w-8 text-gray-400" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Rôle et permissions</h2>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[user.role]}`}>
                  {roleLabels[user.role]}
                </span>
              </div>
            </div>
            <p className="text-gray-600">{roleDescriptions[user.role]}</p>
          </div>

          {/* Informations */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex items-start gap-3">
                <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <dt className="text-sm text-gray-500">Nom complet</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {user.first_name} {user.last_name}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <dt className="text-sm text-gray-500">Email</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {user.email}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Statut du compte</h3>
            <div className="flex items-center gap-3">
              {user.is_active ? (
                <>
                  <CheckCircleIcon className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="font-medium text-green-700">Actif</p>
                    <p className="text-sm text-gray-500">Le compte est opérationnel</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircleIcon className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="font-medium text-red-700">Inactif</p>
                    <p className="text-sm text-gray-500">Le compte est désactivé</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Activité</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Créé le</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(user.date_joined).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Dernière connexion</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.last_login
                      ? new Date(user.last_login).toLocaleString('fr-FR')
                      : 'Jamais'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
