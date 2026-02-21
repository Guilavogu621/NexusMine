import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  MapPinIcon,
  CalendarDaysIcon,
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

const typeEmojis = {
  ACCIDENT: '🚑',
  EQUIPMENT_FAILURE: '🔧',
  ENVIRONMENTAL: '🌍',
  SECURITY: '🔒',
  LANDSLIDE: '⛰️',
  FIRE: '🔥',
  OTHER: '⚠️',
};

const typeColors = {
  ACCIDENT: { bg: 'bg-red-100/80', text: 'text-red-700', gradient: 'from-red-500 to-red-600', badge: 'bg-red-200 text-red-800' },
  EQUIPMENT_FAILURE: { bg: 'bg-orange-100/80', text: 'text-orange-700', gradient: 'from-orange-500 to-orange-600', badge: 'bg-orange-200 text-orange-800' },
  ENVIRONMENTAL: { bg: 'bg-emerald-100/80', text: 'text-emerald-700', gradient: 'from-emerald-500 to-emerald-600', badge: 'bg-emerald-200 text-emerald-800' },
  SECURITY: { bg: 'bg-purple-100/80', text: 'text-purple-700', gradient: 'from-purple-500 to-purple-600', badge: 'bg-purple-200 text-purple-800' },
  LANDSLIDE: { bg: 'bg-amber-100/80', text: 'text-amber-700', gradient: 'from-amber-500 to-amber-600', badge: 'bg-amber-200 text-amber-800' },
  FIRE: { bg: 'bg-red-100/80', text: 'text-red-700', gradient: 'from-red-500 to-red-600', badge: 'bg-red-200 text-red-800' },
  OTHER: { bg: 'bg-gray-100/80', text: 'text-gray-700', gradient: 'from-gray-500 to-gray-600', badge: 'bg-gray-200 text-gray-800' },
};

const severityLabels = {
  LOW: 'Faible',
  MEDIUM: 'Moyen',
  HIGH: 'Élevé',
  CRITICAL: 'Critique',
};

const severityColors = {
  LOW: { bg: 'bg-green-100/80', text: 'text-green-700', gradient: 'from-green-500 to-green-600', badge: 'bg-green-200 text-green-800' },
  MEDIUM: { bg: 'bg-yellow-100/80', text: 'text-yellow-700', gradient: 'from-yellow-500 to-yellow-600', badge: 'bg-yellow-200 text-yellow-800' },
  HIGH: { bg: 'bg-orange-100/80', text: 'text-orange-700', gradient: 'from-orange-500 to-orange-600', badge: 'bg-orange-200 text-orange-800' },
  CRITICAL: { bg: 'bg-red-100/80', text: 'text-red-700', gradient: 'from-red-500 to-red-600', badge: 'bg-red-200 text-red-800' },
};

const statusLabels = {
  REPORTED: 'Déclaré',
  INVESTIGATING: 'En investigation',
  RESOLVED: 'Résolu',
  CLOSED: 'Clôturé',
};

const statusColors = {
  REPORTED: { bg: 'bg-indigo-100/80', text: 'text-indigo-700', gradient: 'from-indigo-500 to-indigo-600', badge: 'bg-indigo-200 text-indigo-800' },
  INVESTIGATING: { bg: 'bg-amber-100/80', text: 'text-amber-700', gradient: 'from-amber-500 to-amber-600', badge: 'bg-amber-200 text-amber-800' },
  RESOLVED: { bg: 'bg-emerald-100/80', text: 'text-emerald-700', gradient: 'from-emerald-500 to-emerald-600', badge: 'bg-emerald-200 text-emerald-800' },
  CLOSED: { bg: 'bg-slate-100/80', text: 'text-slate-700', gradient: 'from-slate-500 to-slate-600', badge: 'bg-slate-200 text-slate-800' },
};

export default function IncidentsList() {
  const [incidents, setIncidents] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const { isAdmin, isSiteManager, isAnalyst, isMMG, isTechnicien } = useAuthStore();
  const navigate = useNavigate();

  const canEdit = isAdmin() || isSiteManager() || isAnalyst() || isMMG() || isTechnicien();

  const stats = {
    total: incidents.length,
    critical: incidents.filter(i => i.severity === 'CRITICAL').length,
    investigating: incidents.filter(i => i.status === 'INVESTIGATING').length,
    resolved: incidents.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length,
  };

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

  const clearFilters = () => {
    setSearch('');
    setFilterSite('');
    setFilterSeverity('');
    setFilterStatus('');
  };

  const hasActiveFilters = search || filterSite || filterSeverity || filterStatus;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 relative">
      {/* Background pattern */}
      <div className="fixed inset-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.05),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(16,185,129,0.05),transparent_50%)]"></div>
      </div>
      <div className="relative space-y-8 pb-12 px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Premium */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 shadow-2xl animate-fadeInDown">
          {/* SVG Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="envListGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#envListGrid)" />
            </svg>
          </div>
          {/* Animated Orbs */}
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-indigo-400 opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500"></div>
          <div className="relative px-8 py-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div className="flex items-start gap-5">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <ExclamationTriangleIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                    Incidents
                  </h1>
                  <p className="mt-2 text-blue-100 font-medium">
                    Gérez les incidents de vos sites miniers
                  </p>
                </div>
              </div>
              {canEdit && (
                <Link
                  to="/incidents/new"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-white text-indigo-700 rounded-xl font-bold shadow-lg hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-1 transition-all duration-300 flex-shrink-0"
                >
                  <PlusIcon className="h-5 w-5" />
                  Déclarer un incident
                </Link>
              )}
            </div>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-2">Total incidents</p>
                <p className="text-3xl font-bold text-white font-outfit">{stats.total}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-2">🔴 Critiques</p>
                <p className="text-3xl font-bold text-white font-outfit">{stats.critical}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-2">🟠 En investigation</p>
                <p className="text-3xl font-bold text-white font-outfit">{stats.investigating}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-2">🟢 Résolus</p>
                <p className="text-3xl font-bold text-white font-outfit">{stats.resolved}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Filters Section */}
        <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-lg hover:shadow-xl hover:border-white/40 transition-all duration-500 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FunnelIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <span className="font-bold text-slate-900">Filtres & Recherche</span>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="ml-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    Effacer
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative group/search">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within/search:text-indigo-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Rechercher par code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full rounded-xl py-3 pl-12 pr-4 text-slate-900 bg-white/50 border border-slate-200/60 placeholder:text-slate-500 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 font-medium"
                />
              </div>
              {/* Selects */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <select
                  value={filterSite}
                  onChange={(e) => setFilterSite(e.target.value)}
                  className="rounded-xl py-3 px-4 text-slate-900 bg-white/50 border border-slate-200/60 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 font-medium cursor-pointer appearance-none pr-8"
                >
                  <option value="">📍 Tous les sites</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="rounded-xl py-3 px-4 text-slate-900 bg-white/50 border border-slate-200/60 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 font-medium cursor-pointer appearance-none pr-8"
                >
                  <option value="">🔴 Toutes gravités</option>
                  <option value="LOW">🟢 Faible</option>
                  <option value="MEDIUM">🟡 Moyen</option>
                  <option value="HIGH">🟠 Élevé</option>
                  <option value="CRITICAL">🔴 Critique</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-xl py-3 px-4 text-slate-900 bg-white/50 border border-slate-200/60 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 font-medium cursor-pointer appearance-none pr-8"
                >
                  <option value="">📊 Tous statuts</option>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        {/* Data Grid */}
        {loading ? (
          <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-12 shadow-lg flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-slate-200 animate-spin border-t-indigo-600 border-r-indigo-500"></div>
                <SparklesIcon className="h-8 w-8 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <p className="text-slate-600 font-semibold">Chargement des données...</p>
            </div>
          </div>
        ) : incidents.length === 0 ? (
          <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-12 shadow-lg flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="p-4 bg-indigo-100 rounded-full mb-6 inline-block">
                <ExclamationTriangleIcon className="h-12 w-12 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun incident</h3>
              <p className="text-slate-600 mb-6">Bonne nouvelle ! Aucun incident n'a été signalé.</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-indigo-700 transition-all duration-300"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInUp">
            {incidents.map((incident, index) => {
              const typeConf = typeColors[incident.incident_type] || typeColors.OTHER;
              const severityConf = severityColors[incident.severity] || severityColors.LOW;
              const statusConf = statusColors[incident.status] || statusColors.CLOSED;
              return (
                <div
                  key={incident.id}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 hover:border-white/40 p-6 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Gradient accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${typeConf.gradient}`}></div>
                  {/* Hover gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-3xl">{typeEmojis[incident.incident_type] || '⚠️'}</span>
                        <div className="min-w-0 flex-1">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${typeConf.badge}`}>
                            {typeLabels[incident.incident_type] || incident.incident_type}
                          </span>
                          <p className="text-sm text-slate-500 mt-2 font-medium truncate">
                            {incident.site_name || incident.site?.name || 'Site non défini'}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Code Display */}
                    <div className={`text-center py-5 bg-gradient-to-r ${typeConf.gradient} rounded-xl mb-4 shadow-sm group-hover:shadow-md transition-shadow`}>
                      <p className="text-3xl font-bold text-white font-outfit">
                        {incident.incident_code}
                      </p>
                    </div>
                    {/* Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50">
                        <span className="text-sm text-slate-500">📅 Date</span>
                        <span className="text-sm font-bold text-slate-900">
                          {new Date(incident.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50">
                        <span className="text-sm text-slate-500">🔴 Gravité</span>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${severityConf.badge}`}>
                          {severityLabels[incident.severity] || incident.severity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50">
                        <span className="text-sm text-slate-500">📊 Statut</span>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${statusConf.badge}`}>
                          {statusLabels[incident.status] || incident.status}
                        </span>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200/60">
                      <button
                        onClick={() => navigate(`/incidents/${incident.id}`)}
                        className="p-2 rounded-lg bg-blue-100/80 text-blue-600 hover:bg-blue-200 transition-all duration-200"
                        title="Voir"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {canEdit && (
                        <>
                          <button
                            onClick={() => navigate(`/incidents/${incident.id}/edit`)}
                            className="p-2 rounded-lg bg-amber-100/80 text-amber-600 hover:bg-amber-200 transition-all duration-200"
                            title="Modifier"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(incident.id, incident.incident_code)}
                            className="p-2 rounded-lg bg-red-100/80 text-red-600 hover:bg-red-200 transition-all duration-200"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-4 w-4" />
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
      {/* Animations CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
        .font-outfit {
          font-family: 'Outfit', sans-serif;
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.7s ease-out forwards;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          animation-fill-mode: both;
        }
        /* Select styling */
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'%3E%3C/path%3E%3C/svg%3E");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
        }
      `}</style>
    </div>
  );
}