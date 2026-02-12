import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const typeLabels = {
  PREVENTIVE: 'Préventive',
  CORRECTIVE: 'Corrective',
  INSPECTION: 'Inspection',
  OVERHAUL: 'Révision générale',
  REPAIR: 'Réparation',
};

const statusLabels = {
  SCHEDULED: 'Planifiée',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
};

const statusConfig = {
  SCHEDULED: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CalendarIcon },
  IN_PROGRESS: { bg: 'bg-amber-100', text: 'text-amber-700', icon: ClockIcon },
  COMPLETED: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircleIcon },
  CANCELLED: { bg: 'bg-slate-100', text: 'text-slate-600', icon: ExclamationTriangleIcon },
};

export default function MaintenanceDetail() {
  const { id } = useParams();
  const { isSupervisor } = useAuthStore();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/maintenance/${id}/`);
      setRecord(response.data);
    } catch (error) {
      console.error('Erreur chargement maintenance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleComplete = async () => {
    try {
      setCompleting(true);
      await api.post(`/maintenance/${id}/complete/`, {
        findings: record.findings,
        actions_taken: record.actions_taken,
        parts_replaced: record.parts_replaced,
        cost: record.cost,
      });
      fetchData();
    } catch (error) {
      console.error('Erreur completion:', error);
      alert('Erreur lors de la clôture');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="text-center text-slate-500">Maintenance introuvable</div>
    );
  }

  const conf = statusConfig[record.status] || statusConfig.SCHEDULED;
  const Icon = conf.icon;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/maintenance" className="p-2 rounded-lg hover:bg-slate-100">
          <ArrowLeftIcon className="h-5 w-5 text-slate-500" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 rounded-xl">
            <WrenchScrewdriverIcon className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{record.maintenance_code}</h1>
            <p className="text-base text-slate-500">{record.equipment_code}</p>
          </div>
        </div>
        <span className={`ml-auto inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${conf.bg} ${conf.text}`}>
          <Icon className="h-4 w-4" />
          {statusLabels[record.status] || record.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
          <p className="text-base text-slate-500">Type</p>
          <p className="text-xl font-bold text-slate-800">{typeLabels[record.maintenance_type] || record.maintenance_type}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
          <p className="text-base text-slate-500">Date prévue</p>
          <p className="text-xl font-bold text-slate-800">{record.scheduled_date}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
          <p className="text-base text-slate-500">Coût</p>
          <p className="text-xl font-bold text-slate-800">{record.cost ? `${record.cost} GNF` : 'N/A'}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Description</h2>
          <p className="text-base text-slate-500">{record.description}</p>
        </div>
        {record.findings && (
          <div>
            <h3 className="text-base font-semibold text-slate-800 mb-2">Constatations</h3>
            <p className="text-base text-slate-500">{record.findings}</p>
          </div>
        )}
        {record.actions_taken && (
          <div>
            <h3 className="text-base font-semibold text-slate-800 mb-2">Actions réalisées</h3>
            <p className="text-base text-slate-500">{record.actions_taken}</p>
          </div>
        )}
        {record.parts_replaced && (
          <div>
            <h3 className="text-base font-semibold text-slate-800 mb-2">Pièces remplacées</h3>
            <p className="text-base text-slate-500">{record.parts_replaced}</p>
          </div>
        )}
      </div>

      {isSupervisor() && record.status !== 'COMPLETED' && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleComplete}
            disabled={completing}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {completing ? 'Clôture...' : 'Marquer terminé'}
          </button>
        </div>
      )}
    </div>
  );
}
