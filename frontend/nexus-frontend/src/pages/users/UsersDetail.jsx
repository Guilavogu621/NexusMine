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

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getPhotoUrl(user) {
  if (user.profile_photo_url) {
    if (user.profile_photo_url.startsWith('http')) return user.profile_photo_url;
    return `${API_BASE}${user.profile_photo_url}`;
  }
  if (user.profile_photo) {
    if (user.profile_photo.startsWith('http')) return user.profile_photo;
    return `${API_BASE}/media/${user.profile_photo}`;
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
  ADMIN: { bg: 'bg-red-100', text: 'text-red-700', gradient: 'from-red-500 to-rose-600' },
  SITE_MANAGER: { bg: 'bg-sky-100', text: 'text-sky-700', gradient: 'from-sky-500 to-blue-600' },
  SUPERVISOR: { bg: 'bg-purple-100', text: 'text-purple-700', gradient: 'from-purple-500 to-violet-600' },
  OPERATOR: { bg: 'bg-blue-100', text: 'text-blue-700', gradient: 'from-blue-500 to-indigo-600' },
  ANALYST: { bg: 'bg-emerald-100', text: 'text-emerald-700', gradient: 'from-emerald-500 to-teal-600' },
  MMG: { bg: 'bg-amber-100', text: 'text-amber-700', gradient: 'from-amber-500 to-orange-600' },
};

const roleDescriptions = {
  ADMIN: 'Gouvernance technique et sécurité du système. Configuration, gestion utilisateurs.',
  SITE_MANAGER: 'Autorité opérationnelle du site. Vision multi-sites, lancement activités, validation rapports, gestion incidents.',
  SUPERVISOR: 'Supervision opérationnelle quotidienne. Gestion opérations, personnel et équipements.',
  OPERATOR: 'Exécution technique. Saisie données terrain, signalement incidents.',
  ANALYST: 'Aide à la décision. Analyse données, KPIs, tableaux de bord.',
  MMG: 'Contrôle réglementaire. Vérification conformité, audit, lecture seule.',
};

export default function UsersDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md">
          <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <ShieldCheckIcon className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-red-800">Accès refusé</h3>
          <p className="text-red-600 mt-2">Cette section est réservée aux administrateurs.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-slate-200/60 rounded-full animate-spin border-t-slate-700 mx-auto"></div>
            <SparklesIcon className="h-5 w-5 text-slate-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-slate-500 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="p-4 bg-slate-100 rounded-full mb-4">
          <UserIcon className="h-12 w-12 text-slate-400" />
        </div>
        <p className="text-xl font-semibold text-slate-800">Utilisateur non trouvé</p>
        <Link to="/users" className="mt-4 text-slate-600 hover:text-slate-800 font-medium">
          ← Retour à la liste
        </Link>
      </div>
    );
  }

  const roleConf = roleConfig[user.role] || roleConfig.OPERATOR;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      {/* Premium Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-700 via-slate-800 to-gray-900 shadow-2xl">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="userDetailGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#userDetailGrid)" />
          </svg>
        </div>
        
        {/* Gradient orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gray-400 opacity-10 blur-3xl"></div>
        
        <div className="relative px-8 py-8">
          {/* Navigation */}
          <Link
            to="/users"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Retour aux utilisateurs</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              {(() => {
                const photoUrl = getPhotoUrl(user);
                return photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="h-20 w-20 rounded-2xl object-cover shadow-xl ring-2 ring-white/30"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null;
              })()}
              <div className={`h-20 w-20 bg-white/20 backdrop-blur-sm rounded-2xl items-center justify-center shadow-xl ${getPhotoUrl(user) ? 'hidden' : 'flex'}`}>
                <span className="text-2xl font-semibold text-white">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="mt-1 text-slate-300">{user.email}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-semibold ${roleConf.bg} ${roleConf.text}`}>
                    <span>{roleEmojis[user.role]}</span>
                    {roleLabels[user.role]}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-semibold ${
                    user.is_active 
                      ? 'bg-blue-100 text-emerald-700' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {user.is_active ? '✓ Actif' : '✕ Inactif'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleToggleActive}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                  user.is_active
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                }`}
              >
                {user.is_active ? (
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
                to={`/users/${id}/edit`}
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
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Role card */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${roleConf.gradient}`}>
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Rôle et permissions</h2>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-semibold ${roleConf.bg} ${roleConf.text} mt-1`}>
                  <span>{roleEmojis[user.role]}</span>
                  {roleLabels[user.role]}
                </span>
              </div>
            </div>
            <p className="text-slate-500 leading-relaxed">{roleDescriptions[user.role]}</p>
          </div>

          {/* Sites assignés */}
          {user.role !== 'ADMIN' && (
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-indigo-50">
                  <MapPinIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Sites assignés</h2>
                  <p className="text-sm text-slate-500">
                    Cet utilisateur a accès aux données de {user.assigned_sites_details?.length || 0} site(s)
                  </p>
                </div>
              </div>
              {user.assigned_sites_details?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {user.assigned_sites_details.map((site) => (
                    <Link
                      key={site.id}
                      to={`/sites/${site.id}`}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <MapPinIcon className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-slate-700 truncate">{site.name}</p>
                        {site.code && <p className="text-sm text-slate-400">{site.code}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-base text-amber-700 font-medium">⚠ Aucun site assigné</p>
                  <p className="text-sm text-amber-600 mt-1">Cet utilisateur n'a accès à aucune donnée.</p>
                </div>
              )}
            </div>
          )}

          {/* Informations */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Informations personnelles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <UserIcon className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-base text-slate-500">Nom complet</p>
                  <p className="font-semibold text-slate-800">
                    {user.first_name} {user.last_name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <EnvelopeIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-base text-slate-500">Email</p>
                  <p className="font-semibold text-slate-800">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <UserGroupIcon className="h-4 w-4 text-slate-400" />
              Statut du compte
            </h3>
            <div className={`flex items-center gap-4 p-4 rounded-xl ${
              user.is_active ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
            }`}>
              {user.is_active ? (
                <>
                  <div className="p-2 bg-blue-100 rounded-full">
                    <CheckCircleIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-700">Actif</p>
                    <p className="text-base text-indigo-600">Le compte est opérationnel</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-red-100 rounded-full">
                    <XCircleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-700">Inactif</p>
                    <p className="text-base text-red-600">Le compte est désactivé</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-slate-400" />
              Activité
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CalendarIcon className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Créé le</p>
                  <p className="text-base font-semibold text-slate-800">
                    {new Date(user.date_joined).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ClockIcon className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Dernière connexion</p>
                  <p className="text-base font-semibold text-slate-800">
                    {user.last_login
                      ? new Date(user.last_login).toLocaleString('fr-FR')
                      : 'Jamais'}
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
