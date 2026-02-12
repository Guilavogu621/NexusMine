import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CubeIcon,
  MapPinIcon,
  ArrowsRightLeftIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';

const mineralLabels = {
  BAUXITE: 'Bauxite',
  IRON: 'Fer',
  GOLD: 'Or',
  DIAMOND: 'Diamant',
  MANGANESE: 'Manganèse',
  URANIUM: 'Uranium',
  OTHER: 'Autre',
};

const movementLabels = {
  INITIAL: 'Stock initial',
  EXTRACTION: 'Extraction',
  EXPEDITION: 'Expédition',
  TRANSFER_IN: 'Transfert entrant',
  TRANSFER_OUT: 'Transfert sortant',
  ADJUSTMENT: 'Ajustement',
  LOSS: 'Perte',
};

const movementColors = {
  INITIAL: 'bg-indigo-50 text-indigo-700',
  EXTRACTION: 'bg-emerald-100 text-emerald-700',
  EXPEDITION: 'bg-amber-100 text-amber-700',
  TRANSFER_IN: 'bg-sky-100 text-sky-700',
  TRANSFER_OUT: 'bg-violet-100 text-violet-700',
  ADJUSTMENT: 'bg-slate-100 text-slate-600',
  LOSS: 'bg-red-100 text-red-700',
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="text-center text-slate-500">Emplacement introuvable</div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/stock" className="p-2 rounded-lg hover:bg-slate-100">
          <ArrowLeftIcon className="h-5 w-5 text-slate-500" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <CubeIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{location.code} • {location.name}</h1>
            <p className="text-base text-slate-500 flex items-center gap-2">
              <MapPinIcon className="h-4 w-4" /> {location.site_name}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
          <p className="text-base text-slate-500">Stock actuel</p>
          <p className="text-xl font-semibold text-slate-800">{Number(location.current_stock || 0).toLocaleString()} t</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
          <p className="text-base text-slate-500">Capacité</p>
          <p className="text-xl font-semibold text-slate-800">{location.capacity ? `${location.capacity} t` : 'N/A'}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5">
          <p className="text-base text-slate-500">Type</p>
          <p className="text-xl font-semibold text-slate-800">{location.location_type_display}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Mouvements</h2>
        <div className="space-y-3">
          {movements.map((mv) => (
            <div key={mv.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${movementColors[mv.movement_type] || 'bg-slate-100 text-slate-600'}`}>
                  {mv.movement_type === 'EXPEDITION' ? (
                    <TruckIcon className="h-4 w-4" />
                  ) : mv.movement_type.includes('TRANSFER') ? (
                    <ArrowsRightLeftIcon className="h-4 w-4" />
                  ) : (
                    <CubeIcon className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-800">{movementLabels[mv.movement_type] || mv.movement_type}</p>
                  <p className="text-sm text-slate-500">{mineralLabels[mv.mineral_type] || mv.mineral_type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base font-semibold text-slate-800">{Number(mv.quantity || 0).toLocaleString()} t</p>
                <p className="text-sm text-slate-500">{mv.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
