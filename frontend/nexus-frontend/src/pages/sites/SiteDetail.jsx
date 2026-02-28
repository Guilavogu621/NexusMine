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
  const [siteStats, setSiteStats] = useState({
    personnel_count: 0,
    equipment_count: 0,
    operations_count: 0,
    incidents_count: 0,
  });

  useEffect(() => {
    fetchSite();
    fetchSiteStats();
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

  const fetchSiteStats = async () => {
    try {
      const [personnel, equipment, operations, incidents] = await Promise.all([
        api.get(`/personnel/?site=${id}`).catch(() => ({ data: { count: 0 } })),
        api.get(`/equipment/?site=${id}`).catch(() => ({ data: { count: 0 } })),
        api.get(`/operations/?site=${id}`).catch(() => ({ data: { count: 0 } })),
        api.get(`/incidents/?site=${id}`).catch(() => ({ data: { count: 0 } })),
      ]);

      setSiteStats({
        personnel_count: personnel.data.count || personnel.data.results?.length || personnel.data.length || 0,
        equipment_count: equipment.data.count || equipment.data.results?.length || equipment.data.length || 0,
        operations_count: operations.data.count || operations.data.results?.length || operations.data.length || 0,
        incidents_count: incidents.data.count || incidents.data.results?.length || incidents.data.length || 0,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques du site:', error);
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
    <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-slate-50 via-blue-50/20 to-slate-100 pb-12">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-8">
        {/* ── HEADER PREMIUM ── */}
        <div className="group relative overflow-hidden rounded-[40px] bg-linear-to-br from-indigo-600 via-blue-600 to-indigo-700 shadow-2xl animate-fadeInDown">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="siteGridPattern" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
              <rect width="100" height="100" fill="url(#siteGridPattern)" />
            </svg>
          </div>

          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-700"></div>

          <div className="relative p-8 sm:p-10">
            {/* Nav & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
              <Link
                to="/sites"
                className="group inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/10 backdrop-blur-md text-white rounded-2xl hover:bg-white hover:text-indigo-600 transition-all duration-300 shadow-lg border border-white/20"
              >
                <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-bold uppercase tracking-widest font-outfit">Liste des Sites</span>
              </Link>

              {isAdmin() && (
                <div className="flex items-center gap-3">
                  <Link
                    to={`/sites/${id}/edit`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Modifier
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="group inline-flex items-center gap-2 px-6 py-3 bg-red-500/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg hover:bg-red-600 hover:shadow-red-500/20 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
                  >
                    {deleting ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <TrashIcon className="h-4 w-4 group-hover:animate-bounce" />
                    )}
                    Supprimer
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
              <div className="relative group shrink-0">
                <div className="absolute inset-0 bg-white/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className={`h-40 w-40 rounded-[32px] bg-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl ring-4 ring-white/30`}>
                    <span className="text-6xl group-hover:scale-110 transition-transform duration-500">
                      {siteTypeEmojis[site.site_type] || '⛏️'}
                    </span>
                  </div>
                  <div className={`absolute -bottom-3 -right-3 p-3 rounded-2xl shadow-xl ring-4 ring-white ${config.bg} ${config.text} group-hover:rotate-12 transition-transform`}>
                    <StatusIcon className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold uppercase tracking-[0.2em] mb-4 border border-white/20">
                  <GlobeAltIcon className="h-3.5 w-3.5" />
                  {site.site_type}
                </div>
                <h1 className="text-5xl font-bold text-white tracking-tight font-outfit mb-4 uppercase">
                  {site.name}
                </h1>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                  <div className="flex items-center gap-3 text-white bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20 shadow-lg">
                    <MapPinIcon className="h-5 w-5 text-blue-200" />
                    <span className="font-bold tracking-tight">{site.location || 'Localisation non définie'}</span>
                  </div>
                  <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl shadow-lg border border-white/20 bg-white/10 backdrop-blur-md text-white`}>
                    <div className={`w-2.5 h-2.5 rounded-full shadow-inner ${config.dot} animate-pulse`}></div>
                    <span className="font-bold uppercase tracking-widest text-[11px]">{statusLabels[site.status] || site.status}</span>
                  </div>
                </div>
              </div>
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
            <p className="text-xl font-semibold text-slate-800">{siteStats.personnel_count}</p>
          </div>
          <div className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-amber-100 rounded-xl group-hover:bg-amber-500 group-hover:scale-110 transition-all duration-300">
                <WrenchScrewdriverIcon className="h-5 w-5 text-amber-600 group-hover:text-white transition-colors" />
              </div>
              <span className="text-base font-semibold text-slate-500">Équipements</span>
            </div>
            <p className="text-xl font-semibold text-slate-800">{siteStats.equipment_count}</p>
          </div>
          <div className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-cyan-100 rounded-xl group-hover:bg-cyan-500 group-hover:scale-110 transition-all duration-300">
                <ChartBarIcon className="h-5 w-5 text-cyan-600 group-hover:text-white transition-colors" />
              </div>
              <span className="text-base font-semibold text-slate-500">Opérations</span>
            </div>
            <p className="text-xl font-semibold text-slate-800">{siteStats.operations_count}</p>
          </div>
          <div className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-red-100 rounded-xl group-hover:bg-red-500 group-hover:scale-110 transition-all duration-300">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 group-hover:text-white transition-colors" />
              </div>
              <span className="text-base font-semibold text-slate-500">Incidents</span>
            </div>
            <p className="text-xl font-semibold text-slate-800">{siteStats.incidents_count}</p>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Details card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
              <div className="border-b border-slate-100 px-6 py-4 bg-linear-to-r from-gray-50 to-white">
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

                  <div className="bg-slate-50 rounded-xl p-4">
                    <dt className="text-base font-semibold text-slate-500 mb-1">Date de mise en service</dt>
                    <dd className="text-base font-semibold text-slate-800 flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-slate-400" />
                      {site.commissioning_date ? new Date(site.commissioning_date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }) : 'Non renseignée'}
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
                  <div className="p-3 bg-linear-to-br from-blue-500 to-cyan-600 rounded-xl shadow-sm">
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
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 px-4 py-3 text-sm font-semibold text-white shadow-sm"
                  >
                    <GlobeAltIcon className="h-5 w-5" />
                    Voir sur Google Maps
                  </a>
                )}
              </div>
            </div>

            {/* History card */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
              <div className="border-b border-slate-100 px-6 py-4 bg-linear-to-r from-gray-50 to-white">
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

        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInDown { animation: fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fadeInUp { 
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          animation-fill-mode: both;
        }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out; }
      `}</style>
      </div>
    </div>
  );
}
