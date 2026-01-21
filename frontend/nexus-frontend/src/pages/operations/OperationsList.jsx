import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const typeLabels = {
  EXTRACTION: 'Extraction',
  DRILLING: 'Forage',
  BLASTING: 'Dynamitage',
  TRANSPORT: 'Transport',
  PROCESSING: 'Traitement',
  MAINTENANCE: 'Maintenance',
  INSPECTION: 'Inspection',
  OTHER: 'Autre',
};

const statusLabels = {
  PLANNED: 'Planifiée',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
};

const statusColors = {
  PLANNED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

export default function OperationsList() {
  const [operations, setOperations] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const { isSupervisor } = useAuthStore();

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterStatus) params.append('status', filterStatus);
      if (filterType) params.append('operation_type', filterType);
      if (filterSite) params.append('site', filterSite);
      
      const [opsRes, sitesRes] = await Promise.all([
        api.get(`/operations/?${params.toString()}`),
        api.get('/sites/'),
      ]);
      
      setOperations(opsRes.data.results || opsRes.data);
      setSites(sitesRes.data.results || sitesRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, filterStatus, filterType, filterSite]);

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'opération "${code}" ?`)) {
      return;
    }
    try {
      await api.delete(`/operations/${id}/`);
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Opérations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les opérations minières de vos sites
          </p>
        </div>
        {isSupervisor() && (
          <Link
            to="/operations/new"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouvelle opération
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
            />
          </div>

          {/* Filter by site */}
          <select
            value={filterSite}
            onChange={(e) => setFilterSite(e.target.value)}
            className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
          >
            <option value="">Tous les sites</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </select>

          {/* Filter by type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
          >
            <option value="">Tous les types</option>
            <option value="EXTRACTION">Extraction</option>
            <option value="DRILLING">Forage</option>
            <option value="BLASTING">Dynamitage</option>
            <option value="TRANSPORT">Transport</option>
            <option value="PROCESSING">Traitement</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="INSPECTION">Inspection</option>
            <option value="OTHER">Autre</option>
          </select>

          {/* Filter by status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="PLANNED">Planifiée</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="COMPLETED">Terminée</option>
            <option value="CANCELLED">Annulée</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : operations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <ClipboardDocumentListIcon className="h-12 w-12 mb-4" />
            <p>Aucune opération trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opération
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité (T)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {operations.map((op) => (
                  <tr key={op.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {op.operation_code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {typeLabels[op.operation_type] || op.operation_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {op.site_name || op.site?.name || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(op.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {op.quantity_extracted ? Number(op.quantity_extracted).toLocaleString('fr-FR') : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusColors[op.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {statusLabels[op.status] || op.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/operations/${op.id}`}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Voir"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        {isSupervisor() && (
                          <>
                            <Link
                              to={`/operations/${op.id}/edit`}
                              className="text-gray-400 hover:text-yellow-600 transition-colors"
                              title="Modifier"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(op.id, op.operation_code)}
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
