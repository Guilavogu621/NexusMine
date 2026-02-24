import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  WrenchScrewdriverIcon,
  MapPinIcon,
  CalendarIcon,
  CpuChipIcon,
  TagIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CogIcon,
  HashtagIcon,
  ChevronLeftIcon,
  InformationCircleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const typeLabels = {
  TRUCK: 'Camion',
  EXCAVATOR: 'Pelle excavatrice',
  LOADER: 'Chargeuse',
  DRILL: 'Foreuse',
  CRUSHER: 'Concasseur',
  CONVEYOR: 'Convoyeur',
  PUMP: 'Pompe',
  GENERATOR: 'Générateur',
  OTHER: 'Autre',
};

const typeEmojis = {
  TRUCK: '🚛',
  EXCAVATOR: '🏗️',
  LOADER: '🚜',
  DRILL: '🔩',
  CRUSHER: '⚙️',
  CONVEYOR: '🔗',
  PUMP: '💧',
  GENERATOR: '⚡',
  OTHER: '🔧',
};

const statusLabels = {
  OPERATIONAL: 'Opérationnel',
  MAINTENANCE: 'En maintenance',
  BREAKDOWN: 'En panne',
  RETIRED: 'Hors service',
};

const statusConfig = {
  OPERATIONAL: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-500', icon: CheckCircleIcon },
  MAINTENANCE: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', dot: 'bg-amber-500', icon: WrenchScrewdriverIcon },
  BREAKDOWN: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100', dot: 'bg-orange-500', icon: ExclamationTriangleIcon },
  RETIRED: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400', icon: ClockIcon },
};

export default function EquipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isSiteManager, isAnalyst, isMMG, isTechnicien } = useAuthStore();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const canEdit = isAdmin() || isSiteManager() || isAnalyst() || isTechnicien();

  useEffect(() => { fetchEquipment(); }, [id]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/equipment/${id}/`);
      setEquipment(response.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Supprimer définitivement "${equipment.name}" ?`)) return;
    try {
      setDeleting(true);
      await api.delete(`/equipment/${id}/`);
      navigate('/equipment');
    } catch (error) { alert('Erreur lors de la suppression'); setDeleting(false); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  if (!equipment) return (
    <div className="text-center py-20">
      <ExclamationTriangleIcon className="h-16 w-16 mx-auto text-slate-300 mb-4" />
      <h2 className="text-xl font-black text-slate-800">Équipement introuvable</h2>
      <Link to="/equipment" className="text-blue-600 font-bold mt-4 inline-block">Retour à la liste</Link>
    </div>
  );

  const config = statusConfig[equipment.status] || statusConfig.OPERATIONAL;

  return (
    <div className="max-w-6xl mx-auto px-4 pb-12 space-y-6">

      {/* ── BOUTON RETOUR HAUT ── */}
      <button
        onClick={() => navigate('/equipment')}
        className="group flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all font-black text-xs uppercase tracking-widest"
      >
        <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-100 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
          <ChevronLeftIcon className="h-4 w-4" />
        </div>
        Retour à la liste
      </button>

      {/* ── BANNIÈRE PREMIUM ── */}
      <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 shadow-xl animate-fadeInDown">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="p-6 bg-white/20 backdrop-blur-xl rounded-[32px] shadow-2xl ring-1 ring-white/30 transition-transform hover:rotate-3">
              <span className="text-6xl drop-shadow-lg">{typeEmojis[equipment.equipment_type]}</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                <BadgeBlur label={equipment.equipment_code} icon={HashtagIcon} />
                <BadgeBlur label={typeLabels[equipment.equipment_type]} icon={CogIcon} />
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none uppercase">
                {equipment.name}
              </h1>
              <div className="mt-6 flex items-center justify-center md:justify-start gap-4">
                <div className={`px-6 py-2 rounded-full font-black text-sm uppercase tracking-tighter shadow-lg ${config.bg} ${config.text} border-2 ${config.border} flex items-center gap-2`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${config.dot} animate-pulse`}></span>
                  {statusLabels[equipment.status]}
                </div>
              </div>
            </div>
          </div>

          {canEdit && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={`/equipment/${id}/edit`} className="px-8 py-4 bg-white text-blue-700 rounded-[22px] font-black shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                <PencilSquareIcon className="h-5 w-5" /> Modifier
              </Link>
              <button onClick={handleDelete} className="px-8 py-4 bg-red-500/20 backdrop-blur-md border border-red-400/30 text-white rounded-[22px] font-black hover:bg-red-500 transition-all flex items-center justify-center gap-2">
                <TrashIcon className="h-5 w-5" /> Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── GRILLE DE DÉTAILS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* COLONNE GAUCHE: INFOS TECHNIQUES */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#f0f9ff] rounded-[35px] p-1.5 border border-blue-50 shadow-sm">
            <div className="bg-white rounded-[30px] p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <InformationCircleIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Fiche Technique Complète</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                <DetailItem label="Site de déploiement" value={equipment.site_name} icon={MapPinIcon} color="text-red-500" />
                <DetailItem label="Constructeur / Marque" value={equipment.manufacturer} icon={CpuChipIcon} color="text-blue-500" />
                <DetailItem label="Modèle exact" value={equipment.model} icon={TagIcon} color="text-indigo-500" />
                <DetailItem label="Numéro de série" value={equipment.serial_number} icon={HashtagIcon} color="text-slate-400" />
                <DetailItem
                  label="Mise en service"
                  value={equipment.commissioning_date ? new Date(equipment.commissioning_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Non définie'}
                  icon={CalendarDaysIcon}
                  color="text-emerald-500"
                />
                <DetailItem label="Catégorie" value={typeLabels[equipment.equipment_type]} icon={CogIcon} color="text-amber-500" />
              </div>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE: TIMELINE / HISTORIQUE */}
        <div className="space-y-6">
          <div className="bg-[#f8fafc] rounded-[35px] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Traçabilité Système</h3>

            <div className="space-y-6">
              <TimelineStep
                label="Date de Création"
                date={new Date(equipment.created_at).toLocaleString('fr-FR')}
                icon={CalendarIcon}
                bg="bg-emerald-50"
                text="text-emerald-600"
              />
              <TimelineStep
                label="Dernière Mise à jour"
                date={new Date(equipment.updated_at).toLocaleString('fr-FR')}
                icon={ClockIcon}
                bg="bg-blue-50"
                text="text-blue-600"
              />
            </div>

            <div className="mt-10 p-5 bg-white rounded-2xl border border-slate-50 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-2">Note interne</p>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                Cet équipement est sous surveillance télémétrique. Toute modification du statut impacte directement le planning de production du site {equipment.site_name}.
              </p>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeInDown { animation: fadeInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}

/* ── COMPOSANTS INTERNES ── */

function BadgeBlur({ label, icon: Icon }) {
  return (
    <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg flex items-center gap-2 border border-white/10">
      <Icon className="h-3.5 w-3.5 text-blue-200" />
      <span className="text-[10px] font-black text-white uppercase tracking-widest">{label || 'N/A'}</span>
    </div>
  );
}

function DetailItem({ label, value, icon: Icon, color }) {
  return (
    <div className="flex items-start gap-4">
      <div className={`p-3 bg-slate-50 rounded-xl border border-slate-100`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div>
        <dt className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</dt>
        <dd className="text-base font-bold text-slate-800">{value || '—'}</dd>
      </div>
    </div>
  );
}

function TimelineStep({ label, date, icon: Icon, bg, text }) {
  return (
    <div className="flex gap-4">
      <div className={`h-10 w-10 shrink-0 rounded-full ${bg} ${text} flex items-center justify-center shadow-sm`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-slate-700">{date}</p>
      </div>
    </div>
  );
}