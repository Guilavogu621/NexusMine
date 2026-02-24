// Dashboard amélioré avec design moderne et raffiné
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPinIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  CubeIcon,
  BeakerIcon,
  ClockIcon,
  BellAlertIcon,
  CalendarDaysIcon,
  TruckIcon,
  ShieldCheckIcon,
  PlusIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../api/axios';
import useAuthStore from '../stores/authStore';

// Palette de couleurs moderne et raffinée
const COLORS = {
  primary: '#0F172A',      // Bleu très foncé
  secondary: '#1E293B',    // Ardoise sombre
  accent: '#3B82F6',       // Bleu vibrant
  accentGreen: '#10B981',  // Vert émeraude
  accentOrange: '#F97316', // Orange dynamique
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  border: '#CBD5E1',
};

// Composant ProgressRing amélioré
function ProgressRing({ progress = 0, color = '#10B981', size = 120, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="drop-shadow-lg">
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="url(#progressGradient)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1200 ease-out drop-shadow-sm"
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize={size * 0.22}
        fill={COLORS.primary}
        fontWeight="700"
        fontFamily="'Outfit', sans-serif"
      >
        {progress}%
      </text>
    </svg>
  );
}

// Composant ChartCard amélioré avec glassmorphism
function ChartCard({ title, subtitle, action, children }) {
  return (
    <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl p-7 shadow-lg border border-white/20 hover:shadow-xl hover:border-white/40 transition-all duration-500 animate-fadeInUp overflow-hidden">
      {/* Effet de fond dégradé subtil */}
      <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
            {subtitle && <p className="text-sm text-slate-500 mt-2 font-medium">{subtitle}</p>}
          </div>
          {action && (
            <button className="px-3 py-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-300 flex items-center gap-1.5">
              {action}
              <ArrowRightIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

// Hook pour animer les compteurs
const useAnimatedCounter = (end, duration = 1500) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (end === 0) return;
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  return count;
};

// Composant StatCard amélioré
const StatCard = ({ name, value, icon: IconComponent, color, colorLight, trend, trendUp, delay = 0 }) => {
  const animatedValue = useAnimatedCounter(value);

  return (
    <div
      className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-2xl hover:border-white/40 hover:-translate-y-1 transition-all duration-500"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient de fond au hover */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{name}</p>
            <p className="text-4xl font-bold text-slate-900 tracking-tight font-outfit">
              {animatedValue.toLocaleString()}
            </p>
          </div>
          <div className={`w-14 h-14 ${colorLight} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <IconComponent className={`h-7 w-7 ${color}`} />
          </div>
        </div>

        {trend && (
          <div className={`flex items-center gap-1.5 text-sm font-bold ${trendUp ? 'text-emerald-600' : 'text-rose-600'
            }`}>
            {trendUp ? (
              <ArrowTrendingUpIcon className="h-4 w-4" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4" />
            )}
            <span>{trend}</span>
            <span className="text-xs font-medium text-slate-500 ml-1">vs mois dernier</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant KPICard amélioré
const KPICard = ({ title, value, unit, trend, trendUp, icon: Icon }) => {
  return (
    <div className="group relative bg-linear-to-br from-white/90 to-white/40 backdrop-blur-md rounded-xl p-5 shadow-md border border-white/20 hover:shadow-lg hover:border-white/40 transition-all duration-500 overflow-hidden">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl bg-linear-to-br from-slate-50/50 to-transparent" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
            <Icon className="h-6 w-6 text-slate-600" />
          </div>
          <div className={`text-xs font-bold ${trendUp ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'} px-2.5 py-1 rounded-lg flex items-center gap-1`}>
            {trendUp ? <ArrowTrendingUpIcon className="h-3.5 w-3.5" /> : <ArrowTrendingDownIcon className="h-3.5 w-3.5" />}
            {trend}
          </div>
        </div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{value}</span>
          <span className="text-sm font-medium text-slate-400">{unit}</span>
        </div>
      </div>
    </div>
  );
};

// Composant ActivityItem amélioré
const ActivityItem = ({ icon: IconComponent, iconBg, title, subtitle, time, status }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all duration-300 cursor-pointer group border border-transparent hover:border-slate-200">
    <div className={`p-2.5 rounded-lg ${iconBg} group-hover:scale-110 transition-transform duration-300`}>
      <IconComponent className="h-5 w-5" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
    </div>
    <div className="text-right shrink-0">
      <p className="text-xs text-slate-400 whitespace-nowrap">{time}</p>
      {status && (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold mt-2 ${status === 'success' ? 'bg-emerald-100 text-emerald-700' :
          status === 'warning' ? 'bg-amber-100 text-amber-700' :
            status === 'error' ? 'bg-rose-100 text-rose-700' :
              'bg-slate-100 text-slate-600'
          }`}>
          {status === 'success' ? '✓ Terminé' :
            status === 'warning' ? '⏱ En cours' :
              status === 'error' ? '⚠ Urgent' : status}
        </span>
      )}
    </div>
  </div>
);

// Custom Tooltip amélioré
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl text-sm border border-slate-700/50">
        <p className="font-bold text-slate-50 mb-3">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="flex items-center gap-2.5 text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: entry.color }}></span>
            <span>{entry.name}:</span>
            <span className="font-bold ml-auto text-white">{entry.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'N/A';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 60) return `Il y a ${diffMin}m`;
  if (diffHr < 24) return `Il y a ${diffHr}h`;
  return `Il y a ${diffDay}j`;
};

const getMonthLabel = (date) => date.toLocaleDateString('fr-FR', { month: 'short' });

const _buildProductionData = (operations) => {
  const months = [];
  const now = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth() + 1}`,
      name: getMonthLabel(d),
      production: 0,
      objectif: 1000,
    });
  }
  const map = new Map(months.map((m) => [m.key, m]));
  operations.forEach((op) => {
    if (!op.date) return;
    const d = new Date(op.date);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    const entry = map.get(key);
    if (entry) {
      entry.production += Number(op.quantity_extracted || 0);
    }
  });
  return months;
};

const _buildWeeklyOperations = (operations) => {
  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push({
      key: d.toISOString().split('T')[0],
      name: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
      extraction: 0,
      traitement: 0,
      transport: 0,
    });
  }
  const map = new Map(days.map((d) => [d.key, d]));
  operations.forEach((op) => {
    if (!op.date) return;
    const d = new Date(op.date);
    const key = d.toISOString().split('T')[0];
    const entry = map.get(key);
    if (entry) {
      entry.extraction += Number(op.extraction || 0);
      entry.traitement += Number(op.traitement || 0);
      entry.transport += Number(op.transport || 0);
    }
  });
  return days;
};

function buildRecentActivities(operationsData, incidentsData, alertsData) {
  const opItems = (operationsData || []).map((op) => ({
    icon: TruckIcon,
    iconBg: 'bg-blue-100',
    title: `Opération: ${op.operation_code}`,
    subtitle: op.site_name,
    time: op.date,
    status: op.status,
    date: op.date,
  }));
  const incidentItems = (incidentsData || []).map((inc) => ({
    icon: ExclamationTriangleIcon,
    iconBg: 'bg-orange-100',
    title: `Incident: ${inc.incident_code}`,
    subtitle: inc.site_name,
    time: inc.date,
    status: inc.severity === 'CRITICAL' ? 'error' : 'warning',
    date: inc.date,
  }));
  const alertItems = (alertsData || []).map((alert) => ({
    icon: BellAlertIcon,
    iconBg: 'bg-rose-100',
    title: alert.title,
    subtitle: alert.alert_type_display || alert.alert_type,
    time: formatTimeAgo(alert.generated_at),
    status: alert.severity === 'CRITICAL' ? 'error' : 'warning',
    date: alert.generated_at,
  }));
  return [...opItems, ...incidentItems, ...alertItems]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
}

export default function Dashboard() {
  const { user, seesAllSites, getAssignedSites } = useAuthStore();
  const assignedSites = getAssignedSites();
  const isGlobalView = seesAllSites();
  const [stats, setStats] = useState({
    sites: 0,
    personnel: 0,
    equipment: 0,
    incidents: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [productionData, setProductionData] = useState([]);
  const [weeklyOperations, setWeeklyOperations] = useState([]);
  const [equipmentStatusData, setEquipmentStatusData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/indicators/dashboard_overview/');
        const data = response.data;
        setStats(data.stats || { sites: 0, personnel: 0, equipment: 0, incidents: 0 });
        setRecentAlerts((data.recent_alerts || []).slice(0, 5));
        setProductionData(data.production_data || []);
        setWeeklyOperations(data.weekly_operations || []);
        const statusCounts = data.equipment_status || [];
        const statusMap = statusCounts.reduce((acc, item) => {
          acc[item.status] = item.total;
          return acc;
        }, {});
        setEquipmentStatusData([
          { name: 'Opérationnel', value: statusMap.OPERATIONAL || 0, fill: '#10B981' },
          { name: 'Maintenance', value: statusMap.MAINTENANCE || 0, fill: '#F97316' },
          { name: 'En panne', value: statusMap.BREAKDOWN || 0, fill: '#EF4444' },
          { name: 'Retiré', value: statusMap.RETIRED || 0, fill: '#94A3B8' },
        ]);
        const operationsData = (data.recent_operations || []).map((op) => ({
          ...op,
          site_name: op.site__name,
        }));
        const incidentsData = (data.recent_incidents || []).map((inc) => ({
          ...inc,
          site_name: inc.site__name,
        }));
        const alertsData = data.recent_alerts || [];
        setRecentActivities(buildRecentActivities(operationsData, incidentsData, alertsData));
        setError(null);
      } catch (error) {
        setError(error?.response?.data?.detail || error.message || 'Erreur lors du chargement du dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px] bg-linear-to-br from-slate-50 to-slate-100">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200 animate-spin border-t-blue-600 border-r-blue-500"></div>
            <SparklesIcon className="h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-slate-600 font-semibold">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px] bg-linear-to-br from-slate-50 to-slate-100">
        <div className="text-center space-y-4 bg-white/80 backdrop-blur p-8 rounded-2xl shadow-lg border border-white/20">
          <ExclamationTriangleIcon className="h-12 w-12 text-amber-500 mx-auto" />
          <div>
            <p className="text-lg font-bold text-slate-900 mb-2">Erreur lors du chargement</p>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/20 to-slate-100">
      {/* Background pattern subtil */}
      <div className="fixed inset-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.05),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(16,185,129,0.05),transparent_50%)]"></div>
      </div>

      <div className="relative space-y-8 pb-8 px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header moderne et épuré */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 animate-fadeInDown">
          <div className="space-y-3">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
              Bonjour, <span className="bg-linear-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">M. {user?.first_name || 'Utilisateur'}</span>
            </h1>
            <p className="text-slate-600 flex items-center gap-2 font-medium">
              <CalendarDaysIcon className="h-5 w-5 text-blue-500" />
              {currentDate}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {!isGlobalView && assignedSites.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-100/60 text-blue-700 rounded-lg border border-blue-200/60 backdrop-blur-sm font-medium text-sm">
                <MapPinIcon className="h-5 w-5" />
                <span>
                  {assignedSites.length === 1
                    ? assignedSites[0].name
                    : `${assignedSites.length} sites`}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-100/60 text-emerald-700 rounded-lg border border-emerald-200/60 backdrop-blur-sm font-medium text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Système opérationnel
            </div>

            {(user?.role === 'ADMIN' || user?.role === 'SITE_MANAGER' || user?.role === 'TECHNICIEN' || user?.role === 'ANALYST') && (
              <Link
                to="/reports/new"
                className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 font-semibold shadow-md"
              >
                <PlusIcon className="h-5 w-5" />
                Nouveau rapport
              </Link>
            )}
          </div>
        </div>

        {/* Stats principales avec gradient */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            name="Sites Miniers"
            value={stats.sites}
            icon={MapPinIcon}
            color="text-blue-600"
            colorLight="bg-blue-100"
            trend="+12%"
            trendUp={true}
            delay={0}
          />
          <StatCard
            name="Personnel Actif"
            value={stats.personnel}
            icon={UsersIcon}
            color="text-emerald-600"
            colorLight="bg-emerald-100"
            trend="+5.2%"
            trendUp={true}
            delay={100}
          />
          <StatCard
            name="Équipements"
            value={stats.equipment}
            icon={WrenchScrewdriverIcon}
            color="text-orange-600"
            colorLight="bg-orange-100"
            trend="+3%"
            trendUp={true}
            delay={200}
          />
          <StatCard
            name="Incidents"
            value={stats.incidents}
            icon={ExclamationTriangleIcon}
            color="text-rose-600"
            colorLight="bg-rose-100"
            trend="-18%"
            trendUp={false}
            delay={300}
          />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Production" value="12,847" unit="tonnes" trend="+8.2%" trendUp={true} icon={CubeIcon} />
          <KPICard title="Rendement" value="94.5" unit="%" trend="+2.1%" trendUp={true} icon={ChartBarIcon} />
          <KPICard title="Heures Machine" value="2,450" unit="h" trend="+4.5%" trendUp={true} icon={ClockIcon} />
          <KPICard title="Taux Sécurité" value="99.2" unit="%" trend="+0.8%" trendUp={true} icon={ShieldCheckIcon} />
        </div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Production Chart */}
          <div className="lg:col-span-2">
            <ChartCard
              title="Production Mensuelle"
              subtitle="Comparaison avec les objectifs"
              action="Voir détails"
            >
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={productionData}>
                  <defs>
                    <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748B" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#64748B" style={{ fontSize: '12px' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="production"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    fill="url(#colorProd)"
                    name="Production"
                  />
                  <Line
                    type="monotone"
                    dataKey="objectif"
                    stroke="#EF4444"
                    strokeWidth={2}
                    strokeDasharray="8 4"
                    dot={false}
                    name="Objectif"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Performance Ring */}
          <ChartCard title="Performance Globale" subtitle="Ce mois-ci">
            <div className="flex flex-col items-center py-6">
              <ProgressRing progress={87} color="#10B981" size={160} strokeWidth={12} />
              <div className="mt-8 w-full space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">Objectif Production</span>
                    <span className="text-sm font-bold text-slate-900">92%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-linear-to-r from-blue-500 to-blue-600 h-2.5 rounded-full animate-progressBar" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">Disponibilité</span>
                    <span className="text-sm font-bold text-slate-900">98%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-linear-to-r from-emerald-500 to-emerald-600 h-2.5 rounded-full animate-progressBar" style={{ width: '98%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Second row - Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Operations Bar Chart */}
          <ChartCard title="Opérations Hebdomadaires" subtitle="Par type d'activité" action="Exporter">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyOperations} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748B" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 20, fontSize: '12px' }} />
                <Bar dataKey="extraction" name="Extraction" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="traitement" name="Traitement" fill="#10B981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="transport" name="Transport" fill="#F97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Equipment Status */}
          <ChartCard title="État des Équipements" subtitle="Répartition actuelle">
            <div className="flex items-center justify-center gap-12 py-4">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={equipmentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {equipmentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-3.5 flex-1">
                {equipmentStatusData.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 group cursor-pointer">
                    <span className="w-3.5 h-3.5 rounded-full group-hover:scale-125 transition-transform shadow-sm" style={{ backgroundColor: item.fill }}></span>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors flex-1">{item.name}</span>
                    <span className="font-bold text-slate-900 ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <ChartCard title="Activités Récentes" subtitle="Dernières 24 heures" action="Tout voir">
              <div className="space-y-2">
                {recentActivities.map((activity, index) => (
                  <ActivityItem key={index} {...activity} />
                ))}
              </div>
            </ChartCard>
          </div>

          {/* Quick Actions */}
          <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl p-7 shadow-lg border border-white/20 hover:shadow-xl hover:border-white/40 transition-all duration-500">
            <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

            <div className="relative z-10">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Actions Rapides</h3>
              <p className="text-sm text-slate-600 mb-6">Accès direct aux fonctionnalités clés</p>

              <div className="space-y-3">
                {['ADMIN', 'SITE_MANAGER', 'TECHNICIEN'].includes(user?.role) && (
                  <Link
                    to="/operations/new"
                    className="flex items-center gap-3 p-4 bg-linear-to-r from-blue-50 to-blue-100/50 rounded-lg hover:from-blue-100 hover:to-blue-150 transition-all duration-300 group border border-blue-200/50 hover:border-blue-300"
                  >
                    <div className="p-2.5 bg-blue-100 rounded-lg group-hover:scale-110 shrink-0 transition-transform">
                      <PlusIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 flex-1">Nouvelle opération</span>
                    <ArrowRightIcon className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                )}

                {['ADMIN', 'SITE_MANAGER', 'TECHNICIEN', 'ANALYST'].includes(user?.role) && (
                  <Link
                    to="/incidents/new"
                    className="flex items-center gap-3 p-4 bg-linear-to-r from-orange-50 to-orange-100/50 rounded-lg hover:from-orange-100 hover:to-orange-150 transition-all duration-300 group border border-orange-200/50 hover:border-orange-300"
                  >
                    <div className="p-2.5 bg-orange-100 rounded-lg group-hover:scale-110 transition-transform">
                      <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 flex-1">Signaler un incident</span>
                    <ArrowRightIcon className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                )}

                <Link
                  to="/equipment"
                  className="flex items-center gap-3 p-4 bg-linear-to-r from-slate-50 to-slate-100/50 rounded-lg hover:from-slate-100 hover:to-slate-150 transition-all duration-300 group border border-slate-200/50 hover:border-slate-300"
                >
                  <div className="p-2.5 bg-slate-200 rounded-lg group-hover:scale-110 transition-transform">
                    <WrenchScrewdriverIcon className="h-5 w-5 text-slate-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-900 flex-1">Voir équipements</span>
                  <ArrowRightIcon className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-all" />
                </Link>

                {['ADMIN', 'SITE_MANAGER', 'TECHNICIEN', 'ANALYST'].includes(user?.role) && (
                  <Link
                    to="/analytics"
                    className="flex items-center gap-3 p-4 bg-linear-to-r from-emerald-50 to-emerald-100/50 rounded-lg hover:from-emerald-100 hover:to-emerald-150 transition-all duration-300 group border border-emerald-200/50 hover:border-emerald-300"
                  >
                    <div className="p-2.5 bg-emerald-100 rounded-lg group-hover:scale-110 transition-transform">
                      <ChartBarIcon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 flex-1">Voir les analytics</span>
                    <ArrowRightIcon className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        {recentAlerts.length > 0 && (
          <ChartCard
            title="Alertes en Cours"
            subtitle={`${recentAlerts.length} alertes non traitées`}
            action="Gérer les alertes"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentAlerts.slice(0, 6).map((alert) => (
                <div
                  key={alert.id}
                  className={`group p-5 rounded-xl border-l-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer backdrop-blur-sm ${alert.severity === 'HIGH' || alert.severity === 'CRITICAL'
                    ? 'bg-red-50/80 border-red-500 hover:bg-red-100/80'
                    : alert.severity === 'MEDIUM'
                      ? 'bg-amber-50/80 border-amber-500 hover:bg-amber-100/80'
                      : 'bg-slate-50/80 border-slate-400 hover:bg-slate-100/80'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-lg shrink-0 group-hover:scale-110 transition-transform ${alert.severity === 'HIGH' || alert.severity === 'CRITICAL'
                      ? 'bg-red-100'
                      : alert.severity === 'MEDIUM'
                        ? 'bg-amber-100'
                        : 'bg-slate-100'
                      }`}>
                      <BellAlertIcon className={`h-5 w-5 ${alert.severity === 'HIGH' || alert.severity === 'CRITICAL'
                        ? 'text-red-600'
                        : alert.severity === 'MEDIUM'
                          ? 'text-amber-600'
                          : 'text-slate-500'
                        }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate group-hover:text-slate-950">{alert.title}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(alert.generated_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        )}
      </div>

      {/* CSS pour les animations avancées */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

        .font-outfit {
          font-family: 'Outfit', sans-serif;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes progressBar {
          from {
            width: 0;
          }
        }

        .animate-fadeInDown {
          animation: fadeInDown 0.7s ease-out forwards;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          animation-fill-mode: both;
        }

        .animate-progressBar {
          animation: progressBar 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}