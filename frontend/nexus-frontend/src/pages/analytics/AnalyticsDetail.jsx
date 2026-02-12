import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  ChartBarIcon,
  MapPinIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  PresentationChartLineIcon,
  BeakerIcon,
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
  PRODUCTION: { bg: 'bg-blue-100', text: 'text-blue-700', gradient: 'from-blue-500 to-indigo-600' },
  EFFICIENCY: { bg: 'bg-blue-100', text: 'text-emerald-700', gradient: 'from-emerald-500 to-teal-600' },
  SAFETY: { bg: 'bg-red-100', text: 'text-red-700', gradient: 'from-red-500 to-rose-600' },
  ENVIRONMENTAL: { bg: 'bg-teal-100', text: 'text-teal-700', gradient: 'from-teal-500 to-cyan-600' },
  EQUIPMENT: { bg: 'bg-amber-100', text: 'text-amber-700', gradient: 'from-amber-500 to-orange-600' },
  FINANCIAL: { bg: 'bg-purple-100', text: 'text-purple-700', gradient: 'from-purple-500 to-violet-600' },
};

export default function AnalyticsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSupervisor, isAnalyst } = useAuthStore();
  const [indicator, setIndicator] = useState(null);
  const [loading, setLoading] = useState(true);

  const canEdit = isSupervisor() || isAnalyst();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/indicators/${id}/`);
      setIndicator(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet indicateur ?')) {
      return;
    }
    try {
      await api.delete(`/indicators/${id}/`);
      navigate('/analytics');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const getPerformancePercentage = () => {
    if (!indicator?.calculated_value || !indicator?.target_value) return null;
    return Math.round((indicator.calculated_value / indicator.target_value) * 100);
  };

  const getPerformanceStatus = () => {
    if (!indicator?.calculated_value || !indicator?.target_value) return 'unknown';
    const percentage = getPerformancePercentage();
    if (percentage >= 100) return 'excellent';
    if (percentage >= 80) return 'good';
    if (percentage >= 60) return 'warning';
    return 'critical';
  };

  const performanceConfig = {
    excellent: { bg: 'bg-emerald-500', text: 'text-indigo-600', light: 'bg-blue-100' },
    good: { bg: 'bg-indigo-500', text: 'text-indigo-600', light: 'bg-blue-100' },
    warning: { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-100' },
    critical: { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-100' },
    unknown: { bg: 'bg-gray-300', text: 'text-slate-500', light: 'bg-slate-100' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600 mx-auto"></div>
            <SparklesIcon className="h-5 w-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-slate-500 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!indicator) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="p-4 bg-slate-100 rounded-full mb-4">
          <ChartBarIcon className="h-12 w-12 text-slate-400" />
        </div>
        <p className="text-xl font-semibold text-slate-800">Indicateur non trouvé</p>
        <Link to="/analytics" className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium">
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  const performancePercentage = getPerformancePercentage();
  const performanceStatus = getPerformanceStatus();
  const perfConf = performanceConfig[performanceStatus];
  const typeConf = typeConfig[indicator.indicator_type] || typeConfig.PRODUCTION;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      {/* Premium Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 shadow-2xl">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="analyticsDetailGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#analyticsDetailGrid)" />
          </svg>
        </div>
        
        {/* Gradient orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-violet-400 opacity-10 blur-3xl"></div>
        
        <div className="relative px-8 py-8">
          {/* Navigation */}
          <Link
            to="/analytics"
            className="inline-flex items-center gap-2 text-indigo-200 hover:text-white transition-colors mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Retour aux indicateurs</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <span className="text-4xl">{typeEmojis[indicator.indicator_type] || '📊'}</span>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-semibold ${typeConf.bg} ${typeConf.text}`}>
                    {typeLabels[indicator.indicator_type]}
                  </span>
                  {performancePercentage !== null && (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-bold ${perfConf.light} ${perfConf.text}`}>
                      {performancePercentage >= 100 ? (
                        <ArrowTrendingUpIcon className="h-4 w-4" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4" />
                      )}
                      {performancePercentage}%
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-semibold text-white">{indicator.name}</h1>
                <p className="mt-1 text-indigo-200">
                  📍 {indicator.site_name || 'Tous les sites'}
                </p>
              </div>
            </div>
            {canEdit && (
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={`/analytics/${id}/edit`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all duration-200"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  Modifier
                </Link>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all duration-200"
                >
                  <TrashIcon className="h-4 w-4" />
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Highlight Card */}
      <div className={`bg-gradient-to-br ${perfConf.bg.replace('bg-', 'from-')} to-${performanceStatus === 'excellent' ? 'teal-500' : performanceStatus === 'good' ? 'indigo-500' : performanceStatus === 'warning' ? 'orange-500' : 'rose-500'} rounded-2xl shadow-xl p-6 text-white`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-white/80 mb-1">Valeur actuelle</p>
            <p className="text-4xl font-semibold">
              {indicator.calculated_value?.toLocaleString('fr-FR') || '-'}
              <span className="text-xl font-normal opacity-80 ml-2">{indicator.unit}</span>
            </p>
          </div>
          <div className="h-px md:h-20 w-20 md:w-px bg-white/30"></div>
          <div className="text-center md:text-left">
            <p className="text-white/80 mb-1">Objectif</p>
            <p className="text-4xl font-semibold">
              {indicator.target_value?.toLocaleString('fr-FR') || '-'}
              <span className="text-xl font-normal opacity-80 ml-2">{indicator.unit}</span>
            </p>
          </div>
          {performancePercentage !== null && (
            <>
              <div className="h-px md:h-20 w-20 md:w-px bg-white/30"></div>
              <div className="text-center">
                <p className="text-white/80 mb-1">Performance</p>
                <div className="flex items-center gap-2">
                  {performancePercentage >= 100 ? (
                    <ArrowTrendingUpIcon className="h-8 w-8" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-8 w-8" />
                  )}
                  <p className="text-4xl font-semibold">{performancePercentage}%</p>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Progress bar */}
        {performancePercentage !== null && (
          <div className="mt-6">
            <div className="h-4 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${Math.min(performancePercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-white/70 font-medium">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {indicator.description && (
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <BeakerIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-lg font-semibold text-slate-800">Description</h2>
              </div>
              <p className="text-slate-500 leading-relaxed">{indicator.description}</p>
            </div>
          )}

          {/* Thresholds */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-xl">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
              </div>
                <h2 className="text-lg font-semibold text-slate-800">Seuils d'alerte</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border-2 ${
                indicator.threshold_warning 
                  ? 'bg-amber-50 border-amber-200' 
                  : 'bg-slate-50 border-slate-200/60'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <ExclamationTriangleIcon className={`h-5 w-5 ${
                    indicator.threshold_warning ? 'text-amber-500' : 'text-slate-400'
                  }`} />
                  <p className="text-base font-semibold text-slate-600">Avertissement</p>
                </div>
                <p className={`text-xl font-semibold ${
                  indicator.threshold_warning ? 'text-amber-700' : 'text-slate-400'
                }`}>
                  {indicator.threshold_warning?.toLocaleString('fr-FR') || 'Non défini'}
                  {indicator.threshold_warning && (
                    <span className="text-base font-normal ml-1">{indicator.unit}</span>
                  )}
                </p>
              </div>
              
              <div className={`p-4 rounded-xl border-2 ${
                indicator.threshold_critical 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-slate-50 border-slate-200/60'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <ExclamationTriangleIcon className={`h-5 w-5 ${
                    indicator.threshold_critical ? 'text-red-500' : 'text-slate-400'
                  }`} />
                  <p className="text-base font-semibold text-slate-600">Critique</p>
                </div>
                <p className={`text-xl font-semibold ${
                  indicator.threshold_critical ? 'text-red-700' : 'text-slate-400'
                }`}>
                  {indicator.threshold_critical?.toLocaleString('fr-FR') || 'Non défini'}
                  {indicator.threshold_critical && (
                    <span className="text-base font-normal ml-1">{indicator.unit}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <PresentationChartLineIcon className="h-4 w-4 text-slate-400" />
              Informations
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <ChartBarIcon className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Type d'indicateur</p>
                  <p className="text-base font-semibold text-slate-800">
                    {typeEmojis[indicator.indicator_type]} {typeLabels[indicator.indicator_type]}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPinIcon className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Site minier</p>
                  <p className="text-base font-semibold text-slate-800">
                    {indicator.site_name || 'Tous les sites'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BeakerIcon className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Unité de mesure</p>
                  <p className="text-base font-semibold text-slate-800">
                    {indicator.unit || 'Non définie'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
