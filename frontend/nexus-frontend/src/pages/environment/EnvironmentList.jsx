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
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

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
  AIR_QUALITY: { bg: 'bg-sky-100', text: 'text-sky-700' },
  WATER_QUALITY: { bg: 'bg-blue-100', text: 'text-blue-700' },
  NOISE_LEVEL: { bg: 'bg-purple-100', text: 'text-purple-700' },
  DUST_LEVEL: { bg: 'bg-amber-100', text: 'text-amber-700' },
  PH_LEVEL: { bg: 'bg-pink-100', text: 'text-pink-700' },
  TEMPERATURE: { bg: 'bg-red-100', text: 'text-red-700' },
  HUMIDITY: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  OTHER: { bg: 'bg-slate-100', text: 'text-slate-600' },
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

  return (
    <div className="space-y-6 pb-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 shadow-2xl">
        {/* Background pattern */}
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
        
        {/* Gradient orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-indigo-400 opacity-10 blur-3xl"></div>
        
        <div className="relative px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <BeakerIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white">Environnement</h1>
                <p className="mt-1 text-indigo-100">
                  Données environnementales de vos sites miniers
                </p>
              </div>
            </div>
            {hasRole(['ADMIN', 'SUPERVISOR', 'OPERATOR']) && (
              <Link
                to="/environment/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-xl font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <PlusIcon className="h-5 w-5" />
                Nouvelle mesure
              </Link>
            )}
          </div>
          
          {/* Stats row */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-base text-indigo-100">Total mesures</p>
              <p className="text-xl font-semibold text-white">{data.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-base text-indigo-100">💨 Air</p>
              <p className="text-xl font-semibold text-white">{data.filter(d => d.data_type === 'AIR_QUALITY').length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-base text-indigo-100">💧 Eau</p>
              <p className="text-xl font-semibold text-white">{data.filter(d => d.data_type === 'WATER_QUALITY').length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-base text-indigo-100">🌡️ Température</p>
              <p className="text-xl font-semibold text-white">{data.filter(d => d.data_type === 'TEMPERATURE').length}</p>
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
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-xl border-0 py-3 pl-11 pr-4 text-slate-800 ring-1 ring-inset ring-gray-300 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 sm:text-sm bg-slate-50 font-medium"
            />
          </div>

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
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="block w-full rounded-xl border-0 py-3 px-4 text-slate-800 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-500 sm:text-sm bg-slate-50 font-medium"
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

      {/* Data Grid */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600 mx-auto"></div>
                <SparklesIcon className="h-5 w-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="mt-4 text-slate-500 font-medium">Chargement des données...</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="p-4 bg-indigo-100 rounded-full mb-4">
              <BeakerIcon className="h-12 w-12 text-indigo-600" />
            </div>
            <p className="text-xl font-semibold text-slate-800">Aucune donnée</p>
            <p className="text-slate-500 mt-1">Aucune mesure ne correspond à vos critères</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {data.map((item, index) => {
              const typeConf = typeColors[item.data_type] || typeColors.OTHER;
              
              return (
                <div
                  key={item.id}
                  className="bg-slate-50 rounded-2xl p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-200 border border-slate-200/60"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{typeEmojis[item.data_type] || '📊'}</span>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-semibold ${typeConf.bg} ${typeConf.text}`}>
                          {typeLabels[item.data_type] || item.data_type}
                        </span>
                        <p className="text-sm text-slate-500 mt-1">
                          {item.site_name || item.site?.name || 'Site non défini'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center py-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl mb-4">
                    <p className="text-2xl font-semibold text-indigo-700">
                      {Number(item.value).toLocaleString('fr-FR')}
                    </p>
                    <p className="text-base font-medium text-indigo-600">{item.unit}</p>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-base">
                      <span className="text-slate-500">📅 Date</span>
                      <span className="font-medium text-slate-800">
                        {new Date(item.measurement_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    {item.location_details && (
                      <div className="flex items-center justify-between text-base">
                        <span className="text-slate-500">📍 Lieu</span>
                        <span className="font-medium text-slate-800 truncate max-w-32">
                          {item.location_details}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-slate-200/60">
                    <Link
                      to={`/environment/${item.id}`}
                      className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                      title="Voir"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Link>
                    {isSupervisor() && (
                      <>
                        <Link
                          to={`/environment/${item.id}/edit`}
                          className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200"
                          title="Modifier"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
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
