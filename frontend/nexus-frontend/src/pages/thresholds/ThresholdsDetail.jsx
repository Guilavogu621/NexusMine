import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  AdjustmentsHorizontalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  MapPinIcon,
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
  REGULATORY: 'bg-red-100 text-red-700',
  INTERNAL: 'bg-indigo-50 text-indigo-700',
  WARNING: 'bg-amber-100 text-amber-700',
};

export default function ThresholdsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin, isSupervisor } = useAuthStore();

  const canManage = isAdmin() || isSupervisor();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/environmental-thresholds/${id}/`);
      setData(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce seuil ?')) return;
    try {
      await api.delete(`/environmental-thresholds/${id}/`);
      navigate('/thresholds');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error || 'Seuil non trouvé'}</p>
        <Link to="/thresholds" className="text-teal-600 hover:underline mt-4 inline-block">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/thresholds"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Retour aux seuils
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-4xl">{dataTypeEmojis[data.data_type] || '📊'}</div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{data.name}</h1>
              <p className="text-slate-500">{dataTypeLabels[data.data_type]}</p>
            </div>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <Link
              to={`/thresholds/${id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <PencilSquareIcon className="h-4 w-4" />
              Modifier
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
              Supprimer
            </button>
          </div>
        )}
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-3">
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${thresholdTypeColors[data.threshold_type]}`}>
          {thresholdTypeLabels[data.threshold_type]}
        </span>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${data.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
          {data.is_active ? '✓ Actif' : '✗ Inactif'}
        </span>
        {data.site_name ? (
          <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-700 flex items-center gap-1">
            <MapPinIcon className="h-4 w-4" />
            {data.site_name}
          </span>
        ) : (
          <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-600">
            🌍 Global (tous les sites)
          </span>
        )}
      </div>

      {/* Valeurs seuils */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <AdjustmentsHorizontalIcon className="h-5 w-5 text-teal-600" />
          Valeurs seuils
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <div className="text-base text-indigo-600 mb-1">Minimum</div>
            <div className="text-xl font-semibold text-blue-700">
              {data.min_value !== null ? data.min_value : '-'}
            </div>
            <div className="text-sm text-indigo-500">{data.unit}</div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-base text-red-600 mb-1">Maximum</div>
            <div className="text-xl font-semibold text-red-700">
              {data.max_value !== null ? data.max_value : '-'}
            </div>
            <div className="text-sm text-red-500">{data.unit}</div>
          </div>
          
          <div className="bg-amber-50 rounded-lg p-4 text-center">
            <div className="text-base text-amber-600 mb-1">Alerte Min</div>
            <div className="text-xl font-semibold text-amber-700">
              {data.warning_min !== null ? data.warning_min : '-'}
            </div>
            <div className="text-sm text-amber-500">{data.unit}</div>
          </div>
          
          <div className="bg-amber-50 rounded-lg p-4 text-center">
            <div className="text-base text-amber-600 mb-1">Alerte Max</div>
            <div className="text-xl font-semibold text-amber-700">
              {data.warning_max !== null ? data.warning_max : '-'}
            </div>
            <div className="text-sm text-amber-500">{data.unit}</div>
          </div>
        </div>
      </div>

      {/* Informations complémentaires */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Informations</h2>
        
        <div className="space-y-4">
          {data.regulatory_reference && (
            <div>
              <label className="text-base font-semibold text-slate-500">Référence réglementaire</label>
              <p className="text-slate-800 mt-1">{data.regulatory_reference}</p>
            </div>
          )}
          
          {data.description && (
            <div>
              <label className="text-base font-semibold text-slate-500">Description</label>
              <p className="text-slate-800 mt-1">{data.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <label className="text-base font-semibold text-slate-500">Créé le</label>
              <p className="text-slate-800 mt-1">
                {data.created_at ? new Date(data.created_at).toLocaleDateString('fr-FR') : '-'}
              </p>
            </div>
            <div>
              <label className="text-base font-semibold text-slate-500">Modifié le</label>
              <p className="text-slate-800 mt-1">
                {data.updated_at ? new Date(data.updated_at).toLocaleDateString('fr-FR') : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
