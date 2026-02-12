import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  MapPinIcon,
  CalendarIcon,
  GlobeAltIcon,
  SparklesIcon,
  BuildingOffice2Icon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const siteTypeLabels = {
  OPEN_PIT: 'Ciel ouvert',
  UNDERGROUND: 'Souterrain',
  ALLUVIAL: 'Alluvionnaire',
  MIXED: 'Mixte',
};

const siteTypeEmojis = {
  OPEN_PIT: '⛏️',
  UNDERGROUND: '🚇',
  ALLUVIAL: '🌊',
  MIXED: '🔄',
};

const statusLabels = {
  ACTIVE: 'En exploitation',
  SUSPENDED: 'Suspendu',
  CLOSED: 'Fermé',
  EXPLORATION: 'En exploration',
};

const statusConfig = {
  ACTIVE: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: CheckCircleIcon },
  SUSPENDED: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', icon: ClockIcon },
  CLOSED: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', icon: ExclamationTriangleIcon },
  EXPLORATION: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-indigo-500', icon: SparklesIcon },
};

export default function SiteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchSite();
  }, [id]);

  const fetchSite = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/sites/${id}/`);
      setSite(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement du site:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le site "${site.name}" ?`)) {
      return;
    }
    try {
      setDeleting(true);
      await api.delete(`/sites/${id}/`);
      navigate('/sites');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du site');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin border-t-blue-600 mx-auto"></div>
            <SparklesIcon className="h-6 w-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-slate-500 font-medium">Chargement du site...</p>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-96">
        <div className="p-4 bg-red-100 rounded-full mb-4">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
        </div>
        <p className="text-2xl font-bold text-slate-800">Site non trouvé</p>
        <p className="text-slate-500 mt-1">Ce site n'existe pas ou a été supprimé</p>
        <Link to="/sites" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
          Retour à la liste
        </Link>
      </div>
    );
  }

  const config = statusConfig[site.status] || statusConfig.ACTIVE;
  const StatusIcon = config.icon;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-8">
      {/* Premium Header avec bannière */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 shadow-2xl">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="siteGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#siteGrid)" />
          </svg>
        </div>
        
        {/* Gradient orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-cyan-400 opacity-10 blur-3xl"></div>
        
        <div className="relative px-8 py-8">
          {/* Back button */}
          <Link
            to="/sites"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-200 mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Retour aux sites</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <span className="text-4xl">{siteTypeEmojis[site.site_type] || '⛏️'}</span>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white">{site.name}</h1>
                <p className="mt-2 text-blue-100 flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4" />
                  {site.location}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
                    <span className={`h-2 w-2 rounded-full ${config.dot}`}></span>
                    {statusLabels[site.status] || site.status}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm">
                    <BuildingOffice2Icon className="h-4 w-4" />
                    {siteTypeLabels[site.site_type] || site.site_type}
                  </span>
                </div>
              </div>
            </div>
            
            {isAdmin() && (
              <div className="flex items-center gap-3">
                <Link
                  to={`/sites/${id}/edit`}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-blue-100 rounded-xl group-hover:bg-indigo-500 group-hover:scale-110 transition-all duration-300">
              <UsersIcon className="h-5 w-5 text-indigo-600 group-hover:text-white transition-colors" />
            </div>
            <span className="text-base font-semibold text-slate-500">Personnel</span>
          </div>
          <p className="text-xl font-semibold text-slate-800">--</p>
        </div>
        <div className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-amber-100 rounded-xl group-hover:bg-amber-500 group-hover:scale-110 transition-all duration-300">
              <WrenchScrewdriverIcon className="h-5 w-5 text-amber-600 group-hover:text-white transition-colors" />
            </div>
            <span className="text-base font-semibold text-slate-500">Équipements</span>
          </div>
          <p className="text-xl font-semibold text-slate-800">--</p>
        </div>
        <div className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-cyan-100 rounded-xl group-hover:bg-cyan-500 group-hover:scale-110 transition-all duration-300">
              <ChartBarIcon className="h-5 w-5 text-cyan-600 group-hover:text-white transition-colors" />
            </div>
            <span className="text-base font-semibold text-slate-500">Opérations</span>
          </div>
          <p className="text-xl font-semibold text-slate-800">--</p>
        </div>
        <div className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-red-100 rounded-xl group-hover:bg-red-500 group-hover:scale-110 transition-all duration-300">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 group-hover:text-white transition-colors" />
            </div>
            <span className="text-base font-semibold text-slate-500">Incidents</span>
          </div>
          <p className="text-xl font-semibold text-slate-800">--</p>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-lg font-semibold text-slate-800">Informations générales</h2>
            </div>
            
            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-xl p-4">
                  <dt className="text-base font-semibold text-slate-500 mb-1">Type de site</dt>
                  <dd className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    <span className="text-xl">{siteTypeEmojis[site.site_type] || '⛏️'}</span>
                    {siteTypeLabels[site.site_type] || site.site_type}
                  </dd>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4">
                  <dt className="text-base font-semibold text-slate-500 mb-1">Statut</dt>
                  <dd>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
                      <StatusIcon className="h-4 w-4" />
                      {statusLabels[site.status] || site.status}
                    </span>
                  </dd>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <dt className="text-base font-semibold text-slate-500 mb-1">Latitude</dt>
                  <dd className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    <GlobeAltIcon className="h-5 w-5 text-slate-400" />
                    {site.latitude || 'Non renseignée'}
                  </dd>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4">
                  <dt className="text-base font-semibold text-slate-500 mb-1">Longitude</dt>
                  <dd className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    <GlobeAltIcon className="h-5 w-5 text-slate-400" />
                    {site.longitude || 'Non renseignée'}
                  </dd>
                </div>

                <div className="sm:col-span-2 bg-slate-50 rounded-xl p-4">
                  <dt className="text-base font-semibold text-slate-500 mb-2">Description</dt>
                  <dd className="text-base text-slate-600 leading-relaxed">
                    {site.description || 'Aucune description disponible pour ce site.'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Location card */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-sm">
                  <MapPinIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-800">Localisation</p>
                  <p className="text-sm text-slate-500">{siteTypeLabels[site.site_type]}</p>
                </div>
              </div>

              {site.latitude && site.longitude && (
                <a
                  href={`https://www.google.com/maps?q=${site.latitude},${site.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-3 text-sm font-semibold text-white shadow-sm"
                >
                  <GlobeAltIcon className="h-5 w-5" />
                  Voir sur Google Maps
                </a>
              )}
            </div>
          </div>

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
                    {new Date(site.created_at).toLocaleDateString('fr-FR', {
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
                    {new Date(site.updated_at).toLocaleDateString('fr-FR', {
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
