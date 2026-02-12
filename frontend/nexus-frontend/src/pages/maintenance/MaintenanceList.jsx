import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  WrenchScrewdriverIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
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

export default function MaintenanceList() {
  const { isSupervisor } = useAuthStore();
  const [records, setRecords] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterEquipment, setFilterEquipment] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterStatus) params.append('status', filterStatus);
      if (filterType) params.append('maintenance_type', filterType);
      if (filterEquipment) params.append('equipment', filterEquipment);

      const [recordsRes, equipmentRes] = await Promise.all([
        api.get(`/maintenance/?${params.toString()}`),
        api.get('/equipment/?page_size=200'),
      ]);

      setRecords(recordsRes.data.results || recordsRes.data);
      setEquipment(equipmentRes.data.results || equipmentRes.data);
    } catch (error) {
      console.error('Erreur chargement maintenance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, filterStatus, filterType, filterEquipment]);

  const stats = useMemo(() => {
    const total = records.length;
    const scheduled = records.filter((r) => r.status === 'SCHEDULED').length;
    const inProgress = records.filter((r) => r.status === 'IN_PROGRESS').length;
    const completed = records.filter((r) => r.status === 'COMPLETED').length;
    return { total, scheduled, inProgress, completed };
  }, [records]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-amber-50/30"></div>

      <div className="space-y-6">
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200/60">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-sm">
                  <div className="absolute inset-0 rounded-2xl bg-white/20"></div>
                  <WrenchScrewdriverIcon className="h-7 w-7 text-white relative" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-semibold text-slate-800">Maintenance</h1>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-700">
                      {records.length} interventions
                    </span>
                  </div>
                  <p className="mt-1 text-slate-500">Suivez les interventions et le parc d'équipements</p>
                </div>
              </div>

              {isSupervisor() && (
                <Link
                  to="/maintenance/new"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-base font-semibold text-white shadow-sm"
                >
                  <PlusIcon className="h-5 w-5" />
                  Nouvelle maintenance
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
            <p className="text-base text-slate-500">Total</p>
            <p className="text-xl font-semibold text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
            <p className="text-base text-slate-500">Planifiées</p>
            <p className="text-xl font-semibold text-slate-800">{stats.scheduled}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
            <p className="text-base text-slate-500">En cours</p>
            <p className="text-xl font-semibold text-slate-800">{stats.inProgress}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
            <p className="text-base text-slate-500">Terminées</p>
            <p className="text-xl font-semibold text-slate-800">{stats.completed}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-3 top-3" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un code"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <select
              value={filterEquipment}
              onChange={(e) => setFilterEquipment(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Tous les équipements</option>
              {equipment.map((eq) => (
                <option key={eq.id} value={eq.id}>{eq.equipment_code} • {eq.name}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Tous les types</option>
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Tous les statuts</option>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">Interventions</h2>
            <span className="text-sm text-slate-500">{records.length} enregistrements</span>
          </div>
          <div className="space-y-3">
            {records.map((record) => {
              const conf = statusConfig[record.status] || statusConfig.SCHEDULED;
              const Icon = conf.icon;
              return (
                <Link
                  key={record.id}
                  to={`/maintenance/${record.id}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200/60 hover:border-amber-200 hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${conf.bg} ${conf.text}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-800">{record.maintenance_code}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        <ClipboardDocumentListIcon className="h-4 w-4" /> {typeLabels[record.maintenance_type] || record.maintenance_type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-semibold text-slate-800">{record.equipment_code}</p>
                    <p className={`text-sm font-medium ${conf.text}`}>{statusLabels[record.status] || record.status}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
