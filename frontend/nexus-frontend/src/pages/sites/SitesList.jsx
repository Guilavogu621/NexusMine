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
    <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-slate-50 via-blue-50/20 to-slate-100 pb-12">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative space-y-8 pb-12 px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Premium */}
        <div className="group relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 via-blue-600 to-indigo-700 shadow-2xl animate-fadeInDown">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="sitesGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
              <rect width="100" height="100" fill="url(#sitesGrid)" />
            </svg>
          </div>

          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500"></div>

          <div className="relative p-8 px-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start gap-6">
                <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-xl ring-1 ring-white/30">
                  <MapPinIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight font-outfit">
                    Sites Miniers
                  </h1>
                  <p className="mt-2 text-blue-100 font-medium opacity-90">
                    Gérez et surveillez l'ensemble de vos périmètres d'exploitation
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/sites/map"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl font-bold shadow-lg hover:bg-white hover:text-indigo-700 transition-all duration-300"
                >
                  <GlobeAltIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">Vue Carte</span>
                </Link>
                {isAdmin() && (
                  <Link
                    to="/sites/new"
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white text-indigo-700 rounded-xl font-bold shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Nouveau site
                  </Link>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
              {[
                { label: 'Total Sites', value: stats.total, icon: MapPinIcon },
                { label: 'En Exploitation', value: stats.active, icon: ArrowTrendingUpIcon },
                { label: 'En Exploration', value: stats.exploration, icon: CubeIcon },
                { label: 'Suspendus', value: stats.suspended, icon: ListBulletIcon },
              ].map((stat, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 group/stat">
                  <div className="flex items-center gap-3 mb-2">
                    <stat.icon className="h-4 w-4 text-blue-200" />
                    <p className="text-xs font-bold text-blue-100 uppercase tracking-widest">{stat.label}</p>
                  </div>
                  <p className="text-3xl font-bold text-white font-outfit tracking-tight">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-lg hover:shadow-xl transition-all duration-500">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, localisation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200/60 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded-xl py-3 px-4 bg-white/50 border border-slate-200/60 focus:bg-white transition-all font-medium appearance-none min-w-[180px]"
              >
                <option value="">🏢 Tous les types</option>
                {Object.entries(siteTypeLabels).map(([v, l]) => <option key={v} value={v}>{siteTypeIcons[v]} {l}</option>)}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl py-3 px-4 bg-white/50 border border-slate-200/60 focus:bg-white transition-all font-medium appearance-none min-w-[180px]"
              >
                <option value="">📊 Tous les statuts</option>
                {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>

            <div className="flex bg-slate-100 rounded-lg p-1">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-100 p-6 animate-pulse shadow-sm">
                <div className="h-40 bg-slate-200 rounded-2xl mb-4"></div>
                <div className="h-6 bg-slate-200 rounded-lg w-3/4 mb-3"></div>
                <div className="h-4 bg-slate-100 rounded-md w-1/2"></div>
              </div>
            ))}
          </div>
        ) : sites.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/40 p-20 text-center animate-fadeInUp shadow-lg">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-indigo-500 blur-[80px] opacity-10"></div>
              <div className="relative w-28 h-28 bg-linear-to-br from-indigo-50 to-blue-50 rounded-3xl flex items-center justify-center border border-white/60 shadow-inner">
                <MapPinIcon className="h-14 w-14 text-indigo-300" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Aucun site trouvé</h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto mb-10 leading-relaxed text-lg">
              Affinez vos filtres ou commencez par ajouter un nouveau site minier.
            </p>
            {isAdmin() && (
              <Link
                to="/sites/new"
                className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl"
              >
                <PlusIcon className="h-6 w-6 text-indigo-400" />
                Ajouter un site
              </Link>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInUp">
            {sites.map((site, idx) => (
              <div
                key={site.id}
                onClick={() => navigate(`/sites/${site.id}`)}
                className="group relative bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 p-6 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${statusDots[site.status] || 'bg-slate-400'} opacity-80`}></div>

                <div className="flex items-center gap-5 mb-6">
                  <div className="relative w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-600 to-blue-700 shadow-lg flex items-center justify-center group-hover:rotate-6 transition-transform duration-500 ring-4 ring-white">
                    <span className="text-2xl">{siteTypeIcons[site.site_type] || '📍'}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                      {site.name}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 truncate">{siteTypeLabels[site.site_type]}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${statusColors[site.status] || 'bg-slate-100 text-slate-600'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDots[site.status] || 'bg-gray-500'}`}></span>
                    {statusLabels[site.status]}
                  </span>
                </div>

                <div className="space-y-3 py-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <MapPinIcon className="h-4 w-4 text-rose-500" />
                    <span className="truncate">{site.location || 'Coordonnées non définies'}</span>
                  </div>
                  {site.description && (
                    <p className="text-sm text-slate-500 line-clamp-2 italic">
                      {site.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-50">
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/sites/${site.id}`); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  {isAdmin() && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/sites/${site.id}/edit`); }} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all">
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      <button onClick={(e) => handleDelete(site.id, site.name, e)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 shadow-lg overflow-hidden animate-fadeInUp">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Site</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Localisation</th>
                    <th className="px-6 py-5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sites.map((site) => (
                    <tr key={site.id} onClick={() => navigate(`/sites/${site.id}`)} className="hover:bg-slate-50/50 cursor-pointer transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-xl shadow-sm">
                            {siteTypeIcons[site.site_type]}
                          </div>
                          <div className="font-bold text-slate-900">{site.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">{siteTypeLabels[site.site_type]}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${statusColors[site.status] || 'bg-slate-100 text-slate-600'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDots[site.status] || 'bg-gray-500'}`}></span>
                          {statusLabels[site.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                          <MapPinIcon className="h-4 w-4 text-slate-400" />
                          {site.location || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/sites/${site.id}`); }} className="p-2 text-indigo-600 hover:bg-white rounded-lg shadow-sm">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {isAdmin() && (
                            <>
                              <button onClick={(e) => { e.stopPropagation(); navigate(`/sites/${site.id}/edit`); }} className="p-2 text-amber-600 hover:bg-white rounded-lg shadow-sm">
                                <PencilSquareIcon className="h-4 w-4" />
                              </button>
                              <button onClick={(e) => handleDelete(site.id, site.name, e)} className="p-2 text-red-600 hover:bg-white rounded-lg shadow-sm">
                                <TrashIcon className="h-4 w-4" />
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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
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
        .animate-fadeInUp { animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; }
        
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'%3E%3C/path%3E%3C/svg%3E");
          background-position: right 0.75rem center;
          background-repeat: no-repeat;
          background-size: 1.25em 1.25em;
        }
      `}</style>
    </div>
  );
}
