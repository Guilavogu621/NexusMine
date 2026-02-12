import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  IdentificationIcon,
  SparklesIcon,
  BriefcaseIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const statusLabels = {
  ACTIVE: 'Actif',
  ON_LEAVE: 'En congé',
  INACTIVE: 'Inactif',
  TERMINATED: 'Licencié',
};

const statusConfig = {
  ACTIVE: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: CheckCircleIcon },
  ON_LEAVE: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', icon: ClockIcon },
  INACTIVE: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-gray-500', icon: ClockIcon },
  TERMINATED: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', icon: ExclamationTriangleIcon },
};

const avatarColors = [
  'from-purple-500 to-indigo-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
];

export default function PersonnelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSupervisor } = useAuthStore();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPerson();
  }, [id]);

  const fetchPerson = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/personnel/${id}/`);
      setPerson(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${person.last_name} ${person.first_name}" ?`)) {
      return;
    }
    try {
      setDeleting(true);
      await api.delete(`/personnel/${id}/`);
      navigate('/personnel');
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
            <div className="w-16 h-16 border-4 border-amber-200 rounded-full animate-spin border-t-amber-600 mx-auto"></div>
            <SparklesIcon className="h-6 w-6 text-amber-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-slate-500 font-medium">Chargement du personnel...</p>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-96">
        <div className="p-4 bg-red-100 rounded-full mb-4">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
        </div>
        <p className="text-xl font-semibold text-slate-800">Employé non trouvé</p>
        <p className="text-slate-500 mt-1">Cet employé n'existe pas ou a été supprimé</p>
        <Link to="/personnel" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
          Retour à la liste
        </Link>
      </div>
    );
  }

  const config = statusConfig[person.status] || statusConfig.ACTIVE;
  const StatusIcon = config.icon;
  const avatarColor = avatarColors[parseInt(id) % avatarColors.length];
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const photoUrl = person.photo_url
    ? (person.photo_url.startsWith('http') ? person.photo_url : `${API_BASE}${person.photo_url}`)
    : null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-8">
      {/* Premium Header avec bannière */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 shadow-2xl">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="personnelGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#personnelGrid)" />
          </svg>
        </div>
        
        {/* Gradient orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-orange-400 opacity-10 blur-3xl"></div>
        
        <div className="relative px-8 py-8">
          {/* Back button */}
          <Link
            to="/personnel"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-200 mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Retour au personnel</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={`${person.first_name} ${person.last_name}`}
                    className="h-20 w-20 rounded-2xl object-cover shadow-xl ring-2 ring-white/30"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${avatarColor} items-center justify-center shadow-xl ${photoUrl ? 'hidden' : 'flex'}`}>
                  <span className="text-2xl font-semibold text-white">
                    {person.first_name?.[0]}{person.last_name?.[0]}
                  </span>
                </div>
                <span className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full ${config.dot} border-4 border-amber-600`}></span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {person.first_name} {person.last_name}
                </h1>
                <p className="mt-2 text-amber-100 flex items-center gap-2">
                  <BriefcaseIcon className="h-4 w-4" />
                  {person.position || 'Poste non défini'}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
                    <span className={`h-2 w-2 rounded-full ${config.dot}`}></span>
                    {statusLabels[person.status] || person.status}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm">
                    <IdentificationIcon className="h-4 w-4" />
                    {person.employee_id}
                  </span>
                </div>
              </div>
            </div>
            
            {isSupervisor() && (
              <div className="flex items-center gap-3">
                <Link
                  to={`/personnel/${id}/edit`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-amber-700 rounded-xl font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
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

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-lg font-semibold text-slate-800">Informations personnelles</h2>
            </div>
            
            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="p-2.5 bg-purple-100 rounded-xl">
                    <IdentificationIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <dt className="text-base font-semibold text-slate-500">Matricule</dt>
                    <dd className="mt-1 text-base font-semibold text-slate-800">{person.employee_id}</dd>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="p-2.5 bg-emerald-100 rounded-xl">
                    <StatusIcon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <dt className="text-base font-semibold text-slate-500">Statut</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
                        {statusLabels[person.status] || person.status}
                      </span>
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="p-2.5 bg-blue-100 rounded-xl">
                    <MapPinIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <dt className="text-base font-semibold text-slate-500">Site d'affectation</dt>
                    <dd className="mt-1 text-base font-semibold text-slate-800">
                      {person.site_name || 'Non assigné'}
                    </dd>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="p-2.5 bg-amber-100 rounded-xl">
                    <CalendarIcon className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <dt className="text-base font-semibold text-slate-500">Date d'embauche</dt>
                    <dd className="mt-1 text-base font-semibold text-slate-800">
                      {person.hire_date 
                        ? new Date(person.hire_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                        : 'Non renseignée'}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact card */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-base font-semibold text-slate-800">Contact</h3>
            </div>
            <div className="p-6 space-y-4">
              {person.phone && (
                <a
                  href={`tel:${person.phone}`}
                  className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl hover:bg-purple-50 transition-colors group"
                >
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <PhoneIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Téléphone</p>
                    <p className="text-base font-semibold text-purple-600">{person.phone}</p>
                  </div>
                </a>
              )}
              
              {person.email && (
                <a
                  href={`mailto:${person.email}`}
                  className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl hover:bg-purple-50 transition-colors group"
                >
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <EnvelopeIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Email</p>
                    <p className="text-base font-semibold text-purple-600 truncate">{person.email}</p>
                  </div>
                </a>
              )}
              
              {!person.phone && !person.email && (
                <div className="text-center py-4">
                  <p className="text-base text-slate-500">Aucune information de contact</p>
                </div>
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
                    {new Date(person.created_at).toLocaleDateString('fr-FR', {
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
                    {new Date(person.updated_at).toLocaleDateString('fr-FR', {
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
