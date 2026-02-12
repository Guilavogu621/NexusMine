import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  ShieldExclamationIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XMarkIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const typeLabels = {
  ACCIDENT: 'Accident corporel',
  EQUIPMENT_FAILURE: 'Panne équipement',
  ENVIRONMENTAL: 'Incident environnemental',
  SECURITY: 'Incident de sécurité',
  LANDSLIDE: 'Glissement de terrain',
  FIRE: 'Incendie',
  OTHER: 'Autre',
};

const typeEmojis = {
  ACCIDENT: '🚑',
  EQUIPMENT_FAILURE: '🔧',
  ENVIRONMENTAL: '🌿',
  SECURITY: '🔐',
  LANDSLIDE: '⛰️',
  FIRE: '🔥',
  OTHER: '📋',
};

const severityLabels = {
  LOW: 'Faible',
  MEDIUM: 'Moyen',
  HIGH: 'Élevé',
  CRITICAL: 'Critique',
};

const severityConfig = {
  LOW: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', pulse: false },
  MEDIUM: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', pulse: false },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', pulse: true },
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', pulse: true },
};

const statusLabels = {
  REPORTED: 'Déclaré',
  INVESTIGATING: 'En investigation',
  RESOLVED: 'Résolu',
  CLOSED: 'Clôturé',
};

const statusConfig = {
  REPORTED: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-indigo-500', icon: DocumentTextIcon },
  INVESTIGATING: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', icon: MagnifyingGlassIcon },
  RESOLVED: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: CheckCircleIcon },
  CLOSED: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-gray-500', icon: XMarkIcon },
};

export default function IncidentsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSupervisor, isSiteManager } = useAuthStore();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const fetchIncident = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/incidents/${id}/`);
      setIncident(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'incident "${incident.incident_code}" ?`)) {
      return;
    }
    try {
      setDeleting(true);
      await api.delete(`/incidents/${id}/`);
      navigate('/incidents');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
      setDeleting(false);
    }
  };

  const handleClose = async () => {
    if (!window.confirm(`Êtes-vous sûr de vouloir clôturer l'incident "${incident.incident_code}" ?`)) {
      return;
    }
    try {
      setClosing(true);
      await api.post(`/incidents/${id}/close/`);
      // Recharger les données
      const updated = await api.get(`/incidents/${id}/`);
      setIncident(updated.data);
    } catch (error) {
      console.error('Erreur lors de la clôture:', error);
      alert(error.response?.data?.error || 'Erreur lors de la clôture');
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-red-200 rounded-full animate-spin border-t-red-600 mx-auto"></div>
            <SparklesIcon className="h-6 w-6 text-red-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-slate-500 font-medium">Chargement de l'incident...</p>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-96">
        <div className="p-4 bg-red-100 rounded-full mb-4">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
        </div>
        <p className="text-xl font-semibold text-slate-800">Incident non trouvé</p>
        <p className="text-slate-500 mt-1">Cet incident n'existe pas ou a été supprimé</p>
        <Link to="/incidents" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
          Retour à la liste
        </Link>
      </div>
    );
  }

  const sevConfig = severityConfig[incident.severity] || severityConfig.LOW;
  const statConfig = statusConfig[incident.status] || statusConfig.REPORTED;
  const StatusIcon = statConfig.icon;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-8">
      {/* Premium Header avec bannière */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-red-700 to-rose-700 shadow-2xl">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="incGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#incGrid)" />
          </svg>
        </div>
        
        {/* Gradient orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-rose-400 opacity-10 blur-3xl"></div>
        
        <div className="relative px-8 py-8">
          {/* Back button */}
          <Link
            to="/incidents"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-200 mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Retour aux incidents</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <span className="text-4xl">{typeEmojis[incident.incident_type] || '📋'}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{incident.incident_code}</h1>
                <p className="mt-2 text-red-100 flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  {typeLabels[incident.incident_type] || incident.incident_type}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold ${sevConfig.bg} ${sevConfig.text}`}>
                    <span className={`h-2 w-2 rounded-full ${sevConfig.dot} ${sevConfig.pulse ? 'animate-pulse' : ''}`}></span>
                    {severityLabels[incident.severity] || incident.severity}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold ${statConfig.bg} ${statConfig.text}`}>
                    <StatusIcon className="h-4 w-4" />
                    {statusLabels[incident.status] || incident.status}
                  </span>
                  {incident.site_name && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm">
                      <MapPinIcon className="h-4 w-4" />
                      {incident.site_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {/* Bouton Clôturer — ADMIN et SITE_MANAGER uniquement */}
              {isSiteManager() && incident.status !== 'CLOSED' && (
                <button
                  onClick={handleClose}
                  disabled={closing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:bg-emerald-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
                >
                  {closing ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircleIcon className="h-4 w-4" />
                  )}
                  Clôturer
                </button>
              )}
              
              {isSupervisor() && (
                <>
                  <Link
                    to={`/incidents/${id}/edit`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-red-700 rounded-xl font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Modifier
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900/50 backdrop-blur-sm text-white rounded-xl font-semibold shadow-lg hover:bg-gray-900/70 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
                  >
                    {deleting ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <TrashIcon className="h-4 w-4" />
                    )}
                    Supprimer
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Détails de l'incident</h2>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${sevConfig.bg} ${sevConfig.text}`}>
                <ShieldExclamationIcon className="h-4 w-4" />
                Gravité: {severityLabels[incident.severity] || incident.severity}
              </span>
            </div>
            
            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="p-2.5 bg-red-100 rounded-xl">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <dt className="text-base font-semibold text-slate-500">Type d'incident</dt>
                    <dd className="mt-1 text-base font-semibold text-slate-800 flex items-center gap-2">
                      <span>{typeEmojis[incident.incident_type] || '📋'}</span>
                      {typeLabels[incident.incident_type] || incident.incident_type}
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
                      {incident.site_name || 'Non assigné'}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="p-2.5 bg-purple-100 rounded-xl">
                    <CalendarIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <dt className="text-base font-semibold text-slate-500">Date</dt>
                    <dd className="mt-1 text-base font-semibold text-slate-800">
                      {new Date(incident.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </dd>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="p-2.5 bg-amber-100 rounded-xl">
                    <ClockIcon className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <dt className="text-base font-semibold text-slate-500">Heure</dt>
                    <dd className="mt-1 text-base font-semibold text-slate-800">
                      {incident.time || 'Non précisée'}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5 text-slate-400" />
                Description détaillée
              </h3>
            </div>
            <div className="p-6">
              <p className="text-base text-slate-500 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl">
                {incident.description || 'Aucune description fournie'}
              </p>
            </div>
          </div>

          {/* Actions taken */}
          {incident.actions_taken && (
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
              <div className="border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-emerald-50 to-white">
                <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <WrenchScrewdriverIcon className="h-5 w-5 text-emerald-600" />
                  Actions prises
                </h3>
              </div>
              <div className="p-6">
                <p className="text-base text-slate-500 leading-relaxed whitespace-pre-line bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  {incident.actions_taken}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Severity indicator */}
          <div className={`rounded-2xl p-6 ${sevConfig.bg} border ${sevConfig.text.replace('text-', 'border-').replace('700', '200')}`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${sevConfig.text.replace('text-', 'bg-').replace('700', '200')}`}>
                <ShieldExclamationIcon className={`h-6 w-6 ${sevConfig.text}`} />
              </div>
              <div>
                <p className={`text-base font-semibold ${sevConfig.text} opacity-80`}>Niveau de gravité</p>
                <p className={`text-xl font-bold ${sevConfig.text}`}>
                  {severityLabels[incident.severity] || incident.severity}
                </p>
              </div>
            </div>
          </div>

          {/* History card */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-base font-semibold text-slate-800">Historique</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-xl">
                <div className="p-2 bg-red-100 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Déclaré le</p>
                  <p className="text-base font-semibold text-slate-800 mt-0.5">
                    {new Date(incident.created_at).toLocaleDateString('fr-FR', {
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
                    {new Date(incident.updated_at).toLocaleDateString('fr-FR', {
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
