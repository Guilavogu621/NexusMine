import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPinIcon,
  BuildingOffice2Icon,
  FunnelIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import GuineaMap from '../../components/maps/GuineaMap';

const statusLabels = {
  ACTIVE: 'En exploitation',
  SUSPENDED: 'Suspendu',
  CLOSED: 'Fermé',
  EXPLORATION: 'En exploration',
};

const statusColors = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  SUSPENDED: 'bg-amber-100 text-amber-700',
  CLOSED: 'bg-red-100 text-red-700',
  EXPLORATION: 'bg-indigo-50 text-indigo-700',
};

const typeLabels = {
  OPEN_PIT: 'Ciel ouvert',
  UNDERGROUND: 'Souterrain',
  ALLUVIAL: 'Alluvionnaire',
  MIXED: 'Mixte',
};

const typeEmojis = {
  OPEN_PIT: '🏔️',
  UNDERGROUND: '⛏️',
  ALLUVIAL: '🏞️',
  MIXED: '🔄',
};

export default function SitesMap() {
  const [sites, setSites] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    fetchSites();
    fetchAssets();

    // Polling toutes les 5 secondes pour le "temps réel"
    const interval = setInterval(() => {
      fetchAssets();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await api.get('/equipment/');
      // On ne garde que ceux qui ont une position
      const equipment = response.data.results || response.data;
      setAssets(equipment.filter(a => a.last_latitude && a.last_longitude));
    } catch (error) {
      console.error('Erreur lors du chargement des équipements:', error);
    }
  };

  const fetchSites = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sites/');
      setSites(response.data.results || response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des sites:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les sites
  const filteredSites = sites.filter(site => {
    const matchesSearch = !search ||
      site.name.toLowerCase().includes(search.toLowerCase()) ||
      site.location?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !filterStatus || site.status === filterStatus;
    const matchesType = !filterType || site.site_type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Sites avec coordonnées
  const sitesWithCoords = filteredSites.filter(s => s.latitude && s.longitude);
  const sitesWithoutCoords = filteredSites.filter(s => !s.latitude || !s.longitude);

  // Stats
  const stats = {
    total: sites.length,
    withCoords: sites.filter(s => s.latitude && s.longitude).length,
    active: sites.filter(s => s.status === 'ACTIVE').length,
    exploration: sites.filter(s => s.status === 'EXPLORATION').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header Premium */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 shadow-2xl mx-4 mt-4 mb-6">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="mapGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#mapGrid)" />
          </svg>
        </div>
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>

        <div className="relative px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <MapPinIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white">Carte Interactive</h1>
                <p className="mt-1 text-blue-100">
                  Visualisez tous les sites miniers de Guinée
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchSites}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all"
              >
                <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
              <Link
                to="/sites"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all"
              >
                <Squares2X2Icon className="h-5 w-5" />
                Vue liste
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-blue-100">Total sites</p>
              <p className="text-xl font-semibold text-white">{stats.total}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-blue-100">🚛 Camions/Trains</p>
              <p className="text-xl font-semibold text-white">{assets.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-blue-100">🏭 En exploitation</p>
              <p className="text-xl font-semibold text-white">{stats.active}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-blue-100">🔍 En exploration</p>
              <p className="text-xl font-semibold text-white">{stats.exploration}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-8">
        <div className="flex gap-6">
          {/* Sidebar des sites */}
          <div className={`transition-all duration-300 ${showSidebar ? 'w-96' : 'w-0 overflow-hidden'}`}>
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 h-[calc(100vh-320px)] flex flex-col">
              {/* Header sidebar */}
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">Sites miniers</h3>
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">
                    {filteredSites.length} sites
                  </span>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher un site..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border-0 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Tous statuts</option>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border-0 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Tous types</option>
                    {Object.entries(typeLabels).map(([key, label]) => (
                      <option key={key} value={key}>{typeEmojis[key]} {label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Liste des sites */}
              <div className="flex-1 overflow-y-auto p-2">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="w-8 h-8 border-3 border-indigo-200 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sitesWithCoords.map((site) => (
                      <button
                        key={site.id}
                        onClick={() => setSelectedSite(site)}
                        className={`w-full p-3 rounded-xl text-left transition-all ${selectedSite?.id === site.id
                          ? 'bg-indigo-50 ring-2 ring-indigo-500'
                          : 'bg-slate-50 hover:bg-slate-100'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{typeEmojis[site.site_type] || '📍'}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-800 text-sm truncate">
                              {site.name}
                            </h4>
                            <p className="text-xs text-slate-500 truncate">{site.location}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {site.incidents_count > 0 ? (
                                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700 animate-pulse">
                                  Incident Ouvert ({site.incidents_count})
                                </span>
                              ) : (
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[site.status]}`}>
                                  {statusLabels[site.status]}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400">
                                {parseFloat(site.latitude).toFixed(3)}°, {parseFloat(site.longitude).toFixed(3)}°
                              </span>
                            </div>
                          </div>
                          <ChevronRightIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        </div>
                      </button>
                    ))}

                    {/* Sites sans coordonnées */}
                    {sitesWithoutCoords.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-200/60">
                        <p className="text-xs text-slate-500 mb-2 px-2">
                          ⚠️ Sites sans coordonnées ({sitesWithoutCoords.length})
                        </p>
                        {sitesWithoutCoords.map((site) => (
                          <div
                            key={site.id}
                            className="w-full p-3 rounded-xl bg-gray-50/50 opacity-60"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-xl opacity-50">{typeEmojis[site.site_type] || '📍'}</span>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-slate-600 text-sm truncate">
                                  {site.name}
                                </h4>
                                <p className="text-xs text-slate-400 truncate">{site.location}</p>
                                <Link
                                  to={`/sites/${site.id}/edit`}
                                  className="text-[10px] text-indigo-600 hover:underline"
                                >
                                  Ajouter les coordonnées →
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Carte */}
          <div className="flex-1 relative">
            {/* Toggle sidebar */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="absolute top-4 left-4 z-[1001] p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              {showSidebar ? (
                <XMarkIcon className="h-5 w-5 text-slate-500" />
              ) : (
                <FunnelIcon className="h-5 w-5 text-slate-500" />
              )}
            </button>

            <GuineaMap
              sites={sitesWithCoords}
              assets={assets}
              height="calc(100vh - 320px)"
              selectedSite={selectedSite}
              onSiteClick={setSelectedSite}
              showRegions={true}
              showBorder={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
