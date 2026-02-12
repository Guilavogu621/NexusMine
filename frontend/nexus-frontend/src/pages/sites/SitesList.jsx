import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  MapPinIcon,
  GlobeAltIcon,
  ChevronDownIcon,
  BuildingOffice2Icon,
  UsersIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const siteTypeLabels = {
  OPEN_PIT: 'Ciel ouvert',
  UNDERGROUND: 'Souterrain',
  ALLUVIAL: 'Alluvionnaire',
  MIXED: 'Mixte',
};

const siteTypeIcons = {
  OPEN_PIT: '🏔️',
  UNDERGROUND: '⛏️',
  ALLUVIAL: '🏞️',
  MIXED: '🔄',
};

const statusLabels = {
  ACTIVE: 'En exploitation',
  SUSPENDED: 'Suspendu',
  CLOSED: 'Fermé',
  EXPLORATION: 'En exploration',
};

const statusColors = {
  ACTIVE: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  SUSPENDED: 'bg-amber-100 text-amber-700 ring-amber-600/20',
  CLOSED: 'bg-red-100 text-red-700 ring-red-600/20',
  EXPLORATION: 'bg-indigo-50 text-indigo-700 ring-blue-600/20',
};

const statusDots = {
  ACTIVE: 'bg-emerald-500',
  SUSPENDED: 'bg-amber-500',
  CLOSED: 'bg-red-500',
  EXPLORATION: 'bg-indigo-500',
};

export default function SitesList() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const { isAdmin } = useAuthStore();
  const navigate = useNavigate();

  // Stats calculées
  const stats = {
    total: sites.length,
    active: sites.filter(s => s.status === 'ACTIVE').length,
    exploration: sites.filter(s => s.status === 'EXPLORATION').length,
    suspended: sites.filter(s => s.status === 'SUSPENDED').length,
  };

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

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
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
        {/* Premium Header */}
        <div className="relative overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200/60">
          <div className="relative p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative p-4 rounded-xl bg-indigo-600 shadow-lg">
                  <MapPinIcon className="h-7 w-7 text-white relative" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-semibold text-slate-800">Sites Miniers</h1>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-50 text-indigo-700">
                      {sites.length} sites
                    </span>
                  </div>
                  <p className="mt-1 text-slate-500">Gérez et surveillez tous vos sites miniers</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Map button */}
                <Link
                  to="/sites/map"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-600 rounded-lg font-medium border border-gray-300 hover:bg-slate-50 transition-all"
                >
                  <GlobeAltIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">Carte</span>
                </Link>
                
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
                
                {isAdmin() && (
                  <Link
                    to="/sites/new"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-base font-semibold text-white shadow-sm"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Nouveau site
                  </Link>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200/60">
              <div className="text-center p-3 rounded-lg bg-gray-50">
                <p className="text-xl font-semibold text-slate-800">{stats.total}</p>
                <p className="text-base text-slate-500">Total sites</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50">
                <p className="text-xl font-semibold text-green-600">{stats.active}</p>
                <p className="text-base text-slate-500">En exploitation</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50">
                <p className="text-xl font-semibold text-indigo-600">{stats.exploration}</p>
                <p className="text-base text-slate-500">En exploration</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50">
                <p className="text-xl font-semibold text-orange-600">{stats.suspended}</p>
                <p className="text-base text-slate-500">Suspendus</p>
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
                placeholder="Rechercher par nom, localisation..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-0 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="appearance-none w-full lg:w-48 pl-4 pr-10 py-3 bg-slate-50 border-0 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                <option value="">Tous les types</option>
                <option value="OPEN_PIT">🏔️ Ciel ouvert</option>
                <option value="UNDERGROUND">⛏️ Souterrain</option>
                <option value="ALLUVIAL">🏞️ Alluvionnaire</option>
                <option value="MIXED">🔄 Mixte</option>
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none w-full lg:w-48 pl-4 pr-10 py-3 bg-slate-50 border-0 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                <option value="">Tous les statuts</option>
                <option value="ACTIVE">En exploitation</option>
                <option value="SUSPENDED">Suspendu</option>
                <option value="CLOSED">Fermé</option>
                <option value="EXPLORATION">En exploration</option>
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
        ) : sites.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                  <MapPinIcon className="h-10 w-10 text-slate-400" />
                </div>
              </div>
              <h3 className="mt-6 text-base font-semibold text-slate-800">Aucun site trouvé</h3>
              <p className="mt-2 text-base text-slate-500 text-center max-w-sm">
                Commencez par ajouter votre premier site minier pour démarrer.
              </p>
              {isAdmin() && (
                <Link
                  to="/sites/new"
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-sm"
                >
                  <PlusIcon className="h-5 w-5" />
                  Ajouter un site
                </Link>
              )}
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sites.map((site) => (
              <div
                key={site.id}
                onClick={() => navigate(`/sites/${site.id}`)}
                className="group relative bg-white rounded-2xl border border-slate-200/60 p-5 hover:shadow-md hover:border-indigo-200 transition-all duration-300 cursor-pointer"
              >
                {/* Hover gradient */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/[0.02] group-hover:to-purple-500/[0.02] transition-all"></div>
                
                <div className="relative">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="relative p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:scale-110 transition-transform">
                        <MapPinIcon className="h-6 w-6 text-white" />
                        <span className="absolute -bottom-1 -right-1 text-lg">
                          {siteTypeIcons[site.site_type] || '📍'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {site.name}
                        </h3>
                        <p className="text-base text-slate-500 mt-0.5">
                          {siteTypeLabels[site.site_type] || site.site_type}
                        </p>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ring-1 ring-inset ${statusColors[site.status] || 'bg-slate-100 text-slate-600 ring-gray-600/20'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDots[site.status] || 'bg-gray-500'}`}></span>
                      {statusLabels[site.status] || site.status}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-base text-slate-500 mb-4 pb-4 border-b border-slate-100">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{site.location || 'Non spécifié'}</span>
                  </div>

                  {/* Description */}
                  {site.description && (
                    <p className="text-base text-slate-500 line-clamp-2 mb-4">
                      {site.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3">
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      {site.created_at && (
                        <span>Créé le {new Date(site.created_at).toLocaleDateString('fr-FR')}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/sites/${site.id}`);
                        }}
                        className="p-2 rounded-lg text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Voir"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {isAdmin() && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/sites/${site.id}/edit`);
                            }}
                            className="p-2 rounded-lg text-indigo-500 hover:text-blue-700 hover:bg-indigo-50 transition-colors"
                            title="Modifier"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(site.id, site.name, e)}
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
                      Site
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Localisation
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sites.map((site) => (
                    <tr 
                      key={site.id} 
                      onClick={() => navigate(`/sites/${site.id}`)}
                      className="hover:bg-indigo-50/30 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                            <MapPinIcon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-800">{site.name}</div>
                            {site.description && (
                              <div className="text-base text-slate-500 truncate max-w-xs">
                                {site.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-2 text-base text-slate-800">
                          <span>{siteTypeIcons[site.site_type]}</span>
                          {siteTypeLabels[site.site_type] || site.site_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ring-1 ring-inset ${statusColors[site.status] || 'bg-slate-100 text-slate-600 ring-gray-600/20'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDots[site.status] || 'bg-gray-500'}`}></span>
                          {statusLabels[site.status] || site.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <MapPinIcon className="h-4 w-4" />
                          {site.location || 'Non spécifié'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/sites/${site.id}`);
                            }}
                            className="p-2 rounded-lg text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Voir"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          {isAdmin() && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/sites/${site.id}/edit`);
                                }}
                                className="p-2 rounded-lg text-indigo-500 hover:text-blue-700 hover:bg-indigo-50 transition-colors"
                                title="Modifier"
                              >
                                <PencilSquareIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(site.id, site.name, e)}
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
