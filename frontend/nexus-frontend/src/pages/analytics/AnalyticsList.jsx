import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const typeLabels = {
  PRODUCTION: 'Production',
  EFFICIENCY: 'Efficacité',
  SAFETY: 'Sécurité',
  ENVIRONMENTAL: 'Environnement',
  EQUIPMENT: 'Équipement',
  FINANCIAL: 'Financier',
};

const typeColors = {
  PRODUCTION: 'bg-blue-100 text-blue-800',
  EFFICIENCY: 'bg-green-100 text-green-800',
  SAFETY: 'bg-red-100 text-red-800',
  ENVIRONMENTAL: 'bg-emerald-100 text-emerald-800',
  EQUIPMENT: 'bg-yellow-100 text-yellow-800',
  FINANCIAL: 'bg-purple-100 text-purple-800',
};

export default function AnalyticsList() {
  const [indicators, setIndicators] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const { isSupervisor, isAnalyst } = useAuthStore();

  const canEdit = isSupervisor() || isAnalyst();

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterType) params.append('indicator_type', filterType);
      if (filterSite) params.append('site', filterSite);
      
      const [indicatorsRes, sitesRes] = await Promise.all([
        api.get(`/indicators/?${params.toString()}`),
        api.get('/sites/'),
      ]);
      
      setIndicators(indicatorsRes.data.results || indicatorsRes.data);
      setSites(sitesRes.data.results || sitesRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType, filterSite]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet indicateur ?')) {
      return;
    }
    try {
      await api.delete(`/indicators/${id}/`);
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const getPerformanceColor = (value, target, thresholdWarning, thresholdCritical) => {
    if (!value || !target) return 'text-gray-500';
    const percentage = (value / target) * 100;
    if (percentage >= 100) return 'text-green-600';
    if (thresholdWarning && value >= thresholdWarning) return 'text-yellow-600';
    if (thresholdCritical && value <= thresholdCritical) return 'text-red-600';
    return 'text-blue-600';
  };

  const getTrendIcon = (value, target) => {
    if (!value || !target) return null;
    if (value >= target) {
      return <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />;
    }
    return <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Indicateurs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Suivez les KPIs de vos sites miniers
          </p>
        </div>
        {canEdit && (
          <Link
            to="/analytics/new"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouvel indicateur
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un indicateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className="rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
            >
              <option value="">Tous les sites</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
            >
              <option value="">Tous types</option>
              {Object.entries(typeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
            >
              Rechercher
            </button>
          </div>
        </form>
      </div>

      {/* Indicators grid */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : indicators.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <ChartBarIcon className="h-12 w-12 mb-4" />
            <p>Aucun indicateur trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {indicators.map((indicator) => (
              <div
                key={indicator.id}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[indicator.indicator_type]}`}>
                    {typeLabels[indicator.indicator_type]}
                  </span>
                  <div className="flex gap-1">
                    <Link
                      to={`/analytics/${indicator.id}`}
                      className="p-1 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                    {canEdit && (
                      <>
                        <Link
                          to={`/analytics/${indicator.id}/edit`}
                          className="p-1 rounded text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(indicator.id)}
                          className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <h3 className="font-medium text-gray-900 mb-2">
                  {indicator.name}
                </h3>
                
                <div className="flex items-end justify-between">
                  <div>
                    <p className={`text-2xl font-bold ${getPerformanceColor(
                      indicator.calculated_value,
                      indicator.target_value,
                      indicator.threshold_warning,
                      indicator.threshold_critical
                    )}`}>
                      {indicator.calculated_value?.toLocaleString('fr-FR') || '-'}
                      <span className="text-sm font-normal text-gray-500 ml-1">
                        {indicator.unit}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Objectif: {indicator.target_value?.toLocaleString('fr-FR') || '-'} {indicator.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(indicator.calculated_value, indicator.target_value)}
                    {indicator.target_value && indicator.calculated_value && (
                      <span className={`text-sm font-medium ${
                        indicator.calculated_value >= indicator.target_value ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {Math.round((indicator.calculated_value / indicator.target_value) * 100)}%
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-400">
                    {indicator.site_name || 'Tous sites'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
