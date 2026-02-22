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
  SparklesIcon,
  FunnelIcon,
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
  INITIAL: 'bg-indigo-100 text-indigo-700',
  EXTRACTION: 'bg-emerald-100 text-emerald-700',
  EXPEDITION: 'bg-orange-100 text-orange-700',
  TRANSFER_IN: 'bg-sky-100 text-sky-700',
  TRANSFER_OUT: 'bg-violet-100 text-violet-700',
  ADJUSTMENT: 'bg-slate-100 text-slate-600',
  LOSS: 'bg-red-100 text-red-700',
};

const movementIcons = {
  INITIAL: CubeIcon,
  EXTRACTION: ArrowTrendingUpIcon,
  EXPEDITION: TruckIcon,
  TRANSFER_IN: ArrowsRightLeftIcon,
  TRANSFER_OUT: ArrowsRightLeftIcon,
  ADJUSTMENT: CubeIcon,
  LOSS: ArrowTrendingDownIcon,
};

const CHART_COLORS = ['#3B82F6', '#10B981', '#F97316', '#EF4444', '#8B5CF6', '#06B6D4'];
const incomingTypes = new Set(['INITIAL', 'EXTRACTION', 'TRANSFER_IN']);
const outgoingTypes = new Set(['EXPEDITION', 'TRANSFER_OUT', 'LOSS']);

// Custom Tooltip Premium
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700/50 animate-fadeInUp">
        <p className="font-bold text-slate-300 mb-3 text-xs uppercase tracking-wider">{label}</p>
        <div className="space-y-2">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color }}></span>
                <span className="text-slate-100">{entry.name}</span>
              </div>
              <span className="font-bold text-white ml-auto font-outfit text-base">
                {Number(entry.value).toLocaleString()} t
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// StatCard Premium
const StatCard = ({ label, value, icon: Icon, color, bgLight, borderLight, trend, trendUp, delay }) => (
  <div
    className="group relative bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden animate-fadeInUp"
    style={{ animationDelay: delay }}
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${borderLight} opacity-20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 group-hover:scale-150 transition-transform duration-700`}></div>

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <div className={`p-3 rounded-2xl ${bgLight} ${color} shadow-inner group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <p className="text-4xl font-bold text-slate-900 font-outfit mb-2">{value.toLocaleString()}</p>
      {trend && (
        <div className={`flex items-center gap-1.5 text-sm font-bold ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trendUp ? <ArrowTrendingUpIcon className="h-4 w-4" /> : <ArrowTrendingDownIcon className="h-4 w-4" />}
          <span>{trend} vs mois précédent</span>
        </div>
      )}
    </div>
  </div>
);

// ChartCard Premium
const ChartCard = ({ title, subtitle, children, className = '', delay }) => (
  <div
    className={`group bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-xl hover:shadow-2xl hover:border-white/40 transition-all duration-500 animate-fadeInUp ${className}`}
    style={{ animationDelay: delay }}
  >
    <div className="mb-6">
      <h3 className="text-xl font-bold text-slate-900 font-outfit">{title}</h3>
      {subtitle && <p className="text-sm font-medium text-slate-500 mt-1">{subtitle}</p>}
    </div>
    <div className="h-72 w-full">
      {children}
    </div>
  </div>
);

export default function StockList() {
  const { hasRole } = useAuthStore();
  const [locations, setLocations] = useState([]);
  const [movements, setMovements] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtres
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

  // Derived Data
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

  // Shared classes
  const filterInputClasses = "w-full py-3.5 px-5 rounded-2xl bg-white/50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 font-semibold text-slate-800 outline-none appearance-none cursor-pointer";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200 animate-spin border-t-blue-600"></div>
          <SparklesIcon className="h-10 w-10 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 pb-12">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative max-w-7xl mx-auto pt-8 px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header Premium */}
        <div className="group relative overflow-hidden rounded-[40px] bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 shadow-2xl animate-fadeInDown">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="stockGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
              <rect width="100" height="100" fill="url(#stockGrid)" />
            </svg>
          </div>

          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500"></div>

          <div className="relative p-8 px-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start gap-6">
                <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-xl ring-1 ring-white/30">
                  <CubeIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight font-outfit">
                    Stocks & Logistique
                  </h1>
                  <p className="mt-2 text-blue-100 font-medium opacity-90">
                    Gestion centralisée et suivi des flux minéraliers
                  </p>
                </div>
              </div>

              {hasRole(['ADMIN', 'SITE_MANAGER', 'TECHNICIEN']) && (
                <Link
                  to="/stock/new"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white text-indigo-700 rounded-xl font-bold shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <PlusIcon className="h-5 w-5" />
                  Nouveau mouvement
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
              {[
                { label: 'Stock actuel', value: totals.current, icon: CubeIcon, color: 'text-blue-200' },
                { label: 'Volume extrait', value: totals.extracted, icon: ArrowTrendingUpIcon, color: 'text-emerald-200' },
                { label: 'Volume expédié', value: totals.expedited, icon: TruckIcon, color: 'text-orange-200' },
                { label: 'Zones actives', value: locations.length, icon: MapPinIcon, color: 'text-purple-200' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 group/stat">
                  <div className="flex items-center gap-3 mb-2">
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    <p className="text-xs font-bold text-blue-100 uppercase tracking-widest">{stat.label}</p>
                  </div>
                  <p className="text-3xl font-bold text-white font-outfit tracking-tight">{stat.value.toLocaleString()} <span className="text-sm font-medium opacity-60">t</span></p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Barre de Filtres (Control Panel) */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-4 shadow-lg flex flex-col md:flex-row items-center gap-4 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 px-4 w-full md:w-auto border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0">
            <FunnelIcon className="h-5 w-5 text-slate-400" />
            <span className="font-bold text-slate-700">Filtres</span>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className={`${filterInputClasses} pl-12`}
              />
            </div>

            <select
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className={`${filterInputClasses} bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.5em] bg-[right_1rem_center] bg-no-repeat`}
            >
              <option value="">📍 Tous les sites</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>

            <select
              value={filterMineral}
              onChange={(e) => setFilterMineral(e.target.value)}
              className={`${filterInputClasses} bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.5em] bg-[right_1rem_center] bg-no-repeat`}
            >
              <option value="">💎 Tous les minerais</option>
              {Object.entries(mineralLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            label="Stock global actuel"
            value={totals.current}
            icon={CubeIcon}
            color="text-blue-600"
            bgLight="bg-blue-100"
            borderLight="from-blue-400 to-blue-600"
            trend="+12%"
            trendUp={true}
            delay="0.2s"
          />
          <StatCard
            label="Volume total extrait"
            value={totals.extracted}
            icon={ArrowTrendingUpIcon}
            color="text-emerald-600"
            bgLight="bg-emerald-100"
            borderLight="from-emerald-400 to-emerald-600"
            trend="+8.5%"
            trendUp={true}
            delay="0.3s"
          />
          <StatCard
            label="Volume total expédié"
            value={totals.expedited}
            icon={TruckIcon}
            color="text-orange-600"
            bgLight="bg-orange-100"
            borderLight="from-orange-400 to-orange-600"
            trend="-2.1%"
            trendUp={false}
            delay="0.4s"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <ChartCard title="Répartition par Minerai" subtitle="Volume en tonnes par type" delay="0.5s">
            {mineralDistribution.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 font-bold">Données insuffisantes</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mineralDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    stroke="none"
                  >
                    {mineralDistribution.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Flux Net (14 derniers jours)" subtitle="Bilan entrées/sorties quotidien" delay="0.6s">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={netFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="net" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Extraction vs Expédition" subtitle="Comparaison volumétrique" delay="0.7s">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mineralFlows} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="extracted" name="Extraction" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expedited" name="Expédition" fill="#f97316" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top Sites" subtitle="Volume stocké par localisation" delay="0.8s">
            {siteTotals.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 font-bold">Données insuffisantes</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={siteTotals} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 13, fontWeight: 700 }} width={100} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="stock" name="Stock" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

        </div>

        {/* Listes Détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">

          {/* Emplacements */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl overflow-hidden animate-fadeInUp" style={{ animationDelay: '0.9s' }}>
            <div className="p-6 border-b border-slate-100 bg-white/50">
              <h3 className="text-lg font-bold text-slate-900 font-outfit">État des Emplacements</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">{locations.length} zones actives</p>
            </div>
            <div className="p-4 space-y-3 h-[400px] overflow-y-auto custom-scrollbar">
              {locations.length === 0 ? (
                <p className="text-slate-400 font-bold text-center py-10">Aucun emplacement trouvé</p>
              ) : (
                locations.map((loc) => (
                  <Link
                    key={loc.id}
                    to={`/stock/${loc.id}`}
                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-blue-300 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <CubeIcon className="h-6 w-6 text-slate-400 group-hover:text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{loc.code} <span className="text-slate-400 font-normal ml-1">• {loc.name}</span></p>
                        <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1">
                          <MapPinIcon className="h-3.5 w-3.5" /> {loc.site_name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600 font-outfit text-lg">{Number(loc.current_stock || 0).toLocaleString()} t</p>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">{loc.location_type_display}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Mouvements */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl overflow-hidden animate-fadeInUp" style={{ animationDelay: '1.0s' }}>
            <div className="p-6 border-b border-slate-100 bg-white/50">
              <h3 className="text-lg font-bold text-slate-900 font-outfit">Journal des Mouvements</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Activité des 14 derniers jours</p>
            </div>
            <div className="p-4 space-y-3 h-[400px] overflow-y-auto custom-scrollbar">
              {movements.length === 0 ? (
                <p className="text-slate-400 font-bold text-center py-10">Aucun mouvement récent</p>
              ) : (
                movements.slice(0, 15).map((mv) => {
                  const IconComponent = movementIcons[mv.movement_type] || CubeIcon;
                  const isIncoming = incomingTypes.has(mv.movement_type);

                  return (
                    <div
                      key={mv.id}
                      className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${movementColors[mv.movement_type] || 'bg-slate-100 text-slate-600'}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{movementLabels[mv.movement_type] || mv.movement_type}</p>
                          <p className="text-xs font-semibold text-slate-500 mt-1">
                            {mineralLabels[mv.mineral_type] || mv.mineral_type} • {mv.location_name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold font-outfit text-base ${isIncoming ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {isIncoming ? '+' : '-'}{Number(mv.quantity || 0).toLocaleString()} t
                        </p>
                        <p className="text-xs font-semibold text-slate-400 mt-0.5">{mv.date}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInDown { animation: fadeInDown 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-fill-mode: both; }

        /* Custom Scrollbar for inner lists */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}</style>
    </div>
  );
}