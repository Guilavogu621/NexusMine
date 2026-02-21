import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  ClipboardDocumentListIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CubeIcon,
  MapPinIcon,
  CalendarDaysIcon,
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  SparklesIcon,
  FunnelIcon,
  XMarkIcon,
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

const typeEmojis = {
  EXTRACTION: '⛏️',
  DRILLING: '🔩',
  BLASTING: '💥',
  TRANSPORT: '🚛',
  PROCESSING: '🏭',
  MAINTENANCE: '🔧',
  INSPECTION: '🔍',
  OTHER: '📋',
};

const typeColors = {
  EXTRACTION: { gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-100 text-amber-700' },
  DRILLING: { gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-100 text-blue-700' },
  BLASTING: { gradient: 'from-red-500 to-red-600', bg: 'bg-red-100 text-red-700' },
  TRANSPORT: { gradient: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-100 text-cyan-700' },
  PROCESSING: { gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-100 text-purple-700' },
  MAINTENANCE: { gradient: 'from-orange-500 to-orange-600', bg: 'bg-orange-100 text-orange-700' },
  INSPECTION: { gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-100 text-emerald-700' },
  OTHER: { gradient: 'from-slate-500 to-slate-600', bg: 'bg-slate-100 text-slate-700' },
};

const statusLabels = {
  PLANNED: 'Planifiée',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
};

const statusColors = {
  PLANNED: { bg: 'bg-blue-100/80 text-blue-800', dot: 'bg-blue-500' },
  IN_PROGRESS: { bg: 'bg-amber-100/80 text-amber-800', dot: 'bg-amber-500' },
  COMPLETED: { bg: 'bg-emerald-100/80 text-emerald-800', dot: 'bg-emerald-500' },
  CANCELLED: { bg: 'bg-slate-100/80 text-slate-800', dot: 'bg-slate-500' },
};

const statusIcons = {
  PLANNED: ClockIcon,
  IN_PROGRESS: ArrowPathIcon,
  COMPLETED: CheckCircleIcon,
  CANCELLED: XCircleIcon,
};

export default function OperationsList() {
  const [operations, setOperations] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const { isAdmin, isSiteManager, isAnalyst, isMMG, isTechnicien } = useAuthStore();
  const navigate = useNavigate();

  const canEdit = isAdmin() || isSiteManager() || isAnalyst() || isMMG() || isTechnicien();

  const stats = {
    total: operations.length,
    planned: operations.filter(o => o.status === 'PLANNED').length,
    inProgress: operations.filter(o => o.status === 'IN_PROGRESS').length,
    completed: operations.filter(o => o.status === 'COMPLETED').length,
  };

  const totalTonnage = operations.reduce((sum, op) => sum + (parseFloat(op.quantity_extracted) || 0), 0);

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

  const handleDelete = async (id, code, e) => {
    e.stopPropagation();
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'opération "${code}" ?`)) return;
    try {
      await api.delete(`/operations/${id}/`);
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setFilterStatus('');
    setFilterType('');
    setFilterSite('');
  };

  const hasActiveFilters = search || filterStatus || filterType || filterSite;

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
                <pattern id="operationsGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#operationsGrid)" />
            </svg>
          </div>

          {/* Animated Orbs */}
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-indigo-400 opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500"></div>

          <div className="relative px-8 py-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <ClipboardDocumentListIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                    Opérations
                  </h1>
                  <p className="mt-2 text-blue-100 font-medium">
                    Gérez les opérations minières de vos sites
                  </p>
                </div>
              </div>

              {canEdit && (
                <Link
                  to="/operations/new"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-white text-indigo-700 rounded-xl font-bold shadow-lg hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-1 transition-all duration-300 flex-shrink-0"
                >
                  <PlusIcon className="h-5 w-5" />
                  Nouvelle opération
                </Link>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-2">Total</p>
                <p className="text-3xl font-bold text-white font-outfit">{stats.total}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-2">Planifiées</p>
                <p className="text-3xl font-bold text-white font-outfit">{stats.planned}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-2">En cours</p>
                <p className="text-3xl font-bold text-white font-outfit">{stats.inProgress}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-2">Terminées</p>
                <p className="text-3xl font-bold text-white font-outfit">{stats.completed}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-2">Tonnes extraites</p>
                <p className="text-3xl font-bold text-white font-outfit">{totalTonnage.toLocaleString('fr-FR')}</p>
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

              {/* View Toggle */}
              <div className="flex items-center bg-slate-100/60 rounded-lg p-1 border border-slate-200/60">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-300 ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm text-indigo-600'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Vue grille"
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-300 ${
                    viewMode === 'list'
                      ? 'bg-white shadow-sm text-indigo-600'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Vue tableau"
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
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

              {/* Filters Grid */}
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
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="rounded-xl py-3 px-4 text-slate-900 bg-white/50 border border-slate-200/60 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 font-medium cursor-pointer appearance-none pr-8"
                >
                  <option value="">🔧 Tous types</option>
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{typeEmojis[value]} {label}</option>
                  ))}
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

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInUp">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-lg overflow-hidden animate-pulse">
                <div className="h-12 w-12 bg-slate-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : operations.length === 0 ? (
          <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-12 shadow-lg flex flex-col items-center justify-center min-h-[400px] animate-fadeInUp">
            <div className="text-center">
              <div className="p-4 bg-indigo-100 rounded-full mb-6 inline-block">
                <ClipboardDocumentListIcon className="h-12 w-12 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Aucune opération</h3>
              <p className="text-slate-600 mb-6">Commencez par planifier votre première opération minière.</p>
              {canEdit && (
                <Link
                  to="/operations/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-indigo-700 transition-all"
                >
                  <PlusIcon className="h-5 w-5" />
                  Nouvelle opération
                </Link>
              )}
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInUp">
            {operations.map((op, index) => {
              const typeConf = typeColors[op.operation_type] || typeColors.OTHER;
              const statusConf = statusColors[op.status] || statusColors.PLANNED;
              const StatusIcon = statusIcons[op.status] || ClockIcon;

              return (
                <div
                  key={op.id}
                  onClick={() => navigate(`/operations/${op.id}`)}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 hover:border-white/40 p-6 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-500 overflow-hidden cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Gradient accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${typeConf.gradient}`}></div>

                  {/* Hover background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${typeConf.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                          <ClipboardDocumentListIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                            {op.operation_code}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                            <span>{typeEmojis[op.operation_type]}</span>
                            {typeLabels[op.operation_type] || op.operation_type}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${statusConf.bg}`}>
                        <span className={`w-2 h-2 rounded-full ${statusConf.dot}`}></span>
                        {statusLabels[op.status] || op.status}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 mb-4 pb-4 border-t border-slate-200/60">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{op.site_name || op.site?.name || 'Non assigné'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDaysIcon className="h-4 w-4 flex-shrink-0" />
                        <span>{new Date(op.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      {op.quantity_extracted && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CubeIcon className="h-4 w-4 flex-shrink-0" />
                          <span>{Number(op.quantity_extracted).toLocaleString('fr-FR')} t</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/operations/${op.id}`);
                        }}
                        className="p-2 rounded-lg bg-blue-100/80 text-blue-600 hover:bg-blue-200 transition-all"
                        title="Voir"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {canEdit && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/operations/${op.id}/edit`);
                            }}
                            className="p-2 rounded-lg bg-amber-100/80 text-amber-600 hover:bg-amber-200 transition-all"
                            title="Modifier"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(op.id, op.operation_code, e)}
                            className="p-2 rounded-lg bg-red-100/80 text-red-600 hover:bg-red-200 transition-all"
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
        ) : (
          /* List View */
          <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg overflow-hidden animate-fadeInUp">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/60">
                    <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-wider px-6 py-4">Opération</th>
                    <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-wider px-6 py-4">Type</th>
                    <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-wider px-6 py-4">Site</th>
                    <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-wider px-6 py-4">Date</th>
                    <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-wider px-6 py-4">Quantité (T)</th>
                    <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-wider px-6 py-4">Statut</th>
                    <th className="text-right text-xs font-bold text-slate-700 uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {operations.map((op, index) => {
                    const typeConf = typeColors[op.operation_type] || typeColors.OTHER;
                    const statusConf = statusColors[op.status] || statusColors.PLANNED;

                    return (
                      <tr
                        key={op.id}
                        onClick={() => navigate(`/operations/${op.id}`)}
                        className="hover:bg-slate-50/50 transition-colors duration-300 cursor-pointer"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${typeConf.gradient} shadow-md`}>
                              <ClipboardDocumentListIcon className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-sm font-bold text-slate-900">{op.operation_code}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${typeConf.bg}`}>
                            <span>{typeEmojis[op.operation_type]}</span>
                            {typeLabels[op.operation_type]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                            <MapPinIcon className="h-4 w-4" />
                            {op.site_name || op.site?.name || '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                          {new Date(op.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-slate-900">
                            {op.quantity_extracted ? Number(op.quantity_extracted).toLocaleString('fr-FR') : '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${statusConf.bg}`}>
                            <span className={`w-2 h-2 rounded-full ${statusConf.dot}`}></span>
                            {statusLabels[op.status] || op.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/operations/${op.id}`);
                              }}
                              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-all"
                              title="Voir"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            {canEdit && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/operations/${op.id}/edit`);
                                  }}
                                  className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-all"
                                  title="Modifier"
                                >
                                  <PencilSquareIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={(e) => handleDelete(op.id, op.operation_code, e)}
                                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                                  title="Supprimer"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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

        tbody tr {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        tbody tr:nth-child(1) { animation-delay: 50ms; }
        tbody tr:nth-child(2) { animation-delay: 100ms; }
        tbody tr:nth-child(3) { animation-delay: 150ms; }
        tbody tr:nth-child(4) { animation-delay: 200ms; }
        tbody tr:nth-child(5) { animation-delay: 250ms; }
      `}</style>
    </div>
  );
}