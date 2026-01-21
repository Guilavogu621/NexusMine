import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const typeLabels = {
  ACCIDENT: 'Accident corporel',
  EQUIPMENT_FAILURE: 'Panne équipement',
  ENVIRONMENTAL: 'Incident environnemental',
  SECURITY: 'Incident de sécurité',
  LANDSLIDE: 'Glissement de terrain',
  FIRE: 'Incendie',
  OTHER: 'Autre',
};

const severityLabels = {
  LOW: 'Faible',
  MEDIUM: 'Moyen',
  HIGH: 'Élevé',
  CRITICAL: 'Critique',
};

const severityColors = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

const statusLabels = {
  REPORTED: 'Déclaré',
  INVESTIGATING: 'En investigation',
  RESOLVED: 'Résolu',
  CLOSED: 'Clôturé',
};

const statusColors = {
  REPORTED: 'bg-blue-100 text-blue-800',
  INVESTIGATING: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

export default function IncidentsList() {
  const [incidents, setIncidents] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const { isSupervisor } = useAuthStore();

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterStatus) params.append('status', filterStatus);
      if (filterSeverity) params.append('severity', filterSeverity);
      if (filterSite) params.append('site', filterSite);
      
      const [incidentsRes, sitesRes] = await Promise.all([
        api.get(`/incidents/?${params.toString()}`),
        api.get('/sites/'),
      ]);
      
      setIncidents(incidentsRes.data.results || incidentsRes.data);
      setSites(sitesRes.data.results || sitesRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, filterStatus, filterSeverity, filterSite]);

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'incident "${code}" ?`)) {
      return;
    }
    try {
      await api.delete(`/incidents/${id}/`);
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
          <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les incidents de vos sites miniers
          </p>
        </div>
        {isSupervisor() && (
          <Link
            to="/incidents/new"
            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Déclarer un incident
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

          {/* Filter by severity */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
          >
            <option value="">Toutes gravités</option>
            <option value="LOW">Faible</option>
            <option value="MEDIUM">Moyen</option>
            <option value="HIGH">Élevé</option>
            <option value="CRITICAL">Critique</option>
          </select>

          {/* Filter by status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="REPORTED">Déclaré</option>
            <option value="INVESTIGATING">En investigation</option>
            <option value="RESOLVED">Résolu</option>
            <option value="CLOSED">Clôturé</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <ExclamationTriangleIcon className="h-12 w-12 mb-4" />
            <p>Aucun incident trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Incident
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
                    Gravité
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
                {incidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {incident.incident_code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {typeLabels[incident.incident_type] || incident.incident_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {incident.site_name || incident.site?.name || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(incident.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          severityColors[incident.severity] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {severityLabels[incident.severity] || incident.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusColors[incident.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {statusLabels[incident.status] || incident.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/incidents/${incident.id}`}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Voir"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        {isSupervisor() && (
                          <>
                            <Link
                              to={`/incidents/${incident.id}/edit`}
                              className="text-gray-400 hover:text-yellow-600 transition-colors"
                              title="Modifier"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(incident.id, incident.incident_code)}
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
