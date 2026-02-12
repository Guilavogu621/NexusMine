import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MapPinIcon,
  CalendarDaysIcon,
  FireIcon,
  BoltIcon,
  ShieldExclamationIcon,
  WrenchIcon,
  GlobeAmericasIcon,
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
  ACCIDENT: 'from-red-500 to-red-600',
  EQUIPMENT_FAILURE: 'from-orange-500 to-orange-600',
  ENVIRONMENTAL: 'from-emerald-500 to-emerald-600',
  SECURITY: 'from-purple-500 to-purple-600',
  LANDSLIDE: 'from-amber-600 to-amber-700',
  FIRE: 'from-red-600 to-red-700',
  OTHER: 'from-gray-500 to-gray-600',
};

const severityLabels = {
  LOW: 'Faible',
  MEDIUM: 'Moyen',
  HIGH: 'Élevé',
  CRITICAL: 'Critique',
};

const severityColors = {
  LOW: 'bg-green-100 text-green-700 ring-green-600/20',
  MEDIUM: 'bg-yellow-100 text-yellow-700 ring-yellow-600/20',
  HIGH: 'bg-orange-100 text-orange-700 ring-orange-600/20',
  CRITICAL: 'bg-red-100 text-red-700 ring-red-600/20',
};

const severityDots = {
  LOW: 'bg-green-500',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-orange-500',
  CRITICAL: 'bg-red-500',
};

const statusLabels = {
  REPORTED: 'Déclaré',
  INVESTIGATING: 'En investigation',
  RESOLVED: 'Résolu',
  CLOSED: 'Clôturé',
};

const statusColors = {
  REPORTED: 'bg-indigo-50 text-indigo-700 ring-blue-600/20',
  INVESTIGATING: 'bg-amber-100 text-amber-700 ring-amber-600/20',
  RESOLVED: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  CLOSED: 'bg-slate-100 text-slate-600 ring-gray-600/20',
};

const statusDots = {
  REPORTED: 'bg-indigo-500',
  INVESTIGATING: 'bg-amber-500',
  RESOLVED: 'bg-emerald-500',
  CLOSED: 'bg-gray-500',
};

export default function IncidentsList() {
  const [incidents, setIncidents] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const { isSupervisor, hasRole } = useAuthStore();
  const navigate = useNavigate();

  // Stats calculées
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

  const handleDelete = async (id, code, e) => {
    e.stopPropagation();
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
        {/* Premium Header */}
        <div className="relative overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200/60">
          <div className="relative p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
                  <ExclamationTriangleIcon className="h-7 w-7 text-white relative" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-semibold text-slate-800">Incidents</h1>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700">
                      {incidents.length} incidents
                    </span>
                  </div>
                  <p className="mt-1 text-slate-500">Gérez les incidents de vos sites miniers</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex items-center bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-600'}`}
                  >
                    <Squares2X2Icon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-600'}`}
                  >
                    <ListBulletIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {hasRole(['ADMIN', 'SITE_MANAGER', 'SUPERVISOR', 'OPERATOR']) && (
                  <Link
                    to="/incidents/new"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-base font-semibold text-white shadow-sm"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Déclarer un incident
                  </Link>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200/60">
              <div className="text-center p-3 rounded-lg bg-gray-50">
                <p className="text-xl font-semibold text-slate-800">{stats.total}</p>
                <p className="text-base text-slate-500">Total</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50">
                <p className="text-xl font-semibold text-red-600">{stats.critical}</p>
                <p className="text-base text-slate-500">Critiques</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50">
                <p className="text-xl font-semibold text-orange-600">{stats.investigating}</p>
                <p className="text-base text-slate-500">En investigation</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50">
                <p className="text-xl font-semibold text-green-600">{stats.resolved}</p>
                <p className="text-base text-slate-500">Résolus</p>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par code..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-0 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Site Filter */}
            <div className="relative">
              <select
                value={filterSite}
                onChange={(e) => setFilterSite(e.target.value)}
                className="appearance-none w-full lg:w-44 pl-4 pr-10 py-3 bg-slate-50 border-0 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                <option value="">Tous les sites</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>

            {/* Severity Filter */}
            <div className="relative">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="appearance-none w-full lg:w-40 pl-4 pr-10 py-3 bg-slate-50 border-0 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                <option value="">Toutes gravités</option>
                <option value="LOW">🟢 Faible</option>
                <option value="MEDIUM">🟡 Moyen</option>
                <option value="HIGH">🟠 Élevé</option>
                <option value="CRITICAL">🔴 Critique</option>
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none w-full lg:w-44 pl-4 pr-10 py-3 bg-slate-50 border-0 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                <option value="">Tous statuts</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-5 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-slate-100 rounded"></div>
                  <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : incidents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-10 w-10 text-slate-400" />
                </div>
              </div>
              <h3 className="mt-6 text-base font-semibold text-slate-800">Aucun incident trouvé</h3>
              <p className="mt-2 text-base text-slate-500 text-center max-w-sm">
                Bonne nouvelle ! Aucun incident n'a été signalé.
              </p>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                onClick={() => navigate(`/incidents/${incident.id}`)}
                className="group relative bg-white rounded-2xl border border-slate-200/60 p-5 hover:shadow-md hover:border-indigo-200 transition-all duration-300 cursor-pointer"
              >
                {/* Severity indicator bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${
                  incident.severity === 'CRITICAL' ? 'bg-red-500' :
                  incident.severity === 'HIGH' ? 'bg-orange-500' :
                  incident.severity === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                
                {/* Hover gradient */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-500/[0.02] group-hover:to-blue-500/[0.02] transition-all"></div>
                
                <div className="relative pt-2">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`relative p-3 rounded-xl bg-gradient-to-br ${typeColors[incident.incident_type] || 'from-gray-500 to-gray-600'} shadow-lg group-hover:scale-110 transition-transform`}>
                        <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                        <span className="absolute -bottom-1 -right-1 text-lg">
                          {typeEmojis[incident.incident_type] || '⚠️'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {incident.incident_code}
                        </h3>
                        <p className="text-base text-slate-500 mt-0.5">
                          {typeLabels[incident.incident_type] || incident.incident_type}
                        </p>
                      </div>
                    </div>
                    
                    {/* Severity Badge */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ring-1 ring-inset ${severityColors[incident.severity] || 'bg-slate-100 text-slate-600 ring-gray-600/20'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${severityDots[incident.severity] || 'bg-gray-500'}`}></span>
                      {severityLabels[incident.severity] || incident.severity}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-base text-slate-500">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{incident.site_name || incident.site?.name || 'Non assigné'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-base text-slate-500">
                      <CalendarDaysIcon className="h-4 w-4" />
                      <span>{new Date(incident.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-sm font-medium ring-1 ring-inset ${statusColors[incident.status] || 'bg-slate-100 text-slate-600 ring-gray-600/20'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDots[incident.status] || 'bg-gray-500'}`}></span>
                        {statusLabels[incident.status] || incident.status}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/incidents/${incident.id}`);
                      }}
                      className="p-2 rounded-lg text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Voir"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    {isSupervisor() && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/incidents/${incident.id}/edit`);
                          }}
                          className="p-2 rounded-lg text-indigo-500 hover:text-blue-700 hover:bg-indigo-50 transition-colors"
                          title="Modifier"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(incident.id, incident.incident_code, e)}
                          className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
        ) : (
          /* List View */
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Incident
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Site
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Gravité
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {incidents.map((incident) => (
                    <tr 
                      key={incident.id} 
                      onClick={() => navigate(`/incidents/${incident.id}`)}
                      className="hover:bg-indigo-50/30 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${typeColors[incident.incident_type] || 'from-gray-500 to-gray-600'} shadow-md`}>
                            <ExclamationTriangleIcon className="h-5 w-5 text-white" />
                          </div>
                          <div className="font-medium text-slate-800">{incident.incident_code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-2 text-base text-slate-800">
                          <span>{typeEmojis[incident.incident_type]}</span>
                          {typeLabels[incident.incident_type] || incident.incident_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-base text-slate-500">
                          <MapPinIcon className="h-4 w-4" />
                          {incident.site_name || incident.site?.name || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-slate-500">
                        {new Date(incident.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ring-1 ring-inset ${severityColors[incident.severity] || 'bg-slate-100 text-slate-600 ring-gray-600/20'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${severityDots[incident.severity] || 'bg-gray-500'}`}></span>
                          {severityLabels[incident.severity] || incident.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ring-1 ring-inset ${statusColors[incident.status] || 'bg-slate-100 text-slate-600 ring-gray-600/20'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDots[incident.status] || 'bg-gray-500'}`}></span>
                          {statusLabels[incident.status] || incident.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/incidents/${incident.id}`);
                            }}
                            className="p-2 rounded-lg text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Voir"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          {isSupervisor() && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/incidents/${incident.id}/edit`);
                                }}
                                className="p-2 rounded-lg text-indigo-500 hover:text-blue-700 hover:bg-indigo-50 transition-colors"
                                title="Modifier"
                              >
                                <PencilSquareIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(incident.id, incident.incident_code, e)}
                                className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
          </div>
        )}
      </div>
  );
}
