import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  UserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const MEDIA_BASE = API_BASE.replace('/api', '');

function getPhotoUrl(user) {
  if (user.profile_photo_url) {
    if (user.profile_photo_url.startsWith('http')) return user.profile_photo_url;
    return `${MEDIA_BASE}${user.profile_photo_url}`;
  }
  if (user.profile_photo) {
    if (user.profile_photo.startsWith('http')) return user.profile_photo;
    return `${MEDIA_BASE}/media/${user.profile_photo}`;
  }
  return null;
}

const roleLabels = {
  ADMIN: 'Administrateur',
  SITE_MANAGER: 'Responsable de site',
  SUPERVISOR: 'Gestionnaire de Site',
  OPERATOR: 'Technicien/Opérateur',
  ANALYST: 'Analyste',
  MMG: 'Autorité (MMG)',
};

const roleEmojis = {
  ADMIN: '👑',
  SITE_MANAGER: '🏗️',
  SUPERVISOR: '🎯',
  OPERATOR: '⚙️',
  ANALYST: '📊',
  MMG: '🏛️',
};

const roleConfig = {
  ADMIN: { bg: 'bg-red-100/80', text: 'text-red-700', gradient: 'from-red-500 to-rose-600', badge: 'bg-red-200 text-red-800' },
  SITE_MANAGER: { bg: 'bg-sky-100/80', text: 'text-sky-700', gradient: 'from-sky-500 to-blue-600', badge: 'bg-sky-200 text-sky-800' },
  SUPERVISOR: { bg: 'bg-purple-100/80', text: 'text-purple-700', gradient: 'from-purple-500 to-violet-600', badge: 'bg-purple-200 text-purple-800' },
  OPERATOR: { bg: 'bg-blue-100/80', text: 'text-blue-700', gradient: 'from-blue-500 to-indigo-600', badge: 'bg-blue-200 text-blue-800' },
  ANALYST: { bg: 'bg-emerald-100/80', text: 'text-emerald-700', gradient: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-200 text-emerald-800' },
  MMG: { bg: 'bg-amber-100/80', text: 'text-amber-700', gradient: 'from-amber-500 to-orange-600', badge: 'bg-amber-200 text-amber-800' },
};

const roleDescriptions = {
  ADMIN: 'Gouvernance technique et sécurité du système. Configuration complète, gestion utilisateurs, audit.',
  SITE_MANAGER: 'Autorité opérationnelle du site. Vision multi-sites, lancement activités, validation rapports.',
  SUPERVISOR: 'Supervision opérationnelle quotidienne. Gestion opérations, personnel et équipements.',
  OPERATOR: 'Exécution technique. Saisie données terrain, signalement incidents et observations.',
  ANALYST: 'Aide à la décision. Analyse données, KPIs, tableaux de bord et recommandations.',
  MMG: 'Contrôle réglementaire. Vérification conformité, audit, accès lecture seule.',
};

export default function UsersDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${id}/`);
      setUser(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      await api.patch(`/users/${id}/`, { is_active: !user.is_active });
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la modification');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    try {
      await api.delete(`/users/${id}/`);
      navigate('/users');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/20 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center max-w-md shadow-lg">
          <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <ShieldCheckIcon className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Accès refusé</h3>
          <p className="text-slate-600 mt-3 font-medium">Cette section est réservée aux administrateurs.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/20 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200 animate-spin border-t-indigo-600 border-r-indigo-500"></div>
            <SparklesIcon className="h-8 w-8 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-slate-600 font-semibold">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/20 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4 bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-8 max-w-md shadow-lg">
          <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto inline-flex items-center justify-center">
            <UserIcon className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-xl font-bold text-slate-900">Utilisateur non trouvé</p>
          <Link to="/users" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-indigo-700 transition-all">
            ← Retour
          </Link>
        </div>
      </div>
    );
  }

  const roleConf = roleConfig[user.role] || roleConfig.OPERATOR;
  const photoUrl = getPhotoUrl(user);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/20 to-slate-100 relative">
      {/* Background pattern */}
      <div className="fixed inset-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.05),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(16,185,129,0.05),transparent_50%)]"></div>
      </div>

      <div className="relative max-w-5xl mx-auto space-y-8 pb-12 px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Premium - MÊME DESIGN QUE LES AUTRES PAGES */}
        <div className="group relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 via-blue-600 to-purple-600 shadow-2xl animate-fadeInDown">
          {/* SVG Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="userDetailGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#userDetailGrid)" />
            </svg>
          </div>

          {/* Animated Orbs */}
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-indigo-400 opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500"></div>

          <div className="relative px-8 py-10">
            {/* Back Button */}
            <Link
              to="/users"
              className="inline-flex items-center gap-2 text-blue-100 hover:text-white transition-colors mb-8 group/back font-semibold"
            >
              <ArrowLeftIcon className="h-5 w-5 group-hover/back:-translate-x-1 transition-transform" />
              Retour aux utilisateurs
            </Link>

            {/* User Header Content */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start gap-5">
                {/* Avatar */}
                {!photoError && photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="h-20 w-20 rounded-2xl object-cover shadow-xl ring-4 ring-white/30"
                    onError={() => setPhotoError(true)}
                  />
                ) : (
                  <div className={`h-20 w-20 bg-linear-to-br ${roleConf.gradient} rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-white/30`}>
                    <span className="text-2xl font-bold text-white">{user.first_name?.[0]}{user.last_name?.[0]}</span>
                  </div>
                )}

                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">
                    {user.first_name} {user.last_name}
                  </h1>
                  <p className="text-blue-100 mt-2 font-medium flex items-center gap-2">
                    <EnvelopeIcon className="h-4 w-4" />
                    {user.email}
                  </p>

                  {/* Badges */}
                  <div className="flex items-center gap-3 mt-4 flex-wrap">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold ${roleConf.badge}`}>
                      <span>{roleEmojis[user.role]}</span>
                      {roleLabels[user.role]}
                    </span>
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold ${user.is_active ? 'bg-emerald-200 text-emerald-800' : 'bg-white/30 text-white'
                      }`}>
                      {user.is_active ? (
                        <>
                          <CheckCircleIcon className="h-4 w-4" />
                          Actif
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="h-4 w-4" />
                          Inactif
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleToggleActive}
                  className={`inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 ${user.is_active
                    ? 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                    }`}
                >
                  {user.is_active ? <XCircleIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
                  {user.is_active ? 'Désactiver' : 'Activer'}
                </button>

                <Link
                  to={`/users/${id}/edit`}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-white text-indigo-700 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                  Modifier
                </Link>

                <button
                  onClick={handleDelete}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-red-600 transition-all duration-300"
                >
                  <TrashIcon className="h-5 w-5" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeInUp">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Role Card */}
            <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 hover:border-white/40 p-6 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-5">
                  <div className={`p-3 rounded-xl bg-linear-to-br ${roleConf.gradient} shadow-lg`}>
                    <ShieldCheckIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Rôle et permissions</h2>
                    <p className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wider">{roleLabels[user.role]}</p>
                  </div>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">{roleDescriptions[user.role]}</p>
              </div>
            </div>

            {/* Sites Assignés */}
            {user.role !== 'ADMIN' && (
              <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 hover:border-white/40 p-6 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 rounded-lg bg-indigo-100">
                      <MapPinIcon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Sites assignés</h2>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Accès à {user.assigned_sites_details?.length || 0} site(s)</p>
                    </div>
                  </div>

                  {user.assigned_sites_details?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {user.assigned_sites_details.map((site) => (
                        <Link
                          key={site.id}
                          to={`/sites/${site.id}`}
                          className="group/site p-4 bg-linear-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200/60 hover:border-indigo-300 hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-indigo-200 flex items-center justify-center group-hover/site:scale-110 transition-transform">
                              <MapPinIcon className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">{site.name}</p>
                              {site.code && <p className="text-xs text-slate-500 mt-0.5">{site.code}</p>}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-xl text-center">
                      <p className="text-sm font-bold text-amber-800">⚠ Aucun site assigné</p>
                      <p className="text-xs text-amber-700 mt-1">Cet utilisateur n'a accès à aucune donnée.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Informations Personnelles */}
            <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 hover:border-white/40 p-6 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

              <div className="relative z-10">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Informations personnelles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/60">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <UserIcon className="h-4 w-4 text-slate-600" />
                      </div>
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nom</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900 ml-11">{user.first_name} {user.last_name}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200/60">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <EnvelopeIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Email</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900 ml-11 break-all">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 hover:border-white/40 p-6 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

              <div className="relative z-10">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <UserGroupIcon className="h-5 w-5 text-slate-400" />
                  Statut
                </h3>

                <div className={`p-4 rounded-xl border ${user.is_active ? 'bg-emerald-50/80 border-emerald-200' : 'bg-red-50/80 border-red-200'
                  }`}>
                  <div className="flex items-start gap-3">
                    {user.is_active ? (
                      <>
                        <div className="p-2.5 bg-emerald-100 rounded-lg shrink-0">
                          <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-emerald-800">Actif</p>
                          <p className="text-xs text-emerald-700 mt-1">Le compte est opérationnel</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-2.5 bg-red-100 rounded-lg shrink-0">
                          <XCircleIcon className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-red-800">Inactif</p>
                          <p className="text-xs text-red-700 mt-1">Le compte est désactivé</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Card */}
            <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 hover:border-white/40 p-6 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

              <div className="relative z-10">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-slate-400" />
                  Activité
                </h3>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200/60">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                        <CalendarIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Créé</p>
                    </div>
                    <p className="text-xs font-bold text-slate-900 ml-11">
                      {new Date(user.date_joined).toLocaleString('fr-FR')}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-200/60">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                        <ClockIcon className="h-4 w-4 text-purple-600" />
                      </div>
                      <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Connexion</p>
                    </div>
                    <p className="text-xs font-bold text-slate-900 ml-11">
                      {user.last_login ? new Date(user.last_login).toLocaleString('fr-FR') : 'Jamais'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animations CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

        .font-outfit {
          font-family: 'Outfit', sans-serif;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInDown {
          animation: fadeInDown 0.7s ease-out forwards;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
}