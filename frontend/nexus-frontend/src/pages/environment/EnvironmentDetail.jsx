import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  BeakerIcon,
  MapPinIcon,
  CalendarIcon,
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

export default function EnvironmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSupervisor } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/environmental-data/${id}/`);
      setData(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette mesure ?')) {
      return;
    }
    try {
      await api.delete(`/environmental-data/${id}/`);
      navigate('/environment');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Donnée non trouvée</p>
        <Link to="/environment" className="mt-4 text-green-600 hover:text-green-500">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/environment"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {typeLabels[data.data_type] || data.data_type}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Mesure du {new Date(data.measurement_date).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
        {isSupervisor() && (
          <div className="flex items-center gap-2">
            <Link
              to={`/environment/${id}/edit`}
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
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails de la mesure</h2>
          
          <div className="text-center py-6 mb-6 bg-green-50 rounded-lg">
            <p className="text-4xl font-bold text-green-600">
              {Number(data.value).toLocaleString('fr-FR')}
            </p>
            <p className="text-lg text-green-700">{data.unit}</p>
          </div>
          
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex items-start gap-3">
              <BeakerIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {typeLabels[data.data_type] || data.data_type}
                </dd>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Site</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.site_name || '—'}</dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Date et heure</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(data.measurement_date).toLocaleDateString('fr-FR')}
                  {data.measurement_time && ` à ${data.measurement_time}`}
                </dd>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Emplacement</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {data.location_details || 'Non précisé'}
                </dd>
              </div>
            </div>
          </dl>

          {data.notes && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">{data.notes}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Historique</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-gray-500">Créé le</p>
                <p className="font-medium text-gray-900">
                  {new Date(data.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-gray-500">Modifié le</p>
                <p className="font-medium text-gray-900">
                  {new Date(data.updated_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
