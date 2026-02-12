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
  SparklesIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const typeLabels = {
  THRESHOLD_EXCEEDED: 'Seuil dépassé',
  SAFETY: 'Sécurité',
  MAINTENANCE: 'Maintenance',
  ENVIRONMENTAL: 'Environnement',
  PRODUCTION: 'Production',
  INCIDENT: 'Incident',
  EQUIPMENT: 'Équipement',
  STOCK: 'Stock',
  SYSTEM: 'Système',
};

const typeEmojis = {
  THRESHOLD_EXCEEDED: '📊',
  SAFETY: '🛡️',
  MAINTENANCE: '🔧',
  ENVIRONMENTAL: '🌿',
  PRODUCTION: '⚙️',
  INCIDENT: '⚠️',
  EQUIPMENT: '🧰',
  STOCK: '📦',
  SYSTEM: '💻',
};

const severityLabels = {
  LOW: 'Basse',
  MEDIUM: 'Moyenne',
  HIGH: 'Haute',
  CRITICAL: 'Critique',
};

const severityConfig = {
  LOW: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-gray-500' },
  MEDIUM: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-indigo-500' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

const statusLabels = {
  NEW: 'Nouvelle',
  READ: 'Lue',
  IN_PROGRESS: 'En cours',
  RESOLVED: 'Résolue',
  ARCHIVED: 'Archivée',
};

const statusConfig = {
  NEW: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  READ: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-indigo-500' },
  IN_PROGRESS: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  RESOLVED: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  ARCHIVED: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-gray-500' },
};

export default function AlertsList() {
  const [alerts, setAlerts] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const { isSupervisor } = useAuthStore();

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterSeverity) params.append('severity', filterSeverity);
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
  }, [filterStatus, filterSeverity, filterSite]);

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
  const urgentAlertsCount = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length;

  return (
    <div className="space-y-6 pb-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-xl bg-white border border-slate-200/60 shadow-md">
        <div className="relative px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-sm">
                <BellAlertIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-slate-800">Alertes</h1>
                  {newAlertsCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                      <span className="h-2 w-2 rounded-full bg-red-500"></span>
                      {newAlertsCount} nouvelle{newAlertsCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-slate-500">
                  Gérez les alertes de vos sites miniers
                </p>
              </div>
            </div>
            {isSupervisor() && (
              <Link
                to="/alerts/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold shadow-sm"
              >
                <PlusIcon className="h-5 w-5" />
                Nouvelle alerte
              </Link>
            )}
          </div>
          
          {/* Stats row */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-base text-slate-500">Total alertes</p>
              <p className="text-xl font-semibold text-slate-800">{alerts.length}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-base text-slate-500">Nouvelles</p>
              <p className="text-xl font-semibold text-orange-600">{newAlertsCount}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-base text-slate-500">Urgentes</p>
              <p className="text-xl font-semibold text-red-600">{urgentAlertsCount}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-base text-slate-500">Résolues</p>
              <p className="text-xl font-semibold text-green-600">{alerts.filter(a => a.status === 'RESOLVED').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="h-5 w-5 text-slate-500" />
          <span className="font-semibold text-slate-800">Filtres</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select
            value={filterSite}
            onChange={(e) => setFilterSite(e.target.value)}
            className="block w-full rounded-xl border-0 py-3 px-4 text-slate-800 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-500 sm:text-sm bg-slate-50 font-medium"
          >
            <option value="">📍 Tous les sites</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="block w-full rounded-xl border-0 py-3 px-4 text-slate-800 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-500 sm:text-sm bg-slate-50 font-medium"
          >
            <option value="">⚡ Toutes gravités</option>
            <option value="LOW">🟢 Basse</option>
            <option value="MEDIUM">🔵 Moyenne</option>
            <option value="HIGH">🟠 Haute</option>
            <option value="CRITICAL">🔴 Critique</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block w-full rounded-xl border-0 py-3 px-4 text-slate-800 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-500 sm:text-sm bg-slate-50 font-medium"
          >
            <option value="">📋 Tous les statuts</option>
            <option value="NEW">🆕 Nouvelle</option>
            <option value="READ">👁️ Lue</option>
            <option value="IN_PROGRESS">⏳ En cours</option>
            <option value="RESOLVED">✅ Résolue</option>
            <option value="ARCHIVED">📦 Archivée</option>
          </select>
        </div>
      </div>

      {/* Alerts list */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600 mx-auto"></div>
                <SparklesIcon className="h-5 w-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="mt-4 text-slate-500 font-medium">Chargement des alertes...</p>
            </div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="p-4 bg-indigo-100 rounded-full mb-4">
              <BellAlertIcon className="h-12 w-12 text-indigo-600" />
            </div>
            <p className="text-xl font-semibold text-slate-800">Aucune alerte</p>
            <p className="text-slate-500 mt-1">Aucune alerte ne correspond à vos critères</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {alerts.map((alertItem, index) => {
              const prioConf = severityConfig[alertItem.severity] || severityConfig.LOW;
              const statConf = statusConfig[alertItem.status] || statusConfig.NEW;
              
              return (
                <div
                  key={alertItem.id}
                  className={`p-5 hover:bg-slate-50 transition-all duration-200 ${
                    alertItem.status === 'NEW' ? 'bg-orange-50/50' : ''
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`p-3 rounded-xl ${prioConf.bg}`}>
                        <span className="text-xl">{typeEmojis[alertItem.alert_type] || '🔔'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold ${prioConf.bg} ${prioConf.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${prioConf.dot} ${alertItem.severity === 'CRITICAL' || alertItem.severity === 'HIGH' ? 'animate-pulse' : ''}`}></span>
                            {severityLabels[alertItem.severity]}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold ${statConf.bg} ${statConf.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${statConf.dot}`}></span>
                            {statusLabels[alertItem.status]}
                          </span>
                          <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                            {typeLabels[alertItem.alert_type] || alertItem.alert_type}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-slate-800 truncate">
                          {alertItem.title}
                        </h3>
                        <p className="mt-1 text-base text-slate-500 line-clamp-2">
                          {alertItem.message}
                        </p>
                        <div className="mt-3 flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            📍 {alertItem.site_name || 'Tous sites'}
                          </span>
                          <span className="flex items-center gap-1">
                            🕐 {new Date(alertItem.generated_at).toLocaleString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {alertItem.status === 'NEW' && (
                        <button
                          onClick={() => handleMarkRead(alertItem.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                          title="Marquer comme lue"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      )}
                      {alertItem.status !== 'RESOLVED' && alertItem.status !== 'ARCHIVED' && (
                        <button
                          onClick={() => handleResolve(alertItem.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                          title="Résoudre"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                      <Link
                        to={`/alerts/${alertItem.id}`}
                        className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                        title="Voir détails"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      {isSupervisor() && (
                        <>
                          <Link
                            to={`/alerts/${alertItem.id}/edit`}
                            className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200"
                            title="Modifier"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(alertItem.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .space-y-6 > * {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
