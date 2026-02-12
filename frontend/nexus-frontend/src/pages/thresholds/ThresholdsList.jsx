import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const dataTypeLabels = {
  AIR_QUALITY: 'Qualité de l\'air',
  WATER_QUALITY: 'Qualité de l\'eau',
  NOISE_LEVEL: 'Niveau sonore',
  DUST_LEVEL: 'Niveau de poussière',
  PH_LEVEL: 'Niveau pH',
  TEMPERATURE: 'Température',
  HUMIDITY: 'Humidité',
  CO2_LEVEL: 'Niveau CO2',
  PARTICULATE_MATTER: 'Particules fines',
  OTHER: 'Autre',
};

const dataTypeEmojis = {
  AIR_QUALITY: '💨',
  WATER_QUALITY: '💧',
  NOISE_LEVEL: '🔊',
  DUST_LEVEL: '🌫️',
  PH_LEVEL: '⚗️',
  TEMPERATURE: '🌡️',
  HUMIDITY: '💦',
  CO2_LEVEL: '☁️',
  PARTICULATE_MATTER: '🔬',
  OTHER: '📊',
};

const thresholdTypeLabels = {
  REGULATORY: 'Réglementaire',
  INTERNAL: 'Interne',
  WARNING: 'Avertissement',
};

const thresholdTypeColors = {
  REGULATORY: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  INTERNAL: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-indigo-200' },
  WARNING: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
};

export default function ThresholdsList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDataType, setFilterDataType] = useState('');
  const [filterThresholdType, setFilterThresholdType] = useState('');
  const [sites, setSites] = useState([]);
  const { isAdmin, isSupervisor } = useAuthStore();

  const canManage = isAdmin() || isSupervisor();

  useEffect(() => {
    fetchData();
    fetchSites();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/environmental-thresholds/');
      setData(response.data.results || response.data);
    } catch (err) {
      setError('Erreur lors du chargement des seuils');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      const response = await api.get('/sites/');
      setSites(response.data.results || response.data);
    } catch (err) {
      console.error('Erreur chargement sites:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce seuil ?')) return;
    try {
      await api.delete(`/environmental-thresholds/${id}/`);
      setData(data.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const getSiteName = (siteId) => {
    const site = sites.find(s => s.id === siteId);
    return site ? site.name : 'Global';
  };

  const filteredData = data.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDataType = !filterDataType || item.data_type === filterDataType;
    const matchesThresholdType = !filterThresholdType || item.threshold_type === filterThresholdType;
    return matchesSearch && matchesDataType && matchesThresholdType;
  });

  // Stats
  const stats = {
    total: data.length,
    regulatory: data.filter(d => d.threshold_type === 'REGULATORY').length,
    internal: data.filter(d => d.threshold_type === 'INTERNAL').length,
    warning: data.filter(d => d.threshold_type === 'WARNING').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <AdjustmentsHorizontalIcon className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-semibold">Seuils Environnementaux</h1>
            </div>
            <p className="text-teal-100">Configuration des limites d'alerte pour les mesures environnementales</p>
          </div>
          
          {canManage && (
            <Link
              to="/thresholds/new"
              className="inline-flex items-center gap-2 bg-white text-teal-700 px-6 py-3 rounded-xl font-semibold hover:bg-teal-50 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <PlusIcon className="h-5 w-5" />
              Nouveau seuil
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/60">
          <div className="text-xl font-semibold text-slate-800">{stats.total}</div>
          <div className="text-base text-slate-500">Total seuils</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-red-100">
          <div className="text-xl font-semibold text-red-600">{stats.regulatory}</div>
          <div className="text-base text-slate-500">Réglementaires</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
          <div className="text-xl font-semibold text-indigo-600">{stats.internal}</div>
          <div className="text-base text-slate-500">Internes</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-100">
          <div className="text-xl font-semibold text-amber-600">{stats.warning}</div>
          <div className="text-base text-slate-500">Avertissements</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un seuil..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200/60 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterDataType}
              onChange={(e) => setFilterDataType(e.target.value)}
              className="px-4 py-2.5 border border-slate-200/60 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Tous les types de mesure</option>
              {Object.entries(dataTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select
              value={filterThresholdType}
              onChange={(e) => setFilterThresholdType(e.target.value)}
              className="px-4 py-2.5 border border-slate-200/60 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Tous les types de seuil</option>
              {Object.entries(thresholdTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-2">
          <ExclamationTriangleIcon className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* List */}
      <div className="grid gap-4">
        {filteredData.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <AdjustmentsHorizontalIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800">Aucun seuil trouvé</h3>
            <p className="text-slate-500 mt-1">Commencez par créer un seuil environnemental</p>
          </div>
        ) : (
          filteredData.map((item) => {
            const typeColor = thresholdTypeColors[item.threshold_type] || thresholdTypeColors.INTERNAL;
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">
                      {dataTypeEmojis[item.data_type] || '📊'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-slate-800">{item.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-sm font-medium ${typeColor.bg} ${typeColor.text}`}>
                          {thresholdTypeLabels[item.threshold_type]}
                        </span>
                      </div>
                      <p className="text-base text-slate-500 mb-2">
                        {dataTypeLabels[item.data_type]} • Site: {getSiteName(item.site)}
                      </p>
                      <div className="flex flex-wrap gap-4 text-base">
                        {item.min_value !== null && (
                          <span className="text-indigo-600">
                            Min: <strong>{item.min_value} {item.unit}</strong>
                          </span>
                        )}
                        {item.max_value !== null && (
                          <span className="text-red-600">
                            Max: <strong>{item.max_value} {item.unit}</strong>
                          </span>
                        )}
                        {item.warning_min !== null && (
                          <span className="text-amber-600">
                            Alerte min: <strong>{item.warning_min} {item.unit}</strong>
                          </span>
                        )}
                        {item.warning_max !== null && (
                          <span className="text-amber-600">
                            Alerte max: <strong>{item.warning_max} {item.unit}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/thresholds/${item.id}`}
                      className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      title="Voir"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Link>
                    {canManage && (
                      <>
                        <Link
                          to={`/thresholds/${item.id}/edit`}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
