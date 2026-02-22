import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CubeIcon,
  MapPinIcon,
  ArrowsRightLeftIcon,
  TruckIcon,
  BeakerIcon,
  CalendarIcon,
  HashtagIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const mineralLabels = {
  BAUXITE: { label: 'Bauxite', color: 'text-orange-600', bg: 'bg-orange-50' },
  IRON: { label: 'Fer', color: 'text-red-600', bg: 'bg-red-50' },
  GOLD: { label: 'Or', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  DIAMOND: { label: 'Diamant', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  MANGANESE: { label: 'Manganèse', color: 'text-slate-600', bg: 'bg-slate-50' },
  URANIUM: { label: 'Uranium', color: 'text-lime-600', bg: 'bg-lime-50' },
  OTHER: { label: 'Autre', color: 'text-purple-600', bg: 'bg-purple-50' },
};

const movementConfig = {
  INITIAL: { label: 'Stock initial', color: 'bg-indigo-50 text-indigo-700 border-indigo-100', icon: CubeIcon },
  EXTRACTION: { label: 'Extraction', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: BeakerIcon },
  EXPEDITION: { label: 'Expédition', color: 'bg-orange-50 text-orange-700 border-orange-100', icon: TruckIcon },
  TRANSFER_IN: { label: 'Transfert entrant', color: 'bg-sky-50 text-sky-700 border-sky-100', icon: ArrowsRightLeftIcon },
  TRANSFER_OUT: { label: 'Transfert sortant', color: 'bg-violet-50 text-violet-700 border-violet-100', icon: ArrowsRightLeftIcon },
  ADJUSTMENT: { label: 'Ajustement', color: 'bg-slate-50 text-slate-600 border-slate-100', icon: HashtagIcon },
  LOSS: { label: 'Perte', color: 'bg-red-50 text-red-700 border-red-100', icon: ChartBarIcon },
};

export default function StockDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isSiteManager } = useAuthStore();
  const [location, setLocation] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  const canEdit = isAdmin() || isSiteManager();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [locRes, mvRes] = await Promise.all([
          api.get(`/stock-locations/${id}/`),
          api.get(`/stock-movements/?location=${id}&page_size=50`),
        ]);
        setLocation(locRes.data);
        setMovements(mvRes.data.results || mvRes.data);
      } catch (err) {
        console.error('Erreur chargement stock:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600" />
            <SparklesIcon className="h-6 w-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-500 font-medium animate-pulse">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="p-5 bg-red-100 rounded-2xl mb-6">
          <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Emplacement introuvable</h2>
        <p className="text-slate-500 mb-8 text-center max-w-md">La zone de stockage demandée n'existe pas ou a été déplacée.</p>
        <button onClick={() => navigate('/stock')} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-xl hover:bg-black transition-all">
          Retour à l'inventaire
        </button>
      </div>
    );
  }

  const stockPercentage = location.capacity ? Math.min((location.current_stock / location.capacity) * 100, 100) : 0;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 pb-12">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">

        {/* ── HEADER PREMIUM ── */}
        <div className="group relative overflow-hidden rounded-[40px] bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 shadow-2xl animate-fadeInDown">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="stockDetailGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
              <rect width="100" height="100" fill="url(#stockDetailGrid)" />
            </svg>
          </div>

          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-700"></div>

          <div className="relative p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
              <button
                onClick={() => navigate('/stock')}
                className="group inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/10 backdrop-blur-md text-white rounded-2xl hover:bg-white hover:text-indigo-600 transition-all duration-300 shadow-lg border border-white/20"
              >
                <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-bold uppercase tracking-widest font-outfit">Retour à l'inventaire</span>
              </button>

              {canEdit && (
                <Link
                  to="/stock/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 font-outfit"
                >
                  <ArrowsRightLeftIcon className="h-4 w-4" />
                  Nouveau mouvement
                </Link>
              )}
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="p-6 bg-white/20 backdrop-blur-md rounded-[32px] shadow-2xl ring-4 ring-white/30 group-hover:scale-105 transition-transform duration-500">
                <CubeIcon className="h-12 w-12 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-white/20">
                  <MapPinIcon className="h-3.5 w-3.5" />
                  {location.site_name}
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight font-outfit mb-3">
                  {location.code} — <span className="opacity-80 font-medium">{location.name}</span>
                </h1>
                <p className="text-blue-100 font-medium text-lg opacity-90 max-w-2xl">
                  Zone de stockage de type <span className="text-white font-bold underline decoration-indigo-400 underline-offset-4">{location.location_type_display}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── STATS SECTION ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-[32px] border border-white/20 shadow-xl group overflow-hidden animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Volume Actuel</p>
              <div className="flex items-baseline gap-3 mt-4">
                <p className="text-5xl font-black text-slate-900 font-outfit">{Number(location.current_stock || 0).toLocaleString()}</p>
                <p className="text-xl font-bold text-slate-400 tracking-tight">tonnes</p>
              </div>
              {location.capacity && (
                <div className="mt-8 space-y-3">
                  <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                    <span className="text-slate-500">Utilisation</span>
                    <span className={stockPercentage > 90 ? 'text-rose-600' : 'text-indigo-600'}>{stockPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${stockPercentage > 90 ? 'bg-gradient-to-r from-rose-500 to-red-600' : 'bg-gradient-to-r from-indigo-500 to-blue-600'}`}
                      style={{ width: `${stockPercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700">
              <CubeIcon className="h-40 w-40 text-slate-900" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-8 rounded-[32px] border border-white/20 shadow-xl animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Capacité Maximale</p>
            <div className="flex items-baseline gap-3 mt-4">
              <p className="text-5xl font-black text-slate-900 font-outfit">{location.capacity ? Number(location.capacity).toLocaleString() : '∞'}</p>
              <p className="text-xl font-bold text-slate-400 tracking-tight">tonnes</p>
            </div>
            <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
                {location.capacity
                  ? `Espace disponible : ${Number(location.capacity - location.current_stock).toLocaleString()} t`
                  : 'Capacité de stockage illimitée'}
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-8 rounded-[32px] border border-white/20 shadow-xl animate-fadeInUp" style={{ animationDelay: '300ms' }}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Activité Totale</p>
            <div className="flex items-baseline gap-3 mt-4">
              <p className="text-5xl font-black text-slate-900 font-outfit">{movements.length}</p>
              <p className="text-xl font-bold text-slate-400 tracking-tight">mouvements</p>
            </div>
            <div className="mt-8 flex items-center gap-3 text-emerald-600 font-bold text-xs uppercase tracking-widest px-4 py-2 bg-emerald-50 rounded-full w-fit">
              <ClockIcon className="h-4 w-4" />
              Dernier mouvement: {movements[0]?.date || '—'}
            </div>
          </div>
        </div>

        {/* ── TRANSACTIONS SECTION ── */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[40px] shadow-xl border border-white/40 overflow-hidden animate-fadeInUp" style={{ animationDelay: '400ms' }}>
          <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white flex justify-between items-center px-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-600 shadow-sm"><ChartBarIcon className="h-6 w-6" /></div>
              <h2 className="text-2xl font-black text-slate-900 font-outfit tracking-tight">Journal des Flux</h2>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Historique des 50 dernières actions</span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/30">
                  <th className="px-10 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Nature & Date</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Type Minerai</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Quantité Net</th>
                  <th className="px-10 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Référence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.length > 0 ? movements.map((mv, idx) => {
                  const mConfig = movementConfig[mv.movement_type] || movementConfig.ADJUSTMENT;
                  const Icon = mConfig.icon;
                  const mineral = mineralLabels[mv.mineral_type] || { label: mv.mineral_type, color: 'text-slate-600', bg: 'bg-slate-50' };
                  const isNegative = ['EXPEDITION', 'LOSS', 'TRANSFER_OUT'].includes(mv.movement_type);

                  return (
                    <tr key={mv.id} className="hover:bg-indigo-50/30 transition-all duration-300 group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl border transition-transform group-hover:scale-110 ${mConfig.color} shadow-sm`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{mConfig.label}</p>
                            <p className="text-xs font-semibold text-slate-400 mt-1">{new Date(mv.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex flex-col gap-1.5">
                          <span className={`inline-flex items-center w-fit px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${mineral.bg} ${mineral.color}`}>
                            {mineral.label}
                          </span>
                          {mv.grade && <span className="text-[10px] font-bold text-slate-400 ml-1">Teneur: {mv.grade}%</span>}
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className={`text-xl font-black font-outfit ${isNegative ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {isNegative ? '−' : '+'} {Number(mv.quantity).toLocaleString()} <span className="text-xs font-bold opacity-60">t</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg border border-slate-200 uppercase tracking-tighter">
                          {mv.movement_code || '---'}
                        </span>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="4" className="px-10 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="p-4 bg-slate-50 rounded-full mb-4">
                          <CubeIcon className="h-8 w-8 text-slate-300" />
                        </div>
                        <p className="font-bold text-slate-400 italic">Aucun mouvement enregistré pour cet emplacement.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
        .animate-fadeInDown { animation: fadeInDown 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }

        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}