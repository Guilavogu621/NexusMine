import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CubeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowsRightLeftIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

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
  EXTRACTION: 'bg-blue-100 text-emerald-700',
  EXPEDITION: 'bg-amber-100 text-amber-700',
  TRANSFER_IN: 'bg-sky-100 text-sky-700',
  TRANSFER_OUT: 'bg-violet-100 text-violet-700',
  ADJUSTMENT: 'bg-slate-100 text-slate-600',
  LOSS: 'bg-red-100 text-red-700',
};

const CHART_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
const incomingTypes = new Set(['INITIAL', 'EXTRACTION', 'TRANSFER_IN']);
const outgoingTypes = new Set(['EXPEDITION', 'TRANSFER_OUT', 'LOSS']);

export default function StockList() {
  const { isSupervisor, hasRole } = useAuthStore();
  const [locations, setLocations] = useState([]);
  const [movements, setMovements] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterMineral, setFilterMineral] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterSite) params.append('site', filterSite);
      if (filterMineral) params.append('mineral', filterMineral);
      if (search) params.append('search', search);

      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - 14);
      const dateFromStr = dateFrom.toISOString().split('T')[0];

      const [locationsRes, movementsRes, summariesRes, sitesRes] = await Promise.all([
        api.get(`/stock-locations/?${params.toString()}`),
        api.get(`/stock-movements/?${params.toString()}&date_from=${dateFromStr}&page_size=100`),
        api.get(`/stock-summary/?${filterSite ? `site=${filterSite}` : ''}`),
        api.get('/sites/'),
      ]);

      setLocations(locationsRes.data.results || locationsRes.data);
      setMovements(movementsRes.data.results || movementsRes.data);
      setSummaries(summariesRes.data.results || summariesRes.data);
      setSites(sitesRes.data.results || sitesRes.data);
    } catch (error) {
      console.error('Erreur chargement stock:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterSite, filterMineral, search]);

  const totals = useMemo(() => {
    return summaries.reduce(
      (acc, item) => {
        acc.current += Number(item.current_stock || 0);
        acc.extracted += Number(item.total_extracted || 0);
        acc.expedited += Number(item.total_expedited || 0);
        return acc;
      },
      { current: 0, extracted: 0, expedited: 0 }
    );
  }, [summaries]);

  const mineralDistribution = useMemo(() => {
    const data = summaries.map((item) => ({
      name: mineralLabels[item.mineral_type] || item.mineral_type,
      value: Number(item.current_stock || 0),
    }));
    return data.filter((d) => d.value > 0);
  }, [summaries]);

  const mineralFlows = useMemo(() => {
    return summaries.map((item) => ({
      name: mineralLabels[item.mineral_type] || item.mineral_type,
      extracted: Number(item.total_extracted || 0),
      expedited: Number(item.total_expedited || 0),
    }));
  }, [summaries]);

  const siteTotals = useMemo(() => {
    const map = new Map();
    summaries.forEach((item) => {
      const site = item.site_name || `Site ${item.site}`;
      map.set(site, (map.get(site) || 0) + Number(item.current_stock || 0));
    });
    return Array.from(map.entries())
      .map(([name, stock]) => ({ name, stock }))
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 6);
  }, [summaries]);

  const netFlowData = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 13; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split('T')[0];
      days.push({ key, name: d.toLocaleDateString('fr-FR', { weekday: 'short' }), net: 0 });
    }
    const map = new Map(days.map((d) => [d.key, d]));
    movements.forEach((mv) => {
      const entry = map.get(mv.date);
      if (!entry) return;
      const qty = Number(mv.quantity || 0);
      if (incomingTypes.has(mv.movement_type)) entry.net += qty;
      if (outgoingTypes.has(mv.movement_type)) entry.net -= qty;
    });
    return days;
  }, [movements]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-50 via-white to-indigo-50/30"></div>

      <div className="space-y-6">
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200/60">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-sm">
                  <div className="absolute inset-0 rounded-2xl bg-white/20"></div>
                  <CubeIcon className="h-7 w-7 text-white relative" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-semibold text-slate-800">Stock & Logistique</h1>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700">
                      {locations.length} emplacements
                    </span>
                  </div>
                  <p className="mt-1 text-slate-500">Suivi des stocks par site et mouvements de minerai</p>
                </div>
              </div>

              {hasRole(['ADMIN', 'SUPERVISOR', 'OPERATOR']) && (
                <Link
                  to="/stock/new"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-2.5 text-base font-semibold text-white shadow-sm"
                >
                  <PlusIcon className="h-5 w-5" />
                  Nouveau mouvement
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base text-slate-500">Stock actuel total</p>
                <p className="text-xl font-semibold text-slate-800">{totals.current.toLocaleString()} t</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-xl">
                <ArrowTrendingUpIcon className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base text-slate-500">Total extrait</p>
                <p className="text-xl font-semibold text-slate-800">{totals.extracted.toLocaleString()} t</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-xl">
                <ArrowTrendingUpIcon className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base text-slate-500">Total expédié</p>
                <p className="text-xl font-semibold text-slate-800">{totals.expedited.toLocaleString()} t</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <ArrowTrendingDownIcon className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
            <h3 className="text-base font-semibold text-slate-600 mb-3">Répartition par minerai</h3>
            {mineralDistribution.length === 0 ? (
              <p className="text-base text-slate-500">Aucune donnée</p>
            ) : (
              <div className="h-60">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={mineralDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>
                      {mineralDistribution.map((entry, index) => (
                        <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${Number(v).toLocaleString()} t`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
            <h3 className="text-base font-semibold text-slate-600 mb-3">Flux net (14 jours)</h3>
            <div className="h-60">
              <ResponsiveContainer>
                <LineChart data={netFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(v) => `${Number(v).toLocaleString()} t`} />
                  <Line type="monotone" dataKey="net" stroke="#6366F1" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
            <h3 className="text-base font-semibold text-slate-600 mb-3">Extraction vs Expédition</h3>
            <div className="h-60">
              <ResponsiveContainer>
                <BarChart data={mineralFlows}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(v) => `${Number(v).toLocaleString()} t`} />
                  <Bar dataKey="extracted" fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expedited" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
            <h3 className="text-base font-semibold text-slate-600 mb-3">Top sites (stock)</h3>
            {siteTotals.length === 0 ? (
              <p className="text-base text-slate-500">Aucune donnée</p>
            ) : (
              <div className="h-60">
                <ResponsiveContainer>
                  <BarChart data={siteTotals}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" hide />
                    <YAxis />
                    <Tooltip formatter={(v) => `${Number(v).toLocaleString()} t`} />
                    <Bar dataKey="stock" fill="#6366F1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-3 top-3" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un emplacement"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tous les sites</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
            <select
              value={filterMineral}
              onChange={(e) => setFilterMineral(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tous les minerais</option>
              {Object.entries(mineralLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-800">Emplacements de stockage</h2>
              <span className="text-sm text-slate-500">{locations.length} emplacements</span>
            </div>
            <div className="space-y-3">
              {locations.map((loc) => (
                <Link
                  key={loc.id}
                  to={`/stock/${loc.id}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200/60 hover:border-indigo-200 hover:shadow-sm transition"
                >
                  <div>
                    <p className="text-base font-semibold text-slate-800">{loc.code} • {loc.name}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4" /> {loc.site_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-semibold text-indigo-700">{Number(loc.current_stock || 0).toLocaleString()} t</p>
                    <p className="text-sm text-slate-500">{loc.location_type_display}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-800">Mouvements récents</h2>
              <span className="text-sm text-slate-500">{movements.length} mouvements</span>
            </div>
            <div className="space-y-3">
              {movements.slice(0, 8).map((mv) => (
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
                      <p className="text-sm text-slate-500">{mineralLabels[mv.mineral_type] || mv.mineral_type} • {mv.location_name}</p>
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
      </div>
    </div>
  );
}
