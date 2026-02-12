import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  MapIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

export default function WorkZonesDetail() {
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
      const response = await api.get(`/work-zones/${id}/`);
      setData(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette zone ?')) return;
    try {
      await api.delete(`/work-zones/${id}/`);
      navigate('/workzones');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleToggleActive = async () => {
    try {
      await api.patch(`/work-zones/${id}/`, { is_active: !data.is_active });
      setData({ ...data, is_active: !data.is_active });
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error || 'Zone non trouvée'}</p>
        <Link to="/workzones" className="text-indigo-600 hover:underline mt-4 inline-block">
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
            to="/workzones"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Retour aux zones
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <MapIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                  {data.code}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-sm font-medium ${data.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {data.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mt-1">{data.name}</h1>
            </div>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleActive}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                data.is_active
                  ? 'bg-slate-100 text-slate-600 hover:bg-gray-200'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {data.is_active ? (
                <>
                  <XCircleIcon className="h-4 w-4" />
                  Désactiver
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4" />
                  Activer
                </>
              )}
            </button>
            <Link
              to={`/workzones/${id}/edit`}
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

      {/* Site */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
        <div className="flex items-center gap-3">
          <MapPinIcon className="h-6 w-6 text-indigo-600" />
          <div>
            <label className="text-base text-slate-500">Site minier</label>
            <p className="font-semibold text-slate-800">{data.site_name || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      {data.description && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Description</h2>
          <p className="text-slate-600">{data.description}</p>
        </div>
      )}

      {/* Géolocalisation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">📍 Géolocalisation</h2>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <div className="text-base text-indigo-600 mb-1">Latitude</div>
            <div className="text-xl font-bold text-blue-700 font-mono">
              {data.gps_latitude !== null ? parseFloat(data.gps_latitude).toFixed(6) : '-'}
            </div>
          </div>
          
          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <div className="text-base text-indigo-600 mb-1">Longitude</div>
            <div className="text-xl font-bold text-blue-700 font-mono">
              {data.gps_longitude !== null ? parseFloat(data.gps_longitude).toFixed(6) : '-'}
            </div>
          </div>
        </div>

        {data.gps_latitude && data.gps_longitude && (
          <div className="mt-4">
            <a
              href={`https://www.google.com/maps?q=${data.gps_latitude},${data.gps_longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-blue-700 text-sm"
            >
              <MapIcon className="h-4 w-4" />
              Voir sur Google Maps
            </a>
          </div>
        )}
      </div>

      {/* GeoJSON */}
      {data.zone_geojson && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Polygone de la zone</h2>
          <pre className="bg-slate-50 rounded-lg p-4 overflow-x-auto text-sm font-mono text-slate-600">
            {JSON.stringify(data.zone_geojson, null, 2)}
          </pre>
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
                year: 'numeric'
              }) : '-'}
            </p>
          </div>
          <div>
            <label className="text-base font-semibold text-slate-500">Modifiée le</label>
            <p className="text-slate-800 mt-1">
              {data.updated_at ? new Date(data.updated_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }) : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
