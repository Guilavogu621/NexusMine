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

  const performanceColors = {
    excellent: 'bg-green-500',
    good: 'bg-blue-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500',
    unknown: 'bg-gray-300',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!indicator) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Indicateur non trouvé</p>
        <Link to="/analytics" className="mt-4 text-indigo-600 hover:text-indigo-500">
          Retour à la liste
        </Link>
      </div>
    );
  }

  const performancePercentage = getPerformancePercentage();
  const performanceStatus = getPerformanceStatus();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/analytics"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[indicator.indicator_type]}`}>
              {typeLabels[indicator.indicator_type]}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">{indicator.name}</h1>
          </div>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <Link
              to={`/analytics/${id}/edit`}
              className="inline-flex items-center rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50 transition-colors"
            >
              <PencilSquareIcon className="h-4 w-4 mr-2" />
              Modifier
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 transition-colors"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Supprimer
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main performance card */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Performance</h2>
            {performancePercentage !== null && (
              <div className="flex items-center gap-2">
                {performancePercentage >= 100 ? (
                  <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
                ) : (
                  <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
                )}
                <span className={`text-lg font-bold ${
                  performancePercentage >= 100 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {performancePercentage}%
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Valeur actuelle</p>
              <p className="text-4xl font-bold text-indigo-600">
                {indicator.calculated_value?.toLocaleString('fr-FR') || '-'}
              </p>
              <p className="text-sm text-gray-400 mt-1">{indicator.unit}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Objectif</p>
              <p className="text-4xl font-bold text-gray-900">
                {indicator.target_value?.toLocaleString('fr-FR') || '-'}
              </p>
              <p className="text-sm text-gray-400 mt-1">{indicator.unit}</p>
            </div>
          </div>

          {/* Progress bar */}
          {performancePercentage !== null && (
            <div className="mt-8">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${performanceColors[performanceStatus]} transition-all duration-500`}
                  style={{ width: `${Math.min(performancePercentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {indicator.description && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{indicator.description}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Thresholds */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Seuils</h3>
            <div className="space-y-4">
              {indicator.threshold_warning && (
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-500">Avertissement</p>
                    <p className="font-medium text-gray-900">
                      {indicator.threshold_warning.toLocaleString('fr-FR')} {indicator.unit}
                    </p>
                  </div>
                </div>
              )}
              {indicator.threshold_critical && (
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-500">Critique</p>
                    <p className="font-medium text-gray-900">
                      {indicator.threshold_critical.toLocaleString('fr-FR')} {indicator.unit}
                    </p>
                  </div>
                </div>
              )}
              {!indicator.threshold_warning && !indicator.threshold_critical && (
                <p className="text-sm text-gray-400 italic">Aucun seuil défini</p>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Informations</h3>
            <dl className="space-y-4">
              <div className="flex items-start gap-3">
                <ChartBarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <dt className="text-sm text-gray-500">Type</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {typeLabels[indicator.indicator_type]}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <dt className="text-sm text-gray-500">Site</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {indicator.site_name || 'Tous les sites'}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
