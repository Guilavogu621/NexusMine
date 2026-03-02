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
  BeakerIcon,
  ChartBarIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';
import { formatDateFR } from '../../utils/translationUtils';

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
  LOW: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-100' },
  MEDIUM: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-100' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', border: 'border-orange-100' },
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-100' },
};

const statusLabels = {
  REPORTED: 'Déclaré',
  INVESTIGATING: 'En investigation',
  RESOLVED: 'Résolu',
  CLOSED: 'Clôturé',
};

// Composant de section style "Capture"
const StyledSection = ({ icon: Icon, title, iconBg, children }) => (
  <div className="bg-[#f0f9ff] rounded-[32px] overflow-hidden mb-6 border border-blue-50 shadow-sm">
    <div className="px-6 py-4 flex items-center gap-3">
      <div className={`p-2 ${iconBg} rounded-xl`}>
        <Icon className="h-5 w-5 text-blue-600" />
      </div>
      <h2 className="font-bold text-slate-800 text-base">{title}</h2>
    </div>
    <div className="bg-white m-1 rounded-[28px] p-6 shadow-sm">
      {children}
    </div>
  </div>
);

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
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'incident "${incident.incident_code}" ?`)) return;
    try {
      setDeleting(true);
      await api.delete(`/incidents/${id}/`);
      navigate('/incidents');
    } catch (error) {
      alert('Erreur lors de la suppression');
      setDeleting(false);
    }
  };

  const handleClose = async () => {
    if (!window.confirm(`Voulez-vous clôturer l'incident "${incident.incident_code}" ?`)) return;
    try {
      setClosing(true);
      await api.post(`/incidents/${id}/close/`);
      fetchIncident();
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de la clôture');
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!incident) return null;

  const sevConfig = severityConfig[incident.severity] || severityConfig.LOW;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <div className="max-w-5xl mx-auto px-4 pt-8 space-y-6">

        {/* ── HEADER BLEU PREMIUM (Design Capture) ── */}
        <div className="relative overflow-hidden rounded-[35px] bg-linear-to-r from-blue-500 via-blue-600 to-cyan-500 shadow-xl">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          </div>

          <div className="relative p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <Link to="/incidents" className="p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-white/30 transition-all shadow-lg">
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div className="flex items-center gap-4">
                <div className="text-5xl drop-shadow-md">{typeEmojis[incident.incident_type] || '📋'}</div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{incident.incident_code}</h1>
                  <p className="text-blue-100 font-medium opacity-90 flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    {typeLabels[incident.incident_type] || incident.incident_type}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {isSiteManager() && incident.status !== 'CLOSED' && (
                <button onClick={handleClose} disabled={closing} className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-600 transition-all flex items-center gap-2">
                  {closing ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircleIcon className="h-5 w-5" />}
                  Clôturer
                </button>
              )}
              {isSupervisor() && (
                <>
                  <Link to={`/incidents/${id}/edit`} className="px-5 py-2.5 bg-white text-blue-600 rounded-xl font-bold shadow-md hover:bg-blue-50 transition-all flex items-center gap-2">
                    <PencilSquareIcon className="h-5 w-5" /> Modifier
                  </Link>
                  <button onClick={handleDelete} disabled={deleting} className="px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-white rounded-xl font-bold hover:bg-red-500 transition-all flex items-center gap-2">
                    <TrashIcon className="h-5 w-5" /> Supprimer
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── CONTENU PRINCIPAL ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-2">

            {/* 1. Informations Principales */}
            <StyledSection icon={BeakerIcon} title="Détails de l'incident" iconBg="bg-blue-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[20px]">
                  <div className="text-2xl">{typeEmojis[incident.incident_type]}</div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Type</p>
                    <p className="text-sm font-bold text-slate-700">{typeLabels[incident.incident_type]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[20px]">
                  <MapPinIcon className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Site</p>
                    <p className="text-sm font-bold text-slate-700">{incident.site_name || 'Non assigné'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[20px]">
                  <CalendarIcon className="h-6 w-6 text-blue-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Date</p>
                    <p className="text-sm font-bold text-slate-700">{formatDateFR(incident.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[20px]">
                  <ClockIcon className="h-6 w-6 text-amber-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Heure</p>
                    <p className="text-sm font-bold text-slate-700">{incident.time || '--:--'}</p>
                  </div>
                </div>
              </div>
            </StyledSection>

            {/* 2. Description */}
            <StyledSection icon={DocumentTextIcon} title="Description" iconBg="bg-slate-100">
              <div className="p-4 bg-slate-50 rounded-[20px] text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {incident.description || 'Aucune description fournie.'}
              </div>
            </StyledSection>

            {/* 2.1 Photo */}
            {incident.photo && (
              <StyledSection icon={PhotoIcon} title="Preuve visuelle (Photo)" iconBg="bg-blue-100">
                <div className="rounded-[24px] overflow-hidden border border-slate-100 shadow-sm relative group cursor-pointer" onClick={() => window.open(incident.photo, '_blank')}>
                  <img
                    src={incident.photo}
                    alt="Illustration de l'incident"
                    className="w-full h-auto max-h-[500px] object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <MagnifyingGlassIcon className="h-10 w-10 text-white" />
                  </div>
                </div>
              </StyledSection>
            )}

            {/* 3. Actions (Si présentes) */}
            {incident.actions_taken && (
              <StyledSection icon={WrenchScrewdriverIcon} title="Actions entreprises" iconBg="bg-emerald-100">
                <div className="p-4 bg-emerald-50 rounded-[20px] text-emerald-800 text-sm leading-relaxed border border-emerald-100">
                  {incident.actions_taken}
                </div>
              </StyledSection>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <div className="space-y-6">
            {/* Badge Gravité */}
            <div className={`p-6 rounded-[32px] border ${sevConfig.border} ${sevConfig.bg} shadow-sm`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl bg-white shadow-sm`}>
                  <ShieldExclamationIcon className={`h-6 w-6 ${sevConfig.text}`} />
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase opacity-70 ${sevConfig.text}`}>Gravité</p>
                  <p className={`text-xl font-black ${sevConfig.text}`}>{severityLabels[incident.severity]}</p>
                </div>
              </div>
            </div>

            {/* Historique */}
            <div className="bg-white rounded-[32px] p-2 border border-slate-100 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-50">
                <h3 className="font-bold text-slate-800">Historique</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="p-4 bg-slate-50 rounded-[20px] flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Créé le</p>
                    <p className="text-sm font-bold text-slate-700">{formatDateFR(incident.created_at, true)}</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-[20px] flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Dernière modif.</p>
                    <p className="text-sm font-bold text-slate-700">{formatDateFR(incident.updated_at, true)}</p>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-[20px] flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Statut</p>
                    <p className="text-sm font-bold text-blue-700">{statusLabels[incident.status]}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}