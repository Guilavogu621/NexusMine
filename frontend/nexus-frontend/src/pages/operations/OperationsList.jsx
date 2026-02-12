import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  ClipboardDocumentListIcon,
  ChevronDownIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CubeIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ClockIcon,
  PlayIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
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
  EXTRACTION: 'from-amber-500 to-amber-600',
  DRILLING: 'from-blue-500 to-blue-600',
  BLASTING: 'from-red-500 to-red-600',
  TRANSPORT: 'from-cyan-500 to-cyan-600',
  PROCESSING: 'from-purple-500 to-purple-600',
  MAINTENANCE: 'from-orange-500 to-orange-600',
  INSPECTION: 'from-emerald-500 to-emerald-600',
  OTHER: 'from-slate-500 to-slate-600',
};

const statusLabels = {
  PLANNED: 'Planifiée',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
};

const statusColors = {
  PLANNED: 'bg-indigo-50 text-indigo-700 ring-blue-600/20',
  IN_PROGRESS: 'bg-amber-100 text-amber-700 ring-amber-600/20',
  COMPLETED: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  CANCELLED: 'bg-slate-100 text-slate-600 ring-gray-600/20',
};

const statusDots = {
  PLANNED: 'bg-indigo-500',
  IN_PROGRESS: 'bg-amber-500',
  COMPLETED: 'bg-emerald-500',
  CANCELLED: 'bg-gray-500',
};

const statusIcons = {
  PLANNED: ClockIcon,
  IN_PROGRESS: ArrowPathIcon,
  COMPLETED: CheckIcon,
  CANCELLED: XMarkIcon,
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
  const { isSupervisor, hasRole } = useAuthStore();
  const navigate = useNavigate();

  // Stats calculées
  const stats = {
    total: operations.length,
    planned: operations.filter(o => o.status === 'PLANNED').length,
    inProgress: operations.filter(o => o.status === 'IN_PROGRESS').length,
    completed: operations.filter(o => o.status === 'COMPLETED').length,
  };

  // Total tonnage extrait
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
    <div className="min-h-screen">
      {/* Background subtil */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30"></div>
      
      <div className="space-y-6">
        {/* Premium Header */}
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200/60">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-blue-500/5 to-indigo-500/5 rounded-full translate-y-1/2 -translate-x-1/4"></div>
          
          <div className="relative p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-sm">
                  <div className="absolute inset-0 rounded-2xl bg-white/20"></div>
                  <ClipboardDocumentListIcon className="h-7 w-7 text-white relative" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-semibold text-slate-800">Opérations</h1>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700">
                      {operations.length} opérations
                    </span>
                  </div>
                  <p className="mt-1 text-slate-500">Gérez les opérations minières de vos sites</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex items-center bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-600'}`}
                  >
                    <Squares2X2Icon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-600'}`}
                  >
                    <ListBulletIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {hasRole(['ADMIN', 'SITE_MANAGER', 'SUPERVISOR', 'OPERATOR']) && (
                  <Link
                    to="/operations/new"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-2.5 text-base font-semibold text-white shadow-sm"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Nouvelle opération
                  </Link>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-slate-100">
              <div className="text-center p-3 rounded-xl bg-gray-50/50 hover:bg-slate-50 transition-colors">
                <p className="text-xl font-semibold text-slate-800">{stats.total}</p>
                <p className="text-base text-slate-500">Total</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
                <p className="text-xl font-semibold text-indigo-600">{stats.planned}</p>
                <p className="text-base text-slate-500">Planifiées</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-amber-50/50 hover:bg-amber-50 transition-colors">
                <p className="text-xl font-semibold text-amber-600">{stats.inProgress}</p>
                <p className="text-base text-slate-500">En cours</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 transition-colors">
                <p className="text-xl font-semibold text-emerald-600">{stats.completed}</p>
                <p className="text-base text-slate-500">Terminées</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-purple-50/50 hover:bg-purple-50 transition-colors">
                <p className="text-xl font-semibold text-purple-600">{totalTonnage.toLocaleString('fr-FR')}</p>
                <p className="text-base text-slate-500">Tonnes extraites</p>
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

            {/* Type Filter */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="appearance-none w-full lg:w-44 pl-4 pr-10 py-3 bg-slate-50 border-0 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                <option value="">Tous types</option>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{typeEmojis[value]} {label}</option>
                ))}
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
        ) : operations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                  <ClipboardDocumentListIcon className="h-10 w-10 text-slate-400" />
                </div>
              </div>
              <h3 className="mt-6 text-base font-semibold text-slate-800">Aucune opération trouvée</h3>
              <p className="mt-2 text-base text-slate-500 text-center max-w-sm">
                Commencez par planifier votre première opération minière.
              </p>
              {isSupervisor() && (
                <Link
                  to="/operations/new"
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-xl shadow-sm"
                >
                  <PlusIcon className="h-5 w-5" />
                  Nouvelle opération
                </Link>
              )}
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {operations.map((op) => {
              const StatusIcon = statusIcons[op.status] || ClockIcon;
              return (
                <div
                  key={op.id}
                  onClick={() => navigate(`/operations/${op.id}`)}
                  className="group relative bg-white rounded-2xl border border-slate-200/60 p-5 hover:shadow-md hover:border-indigo-200 transition-all duration-300 cursor-pointer"
                >
                  {/* Hover gradient */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-500/[0.02] group-hover:to-blue-500/[0.02] transition-all"></div>
                  
                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`relative p-3 rounded-xl bg-gradient-to-br ${typeColors[op.operation_type] || 'from-gray-500 to-gray-600'} shadow-lg group-hover:scale-110 transition-transform`}>
                          <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                          <span className="absolute -bottom-1 -right-1 text-lg">
                            {typeEmojis[op.operation_type] || '📋'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                            {op.operation_code}
                          </h3>
                          <p className="text-base text-slate-500 mt-0.5">
                            {typeLabels[op.operation_type] || op.operation_type}
                          </p>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ring-1 ring-inset ${statusColors[op.status] || 'bg-slate-100 text-slate-600 ring-gray-600/20'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDots[op.status] || 'bg-gray-500'}`}></span>
                        {statusLabels[op.status] || op.status}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2 text-base text-slate-500">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{op.site_name || op.site?.name || 'Non assigné'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-base text-slate-500">
                        <CalendarDaysIcon className="h-4 w-4" />
                        <span>{new Date(op.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      {op.quantity_extracted && (
                        <div className="flex items-center gap-2 text-base text-slate-500">
                          <CubeIcon className="h-4 w-4" />
                          <span>{Number(op.quantity_extracted).toLocaleString('fr-FR')} tonnes</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-5 w-5 ${op.status === 'COMPLETED' ? 'text-emerald-500' : op.status === 'IN_PROGRESS' ? 'text-amber-500' : 'text-indigo-500'}`} />
                        <span className="text-sm text-slate-500">
                          {op.status === 'COMPLETED' ? 'Terminée' : op.status === 'IN_PROGRESS' ? 'En cours' : 'À venir'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/operations/${op.id}`);
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
                                navigate(`/operations/${op.id}/edit`);
                              }}
                              className="p-2 rounded-lg text-indigo-500 hover:text-blue-700 hover:bg-indigo-50 transition-colors"
                              title="Modifier"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(op.id, op.operation_code, e)}
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
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Opération
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
                      Quantité (T)
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
                  {operations.map((op) => (
                    <tr 
                      key={op.id} 
                      onClick={() => navigate(`/operations/${op.id}`)}
                      className="hover:bg-indigo-50/30 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${typeColors[op.operation_type] || 'from-gray-500 to-gray-600'} shadow-md`}>
                            <ClipboardDocumentListIcon className="h-5 w-5 text-white" />
                          </div>
                          <div className="font-medium text-slate-800">{op.operation_code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-2 text-base text-slate-800">
                          <span>{typeEmojis[op.operation_type]}</span>
                          {typeLabels[op.operation_type] || op.operation_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-base text-slate-500">
                          <MapPinIcon className="h-4 w-4" />
                          {op.site_name || op.site?.name || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-slate-500">
                        {new Date(op.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-slate-800">
                        {op.quantity_extracted ? Number(op.quantity_extracted).toLocaleString('fr-FR') : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ring-1 ring-inset ${statusColors[op.status] || 'bg-slate-100 text-slate-600 ring-gray-600/20'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDots[op.status] || 'bg-gray-500'}`}></span>
                          {statusLabels[op.status] || op.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/operations/${op.id}`);
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
                                  navigate(`/operations/${op.id}/edit`);
                                }}
                                className="p-2 rounded-lg text-indigo-500 hover:text-blue-700 hover:bg-indigo-50 transition-colors"
                                title="Modifier"
                              >
                                <PencilSquareIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(op.id, op.operation_code, e)}
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
    </div>
  );
}
