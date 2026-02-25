import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  BeakerIcon,
  SparklesIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';
import { formatDateFR } from '../../utils/translationUtils';

const typeLabels = {
  AIR_QUALITY: 'Qualité de l\'air',
  WATER_QUALITY: 'Qualité de l\'eau',
  NOISE_LEVEL: 'Niveau sonore',
  DUST_LEVEL: 'Niveau de poussière',
  PH_LEVEL: 'Niveau pH',
  TEMPERATURE: 'Température',
  HUMIDITY: 'Humidité',
  OTHER: 'Autre',
};

const typeEmojis = {
  AIR_QUALITY: '💨',
  WATER_QUALITY: '💧',
  NOISE_LEVEL: '🔊',
  DUST_LEVEL: '🌫️',
  PH_LEVEL: '⚗️',
  TEMPERATURE: '🌡️',
  HUMIDITY: '💦',
  OTHER: '📊',
};

const typeColors = {
  AIR_QUALITY: { bg: 'bg-sky-100/80', text: 'text-sky-700', gradient: 'from-sky-500 to-sky-600', badge: 'bg-sky-200 text-sky-800' },
  WATER_QUALITY: { bg: 'bg-blue-100/80', text: 'text-blue-700', gradient: 'from-blue-500 to-blue-600', badge: 'bg-blue-200 text-blue-800' },
  NOISE_LEVEL: { bg: 'bg-purple-100/80', text: 'text-purple-700', gradient: 'from-purple-500 to-purple-600', badge: 'bg-purple-200 text-purple-800' },
  DUST_LEVEL: { bg: 'bg-amber-100/80', text: 'text-amber-700', gradient: 'from-amber-500 to-amber-600', badge: 'bg-amber-200 text-amber-800' },
  PH_LEVEL: { bg: 'bg-pink-100/80', text: 'text-pink-700', gradient: 'from-pink-500 to-pink-600', badge: 'bg-pink-200 text-pink-800' },
  TEMPERATURE: { bg: 'bg-red-100/80', text: 'text-red-700', gradient: 'from-red-500 to-red-600', badge: 'bg-red-200 text-red-800' },
  HUMIDITY: { bg: 'bg-cyan-100/80', text: 'text-cyan-700', gradient: 'from-cyan-500 to-cyan-600', badge: 'bg-cyan-200 text-cyan-800' },
  OTHER: { bg: 'bg-slate-100/80', text: 'text-slate-700', gradient: 'from-slate-500 to-slate-600', badge: 'bg-slate-200 text-slate-800' },
};

export default function EnvironmentList() {
  const [data, setData] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const { isSupervisor, hasRole } = useAuthStore();

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterType) params.append('data_type', filterType);
      if (filterSite) params.append('site', filterSite);

      const [envRes, sitesRes] = await Promise.all([
        api.get(`/environmental-data/?${params.toString()}`),
        api.get('/sites/'),
      ]);

      setData(envRes.data.results || envRes.data);
      setSites(sitesRes.data.results || sitesRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, filterType, filterSite]);

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette mesure ?')) {
      return;
    }
    try {
      await api.delete(`/environmental-data/${id}/`);
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setFilterSite('');
    setFilterType('');
  };

  const hasActiveFilters = search || filterSite || filterType;

  const stats = {
    total: data.length,
    air: data.filter(d => d.data_type === 'AIR_QUALITY').length,
    water: data.filter(d => d.data_type === 'WATER_QUALITY').length,
    temperature: data.filter(d => d.data_type === 'TEMPERATURE').length,
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/20 to-slate-100 relative">
      {/* Background pattern */}
      <div className="fixed inset-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.05),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(16,185,129,0.05),transparent_50%)]"></div>
      </div>

      <div className="relative space-y-8 pb-12 px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Premium */}
        <div className="group relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 via-blue-600 to-purple-600 shadow-2xl animate-fadeInDown">
          {/* SVG Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="envListGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
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
                  <BeakerIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                    Environnement
                  </h1>
                  <p className="mt-2 text-blue-100 font-medium">
                    Données environnementales de vos sites miniers
                  </p>
                </div>
              </div>

              {hasRole(['ADMIN', 'SUPERVISOR', 'OPERATOR']) && (
                <Link
                  to="/environment/new"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-white text-indigo-700 rounded-xl font-bold shadow-lg hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-1 transition-all duration-300 shrink-0"
                >
                  <PlusIcon className="h-5 w-5" />
                  Nouvelle mesure
                </Link>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-2">Total mesures</p>
                <p className="text-3xl font-bold text-white font-outfit">{stats.total}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-2">💨 Qualité Air</p>
                <p className="text-3xl font-bold text-white font-outfit">{stats.air}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-2">💧 Qualité Eau</p>
                <p className="text-3xl font-bold text-white font-outfit">{stats.water}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-2">🌡️ Température</p>
                <p className="text-3xl font-bold text-white font-outfit">{stats.temperature}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-lg hover:shadow-xl hover:border-white/40 transition-all duration-500 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

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
                  placeholder="Rechercher une mesure..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full rounded-xl py-3 pl-12 pr-4 text-slate-900 bg-white/50 border border-slate-200/60 placeholder:text-slate-500 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 font-medium"
                />
              </div>

              {/* Selects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <option value="">🧪 Tous les types</option>
                  <option value="AIR_QUALITY">💨 Qualité de l'air</option>
                  <option value="WATER_QUALITY">💧 Qualité de l'eau</option>
                  <option value="NOISE_LEVEL">🔊 Niveau sonore</option>
                  <option value="DUST_LEVEL">🌫️ Niveau de poussière</option>
                  <option value="PH_LEVEL">⚗️ Niveau pH</option>
                  <option value="TEMPERATURE">🌡️ Température</option>
                  <option value="HUMIDITY">💦 Humidité</option>
                  <option value="OTHER">📊 Autre</option>
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
        ) : data.length === 0 ? (
          <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-12 shadow-lg flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="p-4 bg-indigo-100 rounded-full mb-6 inline-block">
                <BeakerIcon className="h-12 w-12 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Aucune mesure</h3>
              <p className="text-slate-600 mb-6">Aucune donnée ne correspond à vos critères de recherche</p>
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
            {data.map((item, index) => {
              const typeConf = typeColors[item.data_type] || typeColors.OTHER;

              return (
                <div
                  key={item.id}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 hover:border-white/40 p-6 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Gradient accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${typeConf.gradient}`}></div>

                  {/* Hover gradient background */}
                  <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-3xl">{typeEmojis[item.data_type] || '📊'}</span>
                        <div className="min-w-0 flex-1">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${typeConf.badge}`}>
                            {typeLabels[item.data_type] || item.data_type}
                          </span>
                          <p className="text-sm text-slate-500 mt-2 font-medium truncate">
                            {item.site_name || item.site?.name || 'Site non défini'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Value Display */}
                    <div className={`text-center py-5 bg-linear-to-r ${typeConf.gradient} rounded-xl mb-4 shadow-sm group-hover:shadow-md transition-shadow`}>
                      <p className="text-3xl font-bold text-white font-outfit">
                        {Number(item.value).toLocaleString('fr-FR')}
                      </p>
                      <p className="text-sm font-semibold text-white/90 mt-1">{item.unit}</p>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50">
                        <span className="text-sm text-slate-500">📅 Date</span>
                        <span className="text-sm font-bold text-slate-900">
                          {formatDateFR(item.measurement_date)}
                        </span>
                      </div>
                      {item.location_details && (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50">
                          <span className="text-sm text-slate-500">📍 Lieu</span>
                          <span className="text-sm font-bold text-slate-900 truncate ml-2 max-w-32 text-right">
                            {item.location_details}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200/60">
                      <Link
                        to={`/environment/${item.id}`}
                        className="p-2 rounded-lg bg-blue-100/80 text-blue-600 hover:bg-blue-200 transition-all duration-200"
                        title="Voir"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      {isSupervisor() && (
                        <>
                          <Link
                            to={`/environment/${item.id}/edit`}
                            className="p-2 rounded-lg bg-amber-100/80 text-amber-600 hover:bg-amber-200 transition-all duration-200"
                            title="Modifier"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
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