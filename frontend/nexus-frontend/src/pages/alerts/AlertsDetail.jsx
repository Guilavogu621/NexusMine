import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  BellAlertIcon,
  MapPinIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PlayIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const typeLabels = {
  THRESHOLD_EXCEEDED: 'Seuil dépassé',
  SAFETY: 'Sécurité',
  MAINTENANCE: 'Maintenance',
  ENVIRONMENTAL: 'Environnement',
  PRODUCTION: 'Production',
  INCIDENT: 'Incident',
  EQUIPMENT: 'Équipement',
  STOCK: 'Stock',
  SYSTEM: 'Système',
};

const typeEmojis = {
  THRESHOLD_EXCEEDED: '📊',
  SAFETY: '🛡️',
  MAINTENANCE: '🔧',
  ENVIRONMENTAL: '🌿',
  PRODUCTION: '⚙️',
  INCIDENT: '⚠️',
  EQUIPMENT: '🧰',
  STOCK: '📦',
  SYSTEM: '💻',
};

const severityLabels = {
  LOW: 'Basse',
  MEDIUM: 'Moyenne',
  HIGH: 'Haute',
  CRITICAL: 'Critique',
};

const severityConfig = {
  LOW: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-gray-500', pulse: false },
  MEDIUM: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-indigo-500', pulse: false },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', pulse: true },
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', pulse: true },
};

const statusLabels = {
  NEW: 'Nouvelle',
  READ: 'Lue',
  IN_PROGRESS: 'En cours',
  RESOLVED: 'Résolue',
  ARCHIVED: 'Archivée',
};

const statusConfig = {
  NEW: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', icon: BellAlertIcon },
  READ: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-indigo-500', icon: EyeIcon },
  IN_PROGRESS: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', icon: PlayIcon },
  RESOLVED: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: CheckCircleIcon },
  ARCHIVED: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-gray-500', icon: ArchiveBoxIcon },
};

export default function AlertsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isSiteManager, isAnalyst, isMMG, isTechnicien } = useAuthStore();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Peut éditer si ADMIN, SITE_MANAGER, ANALYST, MMG, TECHNICIEN
  const canEdit = isAdmin() || isSiteManager() || isAnalyst() || isMMG() || isTechnicien();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/alerts/${id}/`);
      setAlert(response.data);
      // Mark as read if new
      if (response.data.status === 'NEW') {
        await api.patch(`/alerts/${id}/`, { status: 'READ' });
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    try {
      await api.patch(`/alerts/${id}/`, { status: 'RESOLVED' });
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
      return;
    }
    try {
      setDeleting(true);
      await api.delete(`/alerts/${id}/`);
      navigate('/alerts');
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
            <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin border-t-orange-600 mx-auto"></div>
            <SparklesIcon className="h-6 w-6 text-orange-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-slate-500 font-medium">Chargement de l'alerte...</p>
        </div>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-96">
        <div className="p-4 bg-orange-100 rounded-full mb-4">
          <ExclamationTriangleIcon className="h-12 w-12 text-orange-600" />
        </div>
        <p className="text-2xl font-bold text-slate-800">Alerte non trouvée</p>
        <p className="text-slate-500 mt-1">Cette alerte n'existe pas ou a été supprimée</p>
        <Link to="/alerts" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
          Retour à la liste
        </Link>
      </div>
    );
  }

  const prioConfig = severityConfig[alert.severity] || severityConfig.LOW;
  const statConfig = statusConfig[alert.status] || statusConfig.NEW;
  const StatusIcon = statConfig.icon;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-8">
      {/* Premium Header avec bannière */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 shadow-2xl">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="alertGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#alertGrid)" />
          </svg>
        </div>
        
        {/* Gradient orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-blue-400 opacity-10 blur-3xl"></div>
        
        <div className="relative px-8 py-8">
          {/* Back button */}
          <Link
            to="/alerts"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-200 mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Retour aux alertes</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <span className="text-4xl">{typeEmojis[alert.alert_type] || '🔔'}</span>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white">{alert.title}</h1>
                <p className="mt-2 text-orange-100 flex items-center gap-2">
                  <BellAlertIcon className="h-4 w-4" />
                  {typeLabels[alert.alert_type] || alert.alert_type}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold ${prioConfig.bg} ${prioConfig.text}`}>
                    <span className={`h-2 w-2 rounded-full ${prioConfig.dot} ${prioConfig.pulse ? 'animate-pulse' : ''}`}></span>
                    Gravité: {severityLabels[alert.severity] || alert.severity}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold ${statConfig.bg} ${statConfig.text}`}>
                    <StatusIcon className="h-4 w-4" />
                    {statusLabels[alert.status] || alert.status}
                  </span>
                  {alert.site_name && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm">
                      <MapPinIcon className="h-4 w-4" />
                      {alert.site_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {isSupervisor() && alert.status !== 'RESOLVED' && alert.status !== 'ARCHIVED' && (
                <button
                  onClick={handleResolve}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:bg-emerald-600 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  Résoudre
                </button>
              )}
              {isSupervisor() && (
                <>
                  <Link
                    to={`/alerts/${id}/edit`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-orange-700 rounded-xl font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
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
        {/* Message card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-lg font-semibold text-slate-800">Message de l'alerte</h2>
            </div>
            
            <div className="p-6">
              <p className="text-base text-slate-500 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl">
                {alert.message || 'Aucun message'}
              </p>
              
              <div className="mt-6 pt-6 border-t border-slate-100">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="p-2.5 bg-orange-100 rounded-xl">
                      <BellAlertIcon className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <dt className="text-base font-semibold text-slate-500">Type d'alerte</dt>
                      <dd className="mt-1 text-base font-semibold text-slate-800 flex items-center gap-2">
                        <span>{typeEmojis[alert.alert_type] || '🔔'}</span>
                        {typeLabels[alert.alert_type] || alert.alert_type}
                      </dd>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="p-2.5 bg-blue-100 rounded-xl">
                      <MapPinIcon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <dt className="text-base font-semibold text-slate-500">Site concerné</dt>
                      <dd className="mt-1 text-base font-semibold text-slate-800">
                        {alert.site_name || 'Tous les sites'}
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Severity indicator */}
          <div className={`rounded-2xl p-6 ${prioConfig.bg} border ${prioConfig.text.replace('text-', 'border-').replace('700', '200')}`}>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${prioConfig.text.replace('text-', 'bg-').replace('700', '200')}`}>
                <ExclamationTriangleIcon className={`h-6 w-6 ${prioConfig.text}`} />
              </div>
              <div>
                <p className={`text-base font-semibold ${prioConfig.text} opacity-80`}>Niveau de gravité</p>
                <p className={`text-xl font-bold ${prioConfig.text}`}>
                  {severityLabels[alert.severity] || alert.severity}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline card */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-base font-semibold text-slate-800">Chronologie</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-xl">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Générée le</p>
                  <p className="text-base font-semibold text-slate-800 mt-0.5">
                    {new Date(alert.generated_at).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
              {alert.read_at && (
                <div className="flex items-start gap-4 p-3 bg-indigo-50 rounded-xl">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <EyeIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Lue le</p>
                    <p className="text-base font-semibold text-slate-800 mt-0.5">
                      {new Date(alert.read_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              )}
              {alert.resolved_at && (
                <div className="flex items-start gap-4 p-3 bg-emerald-50 rounded-xl">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Résolue le</p>
                    <p className="text-base font-semibold text-slate-800 mt-0.5">
                      {new Date(alert.resolved_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              )}
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
