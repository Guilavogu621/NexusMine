import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  BellAlertIcon,
  CheckCircleIcon,
  SparklesIcon,
  FunnelIcon,
  XMarkIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';
import { formatDateFR } from '../../utils/translationUtils';

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
  LOW: { bg: 'bg-emerald-100/80', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-500', gradient: 'from-emerald-500 to-emerald-600' },
  MEDIUM: { bg: 'bg-blue-100/80', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-500', gradient: 'from-blue-500 to-indigo-600' },
  HIGH: { bg: 'bg-orange-100/80', text: 'text-orange-700', dot: 'bg-orange-500', border: 'border-orange-500', gradient: 'from-orange-400 to-orange-600' },
  CRITICAL: { bg: 'bg-red-100/80', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-500', gradient: 'from-red-500 to-red-700' },
};

const statusLabels = {
  NEW: 'Nouvelle',
  READ: 'Lue',
  IN_PROGRESS: 'En cours',
  RESOLVED: 'Résolue',
  ARCHIVED: 'Archivée',
};

const statusConfig = {
  NEW: { bg: 'bg-red-100/80', text: 'text-red-700', dot: 'bg-red-500' },
  READ: { bg: 'bg-blue-100/80', text: 'text-blue-700', dot: 'bg-indigo-500' },
  IN_PROGRESS: { bg: 'bg-amber-100/80', text: 'text-amber-700', dot: 'bg-amber-500' },
  RESOLVED: { bg: 'bg-emerald-100/80', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  ARCHIVED: { bg: 'bg-slate-100/80', text: 'text-slate-600', dot: 'bg-gray-500' },
};

export default function AlertsList() {
  const [alerts, setAlerts] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const { isAdmin, isSiteManager, isAnalyst, isMMG, isTechnicien } = useAuthStore();

  const canEdit = isAdmin() || isSiteManager() || isAnalyst() || isTechnicien();

  const fetchData = useCallback(async () => {
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
  }, [filterStatus, filterSeverity, filterSite]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/alerts/${id}/`, { status: 'READ' });
      fetchData();
    } catch (error) { console.error('Erreur:', error); }
  };

  const handleResolve = async (id) => {
    try {
      await api.patch(`/alerts/${id}/`, { status: 'RESOLVED' });
      fetchData();
    } catch (error) { console.error('Erreur:', error); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) return;
    try {
      await api.delete(`/alerts/${id}/`);
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const clearFilters = () => {
    setFilterStatus('');
    setFilterSeverity('');
    setFilterSite('');
  };

  const hasActiveFilters = filterStatus || filterSeverity || filterSite;
  const newAlertsCount = alerts.filter(a => a.status === 'NEW').length;
  const urgentAlertsCount = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 relative">
      {/* Background decoration */}
      <div className="fixed inset-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(239,68,68,0.05),transparent_50%),radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.05),transparent_50%)]"></div>
      </div>

      <div className="relative space-y-8 pb-12 px-4 sm:px-6 lg:px-8 pt-8 max-w-7xl mx-auto">

        {/* Header Premium */}
        <div className="group relative bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden animate-fadeInDown">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="alertsGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
              <rect width="100" height="100" fill="url(#alertsGrid)" />
            </svg>
          </div>

          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500"></div>

          <div className="relative px-8 py-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div className="flex items-start gap-5">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl relative group-hover:scale-110 transition-transform duration-300">
                  <BellAlertIcon className="h-8 w-8 text-white" />
                  {newAlertsCount > 0 && (
                    <span className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 rounded-full border-2 border-indigo-600 animate-ping"></span>
                  )}
                  {newAlertsCount > 0 && (
                    <span className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 rounded-full border-2 border-indigo-600"></span>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight font-outfit">
                    Centre d'Alertes
                  </h1>
                  <p className="mt-2 text-blue-100 font-medium">
                    Supervision et gestion des incidents du réseau
                  </p>
                </div>
              </div>

              {canEdit && (
                <Link
                  to="/alerts/new"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-white text-indigo-700 rounded-xl font-bold shadow-lg hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-1 transition-all duration-300 flex-shrink-0"
                >
                  <PlusIcon className="h-5 w-5" />
                  Nouvelle alerte
                </Link>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-2">Total</p>
                <p className="text-3xl font-bold text-white font-outfit">{alerts.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-red-500/30 hover:bg-white/15 transition-all duration-300">
                <p className="text-sm font-semibold text-red-200 uppercase tracking-wider mb-2">Nouvelles</p>
                <p className="text-3xl font-bold text-red-100 font-outfit">{newAlertsCount}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-orange-500/30 hover:bg-white/15 transition-all duration-300">
                <p className="text-sm font-semibold text-orange-200 uppercase tracking-wider mb-2">Urgentes</p>
                <p className="text-3xl font-bold text-orange-100 font-outfit">{urgentAlertsCount}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-emerald-500/30 hover:bg-white/15 transition-all duration-300">
                <p className="text-sm font-semibold text-emerald-200 uppercase tracking-wider mb-2">Résolues</p>
                <p className="text-3xl font-bold text-emerald-100 font-outfit">{alerts.filter(a => a.status === 'RESOLVED').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-lg transition-all duration-500">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FunnelIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <span className="font-bold text-slate-900 font-outfit text-lg">Filtrer les alertes</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all shadow-sm"
              >
                <XMarkIcon className="h-4 w-4" />
                Effacer les filtres
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className="w-full rounded-xl py-3 px-4 text-slate-900 bg-white/50 border border-slate-200/60 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium appearance-none cursor-pointer"
            >
              <option value="">📍 Tous les sites</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="w-full rounded-xl py-3 px-4 text-slate-900 bg-white/50 border border-slate-200/60 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium appearance-none cursor-pointer"
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
              className="w-full rounded-xl py-3 px-4 text-slate-900 bg-white/50 border border-slate-200/60 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium appearance-none cursor-pointer"
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

        {/* Alerts List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-12 shadow-lg flex flex-col items-center justify-center min-h-[300px]">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-slate-200 animate-spin border-t-indigo-600"></div>
                <SparklesIcon className="h-6 w-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <p className="text-slate-600 font-bold">Analyse des alertes...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-12 shadow-lg flex flex-col items-center justify-center min-h-[300px] text-center animate-fadeInUp">
              <div className="p-4 bg-emerald-50 rounded-full mb-4">
                <CheckCircleIcon className="h-12 w-12 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-outfit mb-2">Tout est sous contrôle</h3>
              <p className="text-slate-500">Aucune alerte ne correspond à vos critères de recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {alerts.map((alertItem, index) => {
                const prioConf = severityConfig[alertItem.severity] || severityConfig.LOW;
                const statConf = statusConfig[alertItem.status] || statusConfig.NEW;
                const isNew = alertItem.status === 'NEW';

                return (
                  <div
                    key={alertItem.id}
                    className={`group relative bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden animate-fadeInUp ${isNew ? 'bg-orange-50/30' : ''
                      }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Severity Left Border Indicator */}
                    <div className={`absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b ${prioConf.gradient}`}></div>

                    <div className="p-5 sm:p-6 ml-2">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">

                        {/* Info Section */}
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className={`p-3 rounded-2xl ${prioConf.bg} shadow-inner shrink-0`}>
                            <span className="text-2xl">{typeEmojis[alertItem.alert_type] || '🔔'}</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2.5">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${prioConf.bg} ${prioConf.text} shadow-sm border border-white/50`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${prioConf.dot} ${alertItem.severity === 'CRITICAL' || alertItem.severity === 'HIGH' ? 'animate-pulse' : ''}`}></span>
                                {severityLabels[alertItem.severity]}
                              </span>
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statConf.bg} ${statConf.text} shadow-sm border border-white/50`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${statConf.dot}`}></span>
                                {statusLabels[alertItem.status]}
                              </span>
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                                {typeLabels[alertItem.alert_type] || alertItem.alert_type}
                              </span>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 truncate font-outfit mb-1">
                              {alertItem.title}
                            </h3>
                            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                              {alertItem.message}
                            </p>

                            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                              <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                <MapPinIcon className="h-4 w-4 text-slate-400" />
                                {alertItem.site_name || 'Tous sites'}
                              </span>
                              <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                <ClockIcon className="h-4 w-4 text-slate-400" />
                                {formatDateFR(alertItem.generated_at, true)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions Section */}
                        <div className="flex items-center gap-2 lg:flex-col lg:items-end pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                          <div className="flex items-center gap-2">
                            {isNew && (
                              <button
                                onClick={() => handleMarkRead(alertItem.id)}
                                className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                title="Marquer comme lue"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </button>
                            )}
                            {alertItem.status !== 'RESOLVED' && alertItem.status !== 'ARCHIVED' && (
                              <button
                                onClick={() => handleResolve(alertItem.id)}
                                className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                title="Résoudre"
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                            )}
                            <Link
                              to={`/alerts/${alertItem.id}`}
                              className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                              title="Voir détails"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </Link>
                          </div>

                          {canEdit && (
                            <div className="flex items-center gap-2 ml-auto lg:ml-0 lg:mt-2">
                              <Link
                                to={`/alerts/${alertItem.id}/edit`}
                                className="p-2.5 rounded-xl text-amber-600 hover:bg-amber-100 transition-all"
                                title="Modifier"
                              >
                                <PencilSquareIcon className="h-5 w-5" />
                              </Link>
                              <button
                                onClick={() => handleDelete(alertItem.id)}
                                className="p-2.5 rounded-xl text-red-600 hover:bg-red-100 transition-all"
                                title="Supprimer"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInDown { animation: fadeInDown 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-fill-mode: both; }

        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'%3E%3C/path%3E%3C/svg%3E");
          background-position: right 1rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
        }
      `}</style>
    </div>
  );
}