import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  BeakerIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
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

export default function EnvironmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSupervisor } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

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
      setDeleting(true);
      await api.delete(`/environmental-data/${id}/`);
      navigate('/environment');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin border-t-emerald-600 mx-auto"></div>
            <SparklesIcon className="h-6 w-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-slate-500 font-medium">Chargement de la mesure...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-96">
        <div className="p-4 bg-blue-100 rounded-full mb-4">
          <ExclamationTriangleIcon className="h-12 w-12 text-indigo-600" />
        </div>
        <p className="text-xl font-semibold text-slate-800">Donnée non trouvée</p>
        <p className="text-slate-500 mt-1">Cette mesure n'existe pas ou a été supprimée</p>
        <Link to="/environment" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
          Retour à la liste
        </Link>
      </div>
    );
  }

  const typeConf = typeColors[data.data_type] || typeColors.OTHER;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-8">
      {/* Premium Header avec bannière */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 shadow-2xl">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="envGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#envGrid)" />
          </svg>
        </div>
        
        {/* Gradient orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-teal-400 opacity-10 blur-3xl"></div>
        
        <div className="relative px-8 py-8">
          {/* Back button */}
          <Link
            to="/environment"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-200 mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Retour aux données</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <span className="text-4xl">{typeEmojis[data.data_type] || '📊'}</span>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white">
                  {typeLabels[data.data_type] || data.data_type}
                </h1>
                <p className="mt-2 text-emerald-100 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Mesure du {new Date(data.measurement_date).toLocaleDateString('fr-FR')}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold ${typeConf.bg} ${typeConf.text}`}>
                    <BeakerIcon className="h-4 w-4" />
                    {typeLabels[data.data_type] || data.data_type}
                  </span>
                  {data.site_name && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm">
                      <MapPinIcon className="h-4 w-4" />
                      {data.site_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {isSupervisor() && (
              <div className="flex items-center gap-3">
                <Link
                  to={`/environment/${id}/edit`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 rounded-xl font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  Modifier
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl font-semibold shadow-lg hover:bg-red-600 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
                >
                  {deleting ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <TrashIcon className="h-4 w-4" />
                  )}
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Value Highlight Card */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100">
        <div className="text-center">
          <p className="text-base font-semibold text-indigo-600 mb-2">Valeur mesurée</p>
          <p className="text-6xl font-bold text-slate-800">
            {Number(data.value).toLocaleString('fr-FR')}
          </p>
          <p className="text-2xl font-medium text-blue-700 mt-2">{data.unit}</p>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-lg font-semibold text-slate-800">Détails de la mesure</h2>
            </div>
            
            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="p-2.5 bg-blue-100 rounded-xl">
                    <BeakerIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <dt className="text-base font-semibold text-slate-500">Type de mesure</dt>
                    <dd className="mt-1 text-base font-semibold text-slate-800 flex items-center gap-2">
                      <span>{typeEmojis[data.data_type] || '📊'}</span>
                      {typeLabels[data.data_type] || data.data_type}
                    </dd>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="p-2.5 bg-blue-100 rounded-xl">
                    <MapPinIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <dt className="text-base font-semibold text-slate-500">Site</dt>
                    <dd className="mt-1 text-base font-semibold text-slate-800">
                      {data.site_name || 'Non défini'}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="p-2.5 bg-purple-100 rounded-xl">
                    <CalendarIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <dt className="text-base font-semibold text-slate-500">Date et heure</dt>
                    <dd className="mt-1 text-base font-semibold text-slate-800">
                      {new Date(data.measurement_date).toLocaleDateString('fr-FR')}
                      {data.measurement_time && ` à ${data.measurement_time}`}
                    </dd>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="p-2.5 bg-amber-100 rounded-xl">
                    <MapPinIcon className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <dt className="text-base font-semibold text-slate-500">Emplacement précis</dt>
                    <dd className="mt-1 text-base font-semibold text-slate-800">
                      {data.location_details || 'Non précisé'}
                    </dd>
                  </div>
                </div>
              </dl>

              {data.notes && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <DocumentTextIcon className="h-5 w-5 text-slate-400" />
                    Notes
                  </h3>
                  <p className="text-base text-slate-500 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl">
                    {data.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* History card */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-base font-semibold text-slate-800">Historique</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-xl">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Créé le</p>
                  <p className="text-base font-semibold text-slate-800 mt-0.5">
                    {new Date(data.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ClockIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Modifié le</p>
                  <p className="text-base font-semibold text-slate-800 mt-0.5">
                    {new Date(data.updated_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
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
        .max-w-5xl > * {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
