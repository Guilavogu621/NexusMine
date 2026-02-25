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
  SparklesIcon,
  FunnelIcon,
  PresentationChartLineIcon,
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

const typeEmojis = {
  PRODUCTION: '⛏️',
  EFFICIENCY: '📈',
  SAFETY: '🦺',
  ENVIRONMENTAL: '🌿',
  EQUIPMENT: '🔧',
  FINANCIAL: '💰',
};

const typeConfig = {
  PRODUCTION: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-indigo-500' },
  EFFICIENCY: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  SAFETY: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  ENVIRONMENTAL: { bg: 'bg-teal-100', text: 'text-teal-700', dot: 'bg-teal-500' },
  EQUIPMENT: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  FINANCIAL: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
};

export default function AnalyticsList() {
  const [indicators, setIndicators] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const { isSupervisor, isAnalyst, isAdmin } = useAuthStore();

  const canEdit = isAdmin() || isAnalyst();

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

  const getPerformanceColor = (value, target) => {
    if (!value || !target) return 'text-slate-500';
    const percentage = (value / target) * 100;
    if (percentage >= 100) return 'text-emerald-600';
    if (percentage >= 80) return 'text-indigo-600';
    if (percentage >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getPerformancePercentage = (value, target) => {
    if (!value || !target) return null;
    return Math.round((value / target) * 100);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-500 via-indigo-600 to-violet-600 shadow-2xl">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="analyticsListGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#analyticsListGrid)" />
          </svg>
        </div>

        {/* Gradient orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-violet-400 opacity-10 blur-3xl"></div>

        <div className="relative px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <PresentationChartLineIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white">Indicateurs</h1>
                <p className="mt-1 text-indigo-100">
                  Suivez les KPIs de vos sites miniers
                </p>
              </div>
            </div>
            {canEdit && (
              <Link
                to="/analytics/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-xl font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <PlusIcon className="h-5 w-5" />
                Nouvel indicateur
              </Link>
            )}
          </div>

          {/* Stats row */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-base text-indigo-100">Total indicateurs</p>
              <p className="text-xl font-semibold text-white">{indicators.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-base text-indigo-100">Objectifs atteints</p>
              <p className="text-xl font-semibold text-white">
                {indicators.filter(i => i.calculated_value && i.target_value && i.calculated_value >= i.target_value).length}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-base text-indigo-100">En alerte</p>
              <p className="text-xl font-semibold text-white">
                {indicators.filter(i => i.calculated_value && i.threshold_warning && i.calculated_value <= i.threshold_warning).length}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-base text-indigo-100">Critiques</p>
              <p className="text-xl font-semibold text-white">
                {indicators.filter(i => i.calculated_value && i.threshold_critical && i.calculated_value <= i.threshold_critical).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="h-5 w-5 text-slate-500" />
          <span className="font-semibold text-slate-800">Recherche et filtres</span>
        </div>
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un indicateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-xl border-0 py-3 pl-11 pr-4 text-slate-800 ring-1 ring-inset ring-gray-300 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 text-base bg-slate-50 font-medium"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className="rounded-xl border-0 py-3 px-4 text-slate-800 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-500 text-base bg-slate-50 font-medium"
            >
              <option value="">📍 Tous les sites</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-xl border-0 py-3 px-4 text-slate-800 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-500 text-base bg-slate-50 font-medium"
            >
              <option value="">📊 Tous types</option>
              {Object.entries(typeLabels).map(([value, label]) => (
                <option key={value} value={value}>{typeEmojis[value]} {label}</option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-6 py-3 text-base font-semibold text-white hover:from-indigo-700 hover:to-violet-700 shadow-sm hover:shadow-md transition-all duration-200"
            >
              Rechercher
            </button>
          </div>
        </form>
      </div>

      {/* Indicators grid */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600 mx-auto"></div>
                <SparklesIcon className="h-5 w-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="mt-4 text-slate-500 font-medium">Chargement des indicateurs...</p>
            </div>
          </div>
        ) : indicators.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="p-4 bg-indigo-100 rounded-full mb-4">
              <ChartBarIcon className="h-12 w-12 text-indigo-600" />
            </div>
            <p className="text-xl font-semibold text-slate-800">Aucun indicateur</p>
            <p className="text-base text-slate-500 mt-1">Aucun indicateur ne correspond à vos critères</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {indicators.map((indicator, index) => {
              const typeConf = typeConfig[indicator.indicator_type] || typeConfig.PRODUCTION;
              const percentage = getPerformancePercentage(indicator.calculated_value, indicator.target_value);

              return (
                <div
                  key={indicator.id}
                  className="bg-slate-50 rounded-2xl p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-200 border border-slate-200/60"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{typeEmojis[indicator.indicator_type] || '📊'}</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-semibold ${typeConf.bg} ${typeConf.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${typeConf.dot}`}></span>
                        {typeLabels[indicator.indicator_type]}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Link
                        to={`/analytics/${indicator.id}`}
                        className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      {canEdit && (
                        <>
                          <Link
                            to={`/analytics/${indicator.id}/edit`}
                            className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(indicator.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <h3 className="font-semibold text-slate-800 mb-3">
                    {indicator.name}
                  </h3>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className={`text-2xl font-semibold ${getPerformanceColor(indicator.calculated_value, indicator.target_value)}`}>
                        {indicator.calculated_value?.toLocaleString('fr-FR') || '-'}
                        <span className="text-base font-normal text-slate-500 ml-1">
                          {indicator.unit}
                        </span>
                      </p>
                      <p className="text-base text-slate-500 mt-1">
                        🎯 Objectif: {indicator.target_value?.toLocaleString('fr-FR') || '-'} {indicator.unit}
                      </p>
                    </div>
                    {percentage !== null && (
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${percentage >= 100
                        ? 'bg-emerald-100 text-emerald-700'
                        : percentage >= 80
                          ? 'bg-indigo-50 text-indigo-700'
                          : percentage >= 60
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                        {percentage >= 100 ? (
                          <ArrowTrendingUpIcon className="h-4 w-4" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4" />
                        )}
                        <span className="text-base font-bold">{percentage}%</span>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  {percentage !== null && (
                    <div className="mt-3">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${percentage >= 100 ? 'bg-emerald-500' :
                            percentage >= 80 ? 'bg-indigo-500' :
                              percentage >= 60 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-base text-slate-400 pt-3 mt-3 border-t border-slate-200/60">
                    <p>📍 {indicator.site_name || 'Tous sites'}</p>
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
