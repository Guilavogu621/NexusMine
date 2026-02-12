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
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

/* ---------------- CONFIG ---------------- */

const validationLabels = {
  PENDING: 'En attente',
  APPROVED: 'Approuvée',
  REJECTED: 'Rejetée',
};

const validationConfig = {
  PENDING: { text: 'text-amber-400', bg: 'bg-amber-500/10', dot: 'bg-amber-400' },
  APPROVED: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400' },
  REJECTED: { text: 'text-red-400', bg: 'bg-red-500/10', dot: 'bg-red-400' },
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
  PLANNED: { text: 'text-sky-400', bg: 'bg-sky-500/10', dot: 'bg-sky-400', icon: ClockIcon },
  IN_PROGRESS: { text: 'text-amber-400', bg: 'bg-amber-500/10', dot: 'bg-amber-400', icon: PlayIcon },
  COMPLETED: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400', icon: CheckCircleIcon },
  CANCELLED: { text: 'text-slate-400', bg: 'bg-slate-500/10', dot: 'bg-slate-400', icon: XMarkIcon },
};

/* ---------------- COMPONENT ---------------- */

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
      const res = await api.post(`/operations/${id}/validate/`, payload);
      // Recharger les données
      const updated = await api.get(`/operations/${id}/`);
      setOperation(updated.data);
      setShowRejectModal(false);
      setRejectReason('');
    } catch (error) {
      console.error('Erreur de validation:', error);
      alert(error.response?.data?.error || 'Erreur lors de la validation');
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96 text-slate-400">
        Chargement…
      </div>
    );
  }

  if (!operation) {
    return (
      <div className="text-center py-20">
        <ExclamationTriangleIcon className="h-12 w-12 mx-auto text-red-500" />
        <p className="mt-4 text-lg font-semibold text-slate-200">Opération introuvable</p>
        <Link to="/operations" className="mt-6 inline-flex items-center gap-2 text-indigo-400">
          <ArrowLeftIcon className="h-4 w-4" /> Retour
        </Link>
      </div>
    );
  }

  const cfg = statusConfig[operation.status];
  const StatusIcon = cfg.icon;

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-slate-100">

      {/* HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6">
        <div className="flex gap-4">
          <div className="text-4xl">{typeEmojis[operation.operation_type]}</div>
          <div>
            <h1 className="text-xl font-bold">{operation.operation_code}</h1>
            <p className="text-slate-400">{typeLabels[operation.operation_type]}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${cfg.bg} ${cfg.text}`}>
                <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                <StatusIcon className="h-4 w-4" />
                {operation.status}
              </div>
              {operation.validation_status && (
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${(validationConfig[operation.validation_status] || validationConfig.PENDING).bg} ${(validationConfig[operation.validation_status] || validationConfig.PENDING).text}`}>
                  <span className={`h-2 w-2 rounded-full ${(validationConfig[operation.validation_status] || validationConfig.PENDING).dot}`} />
                  {validationLabels[operation.validation_status] || operation.validation_status}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Boutons Valider/Rejeter — ADMIN et SITE_MANAGER uniquement, si en attente */}
          {isSiteManager() && operation.validation_status === 'PENDING' && (
            <>
              <button
                onClick={() => handleValidate('approve')}
                disabled={validating}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 inline-flex items-center gap-2 font-medium disabled:opacity-50"
              >
                <CheckCircleIcon className="h-4 w-4" />
                {validating ? 'Validation…' : 'Valider'}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={validating}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 inline-flex items-center gap-2 font-medium disabled:opacity-50"
              >
                <XMarkIcon className="h-4 w-4" />
                Rejeter
              </button>
            </>
          )}

          {isSupervisor() && (
            <>
              <Link
                to={`/operations/${id}/edit`}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 inline-flex items-center gap-2"
              >
                <PencilSquareIcon className="h-4 w-4" /> Modifier
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 inline-flex items-center gap-2"
              >
                <TrashIcon className="h-4 w-4" /> Supprimer
              </button>
            </>
          )}
        </div>
      </div>

      {/* MODALE DE REJET */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Motif du rejet</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Indiquez le motif du rejet…"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 text-slate-100 px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300"
              >
                Annuler
              </button>
              <button
                onClick={() => handleValidate('reject')}
                disabled={validating || !rejectReason.trim()}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 font-medium"
              >
                {validating ? 'Envoi…' : 'Confirmer le rejet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI */}
      {operation.quantity_extracted && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4">
          <CubeIcon className="h-8 w-8 text-indigo-400" />
          <div>
            <p className="text-slate-400">Quantité extraite</p>
            <p className="text-2xl font-bold">
              {Number(operation.quantity_extracted).toLocaleString()} t
            </p>
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* DETAILS */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <Detail icon={MapPinIcon} label="Site" value={operation.site_name || '—'} />
          <Detail icon={CalendarIcon} label="Date" value={new Date(operation.date).toLocaleDateString()} />
          <Detail icon={ClockIcon} label="Horaires" value={`${operation.start_time || '--'} → ${operation.end_time || '--'}`} />

          {operation.description && (
            <div className="pt-4 border-t border-slate-800">
              <p className="text-slate-400 mb-1">Description</p>
              <p className="text-slate-200 whitespace-pre-line">{operation.description}</p>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <p className="text-slate-400">Historique</p>
          <p>Créé : {new Date(operation.created_at).toLocaleDateString()}</p>
          <p>Modifié : {new Date(operation.updated_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- SMALL COMPONENT ---------------- */

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-indigo-400 mt-1" />
      <div>
        <p className="text-slate-400 text-sm">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
