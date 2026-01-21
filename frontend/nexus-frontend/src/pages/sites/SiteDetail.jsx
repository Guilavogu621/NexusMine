import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  MapPinIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const siteTypeLabels = {
  OPEN_PIT: 'Ciel ouvert',
  UNDERGROUND: 'Souterrain',
  ALLUVIAL: 'Alluvionnaire',
  MIXED: 'Mixte',
};

const statusLabels = {
  ACTIVE: 'En exploitation',
  SUSPENDED: 'Suspendu',
  CLOSED: 'Fermé',
  EXPLORATION: 'En exploration',
};

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800',
  SUSPENDED: 'bg-yellow-100 text-yellow-800',
  CLOSED: 'bg-red-100 text-red-800',
  EXPLORATION: 'bg-blue-100 text-blue-800',
};

export default function SiteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSite();
  }, [id]);

  const fetchSite = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/sites/${id}/`);
      setSite(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement du site:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le site "${site.name}" ?`)) {
      return;
    }
    try {
      await api.delete(`/sites/${id}/`);
      navigate('/sites');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du site');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Site non trouvé</p>
        <Link to="/sites" className="mt-4 text-blue-600 hover:text-blue-500">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/sites"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{site.name}</h1>
            <p className="mt-1 text-sm text-gray-500">{site.location}</p>
          </div>
        </div>
        {isAdmin() && (
          <div className="flex items-center gap-2">
            <Link
              to={`/sites/${id}/edit`}
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
        )}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details card */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informations générales
          </h2>
          
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Type de site</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {siteTypeLabels[site.site_type] || site.site_type}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Statut</dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusColors[site.status] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {statusLabels[site.status] || site.status}
                </span>
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Latitude</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {site.latitude || 'Non renseignée'}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Longitude</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {site.longitude || 'Non renseignée'}
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {site.description || 'Aucune description'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick info */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <MapPinIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Site minier</p>
                <p className="text-xs text-gray-500">{siteTypeLabels[site.site_type]}</p>
              </div>
            </div>

            {site.latitude && site.longitude && (
              <a
                href={`https://www.google.com/maps?q=${site.latitude},${site.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Voir sur Google Maps
              </a>
            )}
          </div>

          {/* Dates */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Historique</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-gray-500">Créé le</p>
                  <p className="font-medium text-gray-900">
                    {new Date(site.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-gray-500">Modifié le</p>
                  <p className="font-medium text-gray-900">
                    {new Date(site.updated_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
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
