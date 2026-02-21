import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CubeIcon,
  MapPinIcon,
  ArrowsRightLeftIcon,
  TruckIcon,
  BeakerIcon,
  CalendarIcon,
  HashtagIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import api from '../../api/axios';

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
  const [location, setLocation] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [locRes, mvRes] = await Promise.all([
          api.get(`/stock-locations/${id}/`),
          api.get(`/stock-movements/?location=${id}`),
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
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
        </div>
        <p className="text-slate-500 font-medium animate-pulse">Chargement des données...</p>
      </div>
    );
  }

  const stockPercentage = location.capacity ? Math.min((location.current_stock / location.capacity) * 100, 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 pb-12 space-y-8 animate-fadeIn">
      
      {/* Header avec Fil d'ariane */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link to="/stock" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors group">
            <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Retour à l'inventaire
          </Link>
          <div className="flex items-start gap-5">
            <div className="p-4 bg-white shadow-sm border border-slate-200 rounded-2xl">
              <CubeIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{location.code}</h1>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase tracking-wider">
                  {location.location_type_display}
                </span>
              </div>
              <p className="text-lg text-slate-500 font-medium mt-1">{location.name}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
                  <MapPinIcon className="h-4 w-4 text-indigo-500" /> {location.site_name}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
                  <CalendarIcon className="h-4 w-4 text-emerald-500" /> Mis à jour le {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Rapide */}
        <Link 
          to="/stock/new" 
          className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-slate-200 flex items-center gap-2"
        >
          <ArrowsRightLeftIcon className="h-5 w-5" />
          Nouveau mouvement
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Stock Actuel</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-4xl font-black text-slate-900">{Number(location.current_stock || 0).toLocaleString()}</p>
              <p className="text-lg font-bold text-slate-400 tracking-tight">tonnes</p>
            </div>
            {/* Barre de capacité */}
            {location.capacity && (
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Utilisation</span>
                  <span className={stockPercentage > 90 ? 'text-red-600' : 'text-indigo-600'}>{stockPercentage.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${stockPercentage > 90 ? 'bg-red-500' : 'bg-indigo-600'}`}
                    style={{ width: `${stockPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <CubeIcon className="h-32 w-32 text-slate-900" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Capacité Max</p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-4xl font-black text-slate-900">{location.capacity ? Number(location.capacity).toLocaleString() : '∞'}</p>
            <p className="text-lg font-bold text-slate-400 tracking-tight">tonnes</p>
          </div>
          <p className="text-sm text-slate-400 mt-4 font-medium italic">
            {location.capacity 
              ? `Espace disponible: ${Number(location.capacity - location.current_stock).toLocaleString()} t` 
              : 'Capacité illimitée pour ce site'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Activité</p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-4xl font-black text-slate-900">{movements.length}</p>
            <p className="text-lg font-bold text-slate-400 tracking-tight">mouvements</p>
          </div>
          <p className="text-sm text-slate-400 mt-4 font-medium uppercase tracking-tighter">Historique complet sur 30 jours</p>
        </div>
      </div>

      {/* Table / Liste des mouvements */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Journal des Mouvements</h2>
          <button className="text-sm font-bold text-indigo-600 hover:underline">Exporter (.csv)</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Type & Date</th>
                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Minerai</th>
                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Quantité</th>
                <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Référence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {movements.length > 0 ? movements.map((mv) => {
                const config = movementConfig[mv.movement_type] || movementConfig.ADJUSTMENT;
                const Icon = config.icon;
                const mineral = mineralLabels[mv.mineral_type] || { label: mv.mineral_type, color: 'text-slate-600', bg: 'bg-slate-50' };

                return (
                  <tr key={mv.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl border ${config.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{config.label}</p>
                          <p className="text-xs font-medium text-slate-400">{mv.date}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${mineral.bg} ${mineral.color}`}>
                        {mineral.label}
                      </span>
                      {mv.grade && <p className="text-[10px] text-slate-400 mt-1 font-bold">Grade: {mv.grade}%</p>}
                    </td>
                    <td className="px-8 py-5">
                      <p className={`font-black text-lg ${mv.movement_type === 'EXPEDITION' || mv.movement_type === 'LOSS' || mv.movement_type === 'TRANSFER_OUT' ? 'text-red-600' : 'text-emerald-600'}`}>
                        {mv.movement_type === 'EXPEDITION' || mv.movement_type === 'LOSS' || mv.movement_type === 'TRANSFER_OUT' ? '-' : '+'}
                        {Number(mv.quantity).toLocaleString()} t
                      </p>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-500 italic">
                      {mv.movement_code || '---'}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="4" className="px-8 py-12 text-center text-slate-400 font-medium italic">
                    Aucun mouvement enregistré pour cet emplacement.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}