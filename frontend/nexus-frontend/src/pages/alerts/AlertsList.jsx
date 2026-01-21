import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  BellAlertIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const typeLabels = {
  THRESHOLD_EXCEEDED: 'Seuil dépassé',
  SAFETY: 'Sécurité',
  MAINTENANCE: 'Maintenance',
  ENVIRONMENTAL: 'Environnement',
  PRODUCTION: 'Production',
  SYSTEM: 'Système',
};

const priorityLabels = {
  LOW: 'Basse',
  MEDIUM: 'Moyenne',
  HIGH: 'Haute',
  URGENT: 'Urgente',
};

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

const statusLabels = {
  NEW: 'Nouvelle',
  READ: 'Lue',
  IN_PROGRESS: 'En cours',
  RESOLVED: 'Résolue',
  ARCHIVED: 'Archivée',
};

const statusColors = {
  NEW: 'bg-red-100 text-red-800',
  READ: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-gray-100 text-gray-800',
};

export default function AlertsList() {
  const [alerts, setAlerts] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const { isSupervisor } = useAuthStore();

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterPriority) params.append('priority', filterPriority);
      if (filterSite) params.append('site', filterSite);
      
      const [alertsRes, sitesRes] = await Promise.all([
        api.get(`/alerts/?${params.toString()}`),
        api.get('/sites/'),
      ]);
      
      setAlerts(alertsRes.data.results || alertsRes.data);
      setSites(sitesRes.data.results || sitesRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterPriority, filterSite]);

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/alerts/${id}/`, { status: 'READ' });
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.patch(`/alerts/${id}/`, { status: 'RESOLVED' });
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
      return;
    }
    try {
      await api.delete(`/alerts/${id}/`);
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const newAlertsCount = alerts.filter(a => a.status === 'NEW').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Alertes</h1>
            {newAlertsCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                {newAlertsCount} nouvelle{newAlertsCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les alertes de vos sites miniers
          </p>
        </div>
        {isSupervisor() && (
          <Link
            to="/alerts/new"
            className="inline-flex items-center justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouvelle alerte
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select
            value={filterSite}
            onChange={(e) => setFilterSite(e.target.value)}
            className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-orange-600 sm:text-sm"
          >
            <option value="">Tous les sites</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-orange-600 sm:text-sm"
          >
            <option value="">Toutes priorités</option>
            <option value="LOW">Basse</option>
            <option value="MEDIUM">Moyenne</option>
            <option value="HIGH">Haute</option>
            <option value="URGENT">Urgente</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-orange-600 sm:text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="NEW">Nouvelle</option>
            <option value="READ">Lue</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="RESOLVED">Résolue</option>
            <option value="ARCHIVED">Archivée</option>
          </select>
        </div>
      </div>

      {/* Alerts list */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <BellAlertIcon className="h-12 w-12 mb-4" />
            <p>Aucune alerte trouvée</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  alert.status === 'NEW' ? 'bg-orange-50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[alert.priority]}`}>
                        {priorityLabels[alert.priority]}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[alert.status]}`}>
                        {statusLabels[alert.status]}
                      </span>
                      <span className="text-xs text-gray-500">
                        {typeLabels[alert.alert_type] || alert.alert_type}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {alert.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {alert.message}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                      <span>{alert.site_name || 'Tous sites'}</span>
                      <span>{new Date(alert.generated_at).toLocaleString('fr-FR')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {alert.status === 'NEW' && (
                      <button
                        onClick={() => handleMarkRead(alert.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Marquer comme lue"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    )}
                    {alert.status !== 'RESOLVED' && alert.status !== 'ARCHIVED' && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                        title="Résoudre"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                    <Link
                      to={`/alerts/${alert.id}`}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                      title="Voir détails"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Link>
                    {isSupervisor() && (
                      <>
                        <Link
                          to={`/alerts/${alert.id}/edit`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
                          title="Modifier"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(alert.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
