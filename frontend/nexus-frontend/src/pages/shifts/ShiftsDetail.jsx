import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const shiftTypeLabels = {
  DAY: 'Jour (6h-18h)',
  NIGHT: 'Nuit (18h-6h)',
  MORNING: 'Matin (6h-14h)',
  AFTERNOON: 'Après-midi (14h-22h)',
  EVENING: 'Soir (22h-6h)',
};

const shiftTypeIcons = {
  DAY: '☀️',
  NIGHT: '🌙',
  MORNING: '🌅',
  AFTERNOON: '🌤️',
  EVENING: '🌆',
};

const shiftTypeColors = {
  DAY: 'bg-yellow-100 text-yellow-700',
  NIGHT: 'bg-indigo-100 text-indigo-700',
  MORNING: 'bg-orange-100 text-orange-700',
  AFTERNOON: 'bg-indigo-50 text-indigo-700',
  EVENING: 'bg-purple-100 text-purple-700',
};

export default function ShiftsDetail() {
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
      const response = await api.get(`/shifts/${id}/`);
      setData(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette rotation ?')) return;
    try {
      await api.delete(`/shifts/${id}/`);
      navigate('/shifts');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error || 'Rotation non trouvée'}</p>
        <Link to="/shifts" className="text-amber-600 hover:underline mt-4 inline-block">
          Retour à la liste
        </Link>
      </div>
    );
  }

  const productionPercentage = data.target_production && data.actual_production
    ? Math.round((data.actual_production / data.target_production) * 100)
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/shifts"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Retour aux rotations
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <ClockIcon className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${shiftTypeColors[data.shift_type]}`}>
                  <span>{shiftTypeIcons[data.shift_type]}</span>
                  {shiftTypeLabels[data.shift_type]}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mt-1">
                {new Date(data.date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </h1>
            </div>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <Link
              to={`/shifts/${id}/edit`}
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

      {/* Site & Zone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-5">
          <div className="flex items-center gap-3">
            <MapPinIcon className="h-6 w-6 text-amber-600" />
            <div>
              <label className="text-base text-slate-500">Site minier</label>
              <p className="font-semibold text-slate-800">{data.site_name || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        {data.work_zone_name && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-5">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📍</div>
              <div>
              <label className="text-base text-slate-500">Zone de travail</label>
                <p className="font-semibold text-slate-800">{data.work_zone_name}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Supervisor */}
      {data.supervisor_name && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-5">
          <div className="flex items-center gap-3">
            <UserGroupIcon className="h-6 w-6 text-amber-600" />
            <div>
              <label className="text-base text-slate-500">Superviseur</label>
              <p className="font-semibold text-slate-800">{data.supervisor_name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Production */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5 text-amber-600" />
          Production
        </h2>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-amber-50 rounded-lg p-4 text-center">
            <div className="text-base text-amber-600 mb-1">Cible</div>
            <div className="text-xl font-semibold text-amber-700">
              {data.target_production !== null ? `${data.target_production} t` : '-'}
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-base text-green-600 mb-1">Réalisé</div>
            <div className="text-xl font-semibold text-green-700">
              {data.actual_production !== null ? `${data.actual_production} t` : '-'}
            </div>
          </div>
        </div>

        {productionPercentage !== null && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-base mb-2">
              <span className="text-slate-500">Progression</span>
              <span className={`font-bold ${productionPercentage >= 100 ? 'text-green-600' : productionPercentage >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
                {productionPercentage}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${productionPercentage >= 100 ? 'bg-green-500' : productionPercentage >= 80 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(productionPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Personnel */}
      {data.personnel_assigned && data.personnel_assigned.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            👷 Personnel assigné ({data.personnel_assigned.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.personnel_assigned.map((p, index) => (
              <span key={index} className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                {typeof p === 'object' ? `${p.first_name} ${p.last_name}` : p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Equipment */}
      {data.equipment_assigned && data.equipment_assigned.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <WrenchScrewdriverIcon className="h-5 w-5 text-amber-600" />
            Équipements assignés ({data.equipment_assigned.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.equipment_assigned.map((e, index) => (
              <span key={index} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                {typeof e === 'object' ? (e.code || e.name) : e}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {data.notes && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Notes</h2>
          <p className="text-slate-600 whitespace-pre-line">{data.notes}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-base font-semibold text-slate-500">Créée le</label>
            <p className="text-slate-800 mt-1">
              {data.created_at ? new Date(data.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : '-'}
            </p>
          </div>
          <div>
            <label className="text-base font-semibold text-slate-500">Modifiée le</label>
            <p className="text-slate-800 mt-1">
              {data.updated_at ? new Date(data.updated_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
