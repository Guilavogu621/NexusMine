import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  MapPinIcon,
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

export default function SitesList() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const { isAdmin } = useAuthStore();

  const fetchSites = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterType) params.append('site_type', filterType);
      if (filterStatus) params.append('status', filterStatus);
      
      const response = await api.get(`/sites/?${params.toString()}`);
      setSites(response.data.results || response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des sites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, [search, filterType, filterStatus]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le site "${name}" ?`)) {
      return;
    }
    try {
      await api.delete(`/sites/${id}/`);
      fetchSites();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du site');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sites Miniers</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez tous les sites miniers de la plateforme
          </p>
        </div>
        {isAdmin() && (
          <Link
            to="/sites/new"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouveau site
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un site..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
            />
          </div>

          {/* Filter by type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
          >
            <option value="">Tous les types</option>
            <option value="OPEN_PIT">Ciel ouvert</option>
            <option value="UNDERGROUND">Souterrain</option>
            <option value="ALLUVIAL">Alluvionnaire</option>
            <option value="MIXED">Mixte</option>
          </select>

          {/* Filter by status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="ACTIVE">En exploitation</option>
            <option value="SUSPENDED">Suspendu</option>
            <option value="CLOSED">Fermé</option>
            <option value="EXPLORATION">En exploration</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : sites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <MapPinIcon className="h-12 w-12 mb-4" />
            <p>Aucun site trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Localisation
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sites.map((site) => (
                  <tr key={site.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-blue-100 flex items-center justify-center">
                          <MapPinIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {site.name}
                          </div>
                          {site.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {site.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {siteTypeLabels[site.site_type] || site.site_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusColors[site.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {statusLabels[site.status] || site.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {site.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/sites/${site.id}`}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Voir"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        {isAdmin() && (
                          <>
                            <Link
                              to={`/sites/${site.id}/edit`}
                              className="text-gray-400 hover:text-yellow-600 transition-colors"
                              title="Modifier"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(site.id, site.name)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              title="Supprimer"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
