import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  CubeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  XMarkIcon,
  ChartBarIcon,
  BeakerIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';
import { formatDateFR } from '../../utils/translationUtils';

/* ---------------- CONFIG ---------------- */

const validationLabels = {
  PENDING: 'En attente',
  APPROVED: 'Approuvée',
  REJECTED: 'Rejetée',
};

const validationConfig = {
  PENDING: { text: 'text-amber-600', bg: 'bg-amber-100', dot: 'bg-amber-500' },
  APPROVED: { text: 'text-emerald-600', bg: 'bg-emerald-100', dot: 'bg-emerald-500' },
  REJECTED: { text: 'text-red-600', bg: 'bg-red-100', dot: 'bg-red-500' },
};

const typeLabels = {
  EXTRACTION: 'Extraction',
  DRILLING: 'Forage',
  BLASTING: 'Dynamitage',
  TRANSPORT: 'Transport',
  PROCESSING: 'Traitement',
  MAINTENANCE: 'Maintenance',
  INSPECTION: 'Inspection',
  OTHER: 'Autre',
};

const typeEmojis = {
  EXTRACTION: '⛏️',
  DRILLING: '🔩',
  BLASTING: '💥',
  TRANSPORT: '🚛',
  PROCESSING: '⚙️',
  MAINTENANCE: '🔧',
  INSPECTION: '🔍',
  OTHER: '📋',
};

const statusConfig = {
  PLANNED: { text: 'text-sky-600', bg: 'bg-sky-100', dot: 'bg-sky-500', icon: ClockIcon, label: 'Planifiée' },
  IN_PROGRESS: { text: 'text-amber-600', bg: 'bg-amber-100', dot: 'bg-amber-500', icon: PlayIcon, label: 'En cours' },
  COMPLETED: { text: 'text-emerald-600', bg: 'bg-emerald-100', dot: 'bg-emerald-500', icon: CheckCircleIcon, label: 'Terminée' },
  CANCELLED: { text: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-500', icon: XMarkIcon, label: 'Annulée' },
};

/* ---------------- STYLED COMPONENTS ---------------- */

const StyledSection = ({ icon: Icon, title, iconBg, children }) => (
  <div className="bg-[#f0f9ff] rounded-[32px] overflow-hidden mb-6 border border-blue-50 shadow-sm animate-fadeIn">
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

/* ---------------- MAIN COMPONENT ---------------- */

export default function OperationsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSupervisor, isSiteManager } = useAuthStore();

  const [operation, setOperation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    api.get(`/operations/${id}/`)
      .then(res => setOperation(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm(`Supprimer l'opération ${operation.operation_code} ?`)) return;
    setDeleting(true);
    await api.delete(`/operations/${id}/`);
    navigate('/operations');
  };

  const handleValidate = async (actionType) => {
    if (actionType === 'reject' && !rejectReason.trim()) {
      alert('Le motif de rejet est requis');
      return;
    }
    try {
      setValidating(true);
      const payload = { action: actionType };
      if (actionType === 'reject') payload.rejection_reason = rejectReason;
      await api.post(`/operations/${id}/validate/`, payload);
      const updated = await api.get(`/operations/${id}/`);
      setOperation(updated.data);
      setShowRejectModal(false);
      setRejectReason('');
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de la validation');
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!operation) {
    return (
      <div className="text-center py-20 bg-slate-50 min-h-screen">
        <ExclamationTriangleIcon className="h-16 w-16 mx-auto text-red-400" />
        <p className="mt-4 text-xl font-bold text-slate-800">Opération introuvable</p>
        <Link to="/operations" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg">
          <ArrowLeftIcon className="h-5 w-5" /> Retour à la liste
        </Link>
      </div>
    );
  }

  const cfg = statusConfig[operation.status] || statusConfig.PLANNED;
  const valCfg = validationConfig[operation.validation_status] || validationConfig.PENDING;
  const StatusIcon = cfg.icon;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <div className="max-w-6xl mx-auto px-4 pt-8 space-y-6">

        {/* ── HEADER PREMIUM ── */}
        <div className="relative overflow-hidden rounded-[35px] bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-xl animate-fadeInDown">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          <div className="relative p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <Link to="/operations" className="p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-white/30 transition-all shadow-lg">
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div className="flex items-center gap-4">
                <div className="text-5xl drop-shadow-md">{typeEmojis[operation.operation_type]}</div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{operation.operation_code}</h1>
                  <p className="text-blue-100 font-medium opacity-90 flex items-center gap-2">
                    {typeLabels[operation.operation_type]}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isSiteManager() && operation.validation_status === 'PENDING' && (
                <>
                  <button onClick={() => handleValidate('approve')} disabled={validating} className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-600 transition-all flex items-center gap-2">
                    {validating ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircleIcon className="h-5 w-5" />}
                    Valider
                  </button>
                  <button onClick={() => setShowRejectModal(true)} disabled={validating} className="px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold shadow-lg hover:bg-orange-600 transition-all flex items-center gap-2">
                    <XMarkIcon className="h-5 w-5" /> Rejeter
                  </button>
                </>
              )}
              {isSupervisor() && (
                <>
                  <Link to={`/operations/${id}/edit`} className="px-5 py-2.5 bg-white text-blue-700 rounded-xl font-bold shadow-md hover:bg-blue-50 transition-all flex items-center gap-2">
                    <PencilSquareIcon className="h-5 w-5" /> Modifier
                  </Link>
                  <button onClick={handleDelete} disabled={deleting} className="px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-white rounded-xl font-bold hover:bg-red-500 transition-all">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── KPI SECTION ── */}
        {operation.quantity_extracted && (
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-blue-50 flex items-center gap-6 animate-fadeInUp">
            <div className="p-4 bg-blue-100 rounded-[24px]">
              <CubeIcon className="h-10 w-10 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Quantité totale extraite</p>
              <p className="text-3xl font-black text-slate-800">
                {Number(operation.quantity_extracted).toLocaleString()} <span className="text-lg text-slate-400 font-bold">Tonnes (t)</span>
              </p>
            </div>
          </div>
        )}

        {/* ── CONTENT GRID ── */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-2">

            <StyledSection icon={BeakerIcon} title="Détails logistiques" iconBg="bg-blue-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailCard icon={MapPinIcon} color="text-red-500" label="Site d'opération" value={operation.site_name} />
                <DetailCard icon={CalendarIcon} color="text-blue-500" label="Date prévue" value={formatDateFR(operation.date)} />
                <DetailCard icon={ClockIcon} color="text-amber-500" label="Horaires" value={`${operation.start_time || '--'} → ${operation.end_time || '--'}`} />
                <DetailCard icon={ChartBarIcon} color="text-indigo-500" label="Type d'activité" value={typeLabels[operation.operation_type]} />
              </div>
            </StyledSection>

            <StyledSection icon={DocumentTextIcon} title="Description & Notes" iconBg="bg-slate-100">
              <div className="p-4 bg-slate-50 rounded-[20px] text-slate-600 text-sm leading-relaxed whitespace-pre-line min-h-[100px]">
                {operation.description || "Aucune description fournie pour cette opération."}
              </div>
            </StyledSection>
          </div>

          {/* SIDEBAR STATUS */}
          <div className="space-y-6">
            <div className={`p-6 rounded-[32px] border ${cfg.dot.replace('bg-', 'border-').replace('500', '200')} ${cfg.bg} shadow-sm`}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-white shadow-sm">
                  <StatusIcon className={`h-6 w-6 ${cfg.text}`} />
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase opacity-70 ${cfg.text}`}>Statut Actuel</p>
                  <p className={`text-xl font-black ${cfg.text}`}>{cfg.label || operation.status}</p>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-[32px] border ${valCfg.dot.replace('bg-', 'border-').replace('500', '200')} ${valCfg.bg} shadow-sm`}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-white shadow-sm">
                  <CheckCircleIcon className={`h-6 w-6 ${valCfg.text}`} />
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase opacity-70 ${valCfg.text}`}>Validation</p>
                  <p className={`text-xl font-black ${valCfg.text}`}>{validationLabels[operation.validation_status]}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-2 border border-slate-100 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-50">
                <h3 className="font-bold text-slate-800">Traçabilité</h3>
              </div>
              <div className="p-4 space-y-3">
                <HistoryItem label="Création" date={operation.created_at} dot="bg-blue-500" />
                <HistoryItem label="Mise à jour" date={operation.updated_at} dot="bg-amber-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALE DE REJET STYLE PREMIUM */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-scaleIn">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-orange-100 rounded-2xl text-orange-600">
                <ExclamationTriangleIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-black text-slate-800">Motif du rejet</h3>
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Expliquez pourquoi cette opération est rejetée..."
              className="w-full rounded-2xl bg-slate-50 border-0 ring-1 ring-slate-200 text-slate-800 px-4 py-3 focus:ring-2 focus:ring-orange-500 transition-all outline-none"
            />
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => { setShowRejectModal(false); setRejectReason(''); }} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all">
                Annuler
              </button>
              <button onClick={() => handleValidate('reject')} disabled={validating || !rejectReason.trim()} className="px-6 py-2.5 rounded-xl bg-orange-600 text-white font-bold shadow-lg hover:bg-orange-700 disabled:opacity-50">
                {validating ? 'Envoi...' : 'Confirmer le rejet'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-fadeInDown { animation: fadeInDown 0.6s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}

/* ---------------- HELPER COMPONENTS ---------------- */

function DetailCard({ icon: Icon, color, label, value }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[20px] border border-transparent hover:border-blue-100 transition-colors">
      <Icon className={`h-6 w-6 ${color}`} />
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-slate-700">{value || '—'}</p>
      </div>
    </div>
  );
}

function HistoryItem({ label, date, dot }) {
  return (
    <div className="p-4 bg-slate-50 rounded-[20px] flex items-center gap-4">
      <div className={`h-2 w-2 rounded-full ${dot}`} />
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
        <p className="text-sm font-bold text-slate-700">{formatDateFR(date, true)}</p>
      </div>
    </div>
  );
}