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

// Palette sobre pour les graphiques (teintes limitées, contexte industriel)
const COLORS = {
  primary: '#1f2937', // gris foncé / ardoise
  success: '#059669',
  warning: '#d97706',
  danger: '#b91c1c',
};

// Animation counter hook
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

// Composant Stat Card avec animation — prototype style
const StatCard = ({ name, value, icon: IconComponent, color, colorLight, trend, trendUp, delay = 0 }) => {
  const animatedValue = useAnimatedCounter(value);
  
  return (
    <div 
      className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60 hover:shadow-md transition-all duration-300 animate-slideUp"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base text-slate-500 mb-1">{name}</p>
          <p className="text-3xl font-semibold text-slate-800 tracking-tight">
            {animatedValue.toLocaleString()}
          </p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-semibold ${
              trendUp ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {trendUp ? (
                <ArrowTrendingUpIcon className="h-4 w-4" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4" />
              )}
              {trend}
            </div>
          )}
        </div>
        <div className={`w-14 h-14 ${colorLight} rounded-lg flex items-center justify-center`}>
          <IconComponent className={`h-7 w-7 ${color}`} />
        </div>
      </div>
    </div>
  );
};

// Composant KPI Card — prototype style (white card)
const KPICard = ({ title, value, unit, trend, trendUp, icon: Icon, gradient }) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60 hover:shadow-md transition-all duration-300 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="p-2.5 bg-slate-100 rounded-lg">
          <Icon className="h-6 w-6 text-slate-600" />
        </div>
        <div className={`flex items-center text-sm font-semibold ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trendUp ? <ArrowTrendingUpIcon className="h-4 w-4 mr-1" /> : <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />}
          {trend}
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-base font-medium text-slate-500">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-slate-800">
          {value}
          <span className="text-base font-normal text-slate-400 ml-1">{unit}</span>
        </p>
      </div>
    </div>
  );
};

// Composant Chart Card — prototype style
const ChartCard = ({ title, subtitle, children, action }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow duration-300 animate-fadeIn">
    <div className="flex items-start justify-between mb-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        {subtitle && <p className="text-base text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {action && (
        <button className="text-base text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 transition-colors">
          {action}
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      )}
    </div>
    {children}
  </div>
);

// Progress Ring Component
const ProgressRing = ({ progress, color, size = 120, strokeWidth = 10 }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedProgress / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
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
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-semibold text-slate-800">{animatedProgress}%</span>
      </div>
    </div>
  );
};

// Activity Item Component
const ActivityItem = ({ icon: IconComponent, iconBg, title, subtitle, time, status }) => (
  <div className="flex items-start gap-4 p-3.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
    <div className={`p-2.5 rounded-lg ${iconBg} group-hover:scale-110 transition-transform duration-200`}>
      <IconComponent className="h-5 w-5 text-slate-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-base font-medium text-slate-800 truncate">{title}</p>
      <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
    </div>
    <div className="text-right">
      <p className="text-sm text-slate-400">{time}</p>
      {status && (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium mt-1 ${
          status === 'success' ? 'bg-emerald-50 text-emerald-700' :
          status === 'warning' ? 'bg-amber-50 text-amber-700' :
          status === 'error' ? 'bg-rose-50 text-rose-700' :
          'bg-slate-100 text-slate-600'
        }`}>
          {status === 'success' ? 'Terminé' :
           status === 'warning' ? 'En cours' :
           status === 'error' ? 'Urgent' : status}
        </span>
      )}
    </div>
  </div>
);

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl text-sm border border-gray-700">
        <p className="font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
            {entry.name}: <span className="font-semibold ml-1">{entry.value.toLocaleString()}</span>
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

  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHr < 24) return `Il y a ${diffHr} h`;
  return `Il y a ${diffDay} j`;
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
    const key = op.date;
    const entry = map.get(key);
    if (entry) {
      entry.extraction += Number(op.quantity_extracted || 0);
      entry.traitement += Number(op.quantity_processed || 0);
      entry.transport += Number(op.quantity_transported || 0);
    }
  });

  return days;
};

const _buildEquipmentStatusData = (equipment) => {
  const counts = {
    OPERATIONAL: 0,
    MAINTENANCE: 0,
    BREAKDOWN: 0,
    RETIRED: 0,
  };

  equipment.forEach((eq) => {
    if (counts[eq.status] !== undefined) counts[eq.status] += 1;
  });

  return [
    { name: 'Opérationnel', value: counts.OPERATIONAL, fill: '#10B981' },
    { name: 'Maintenance', value: counts.MAINTENANCE, fill: '#F59E0B' },
    { name: 'En panne', value: counts.BREAKDOWN, fill: '#EF4444' },
    { name: 'Retiré', value: counts.RETIRED, fill: '#6B7280' },
  ];
};

const buildRecentActivities = (operations, incidents, alerts) => {
  const opItems = operations.slice(0, 3).map((op) => ({
    icon: TruckIcon,
    iconBg: 'bg-blue-100',
    title: `Opération ${op.operation_code}`,
    subtitle: `${op.operation_type_display || op.operation_type} - ${op.site_name || ''}`,
    time: formatTimeAgo(op.date),
    status: op.status === 'COMPLETED' ? 'success' : 'warning',
    date: op.date,
  }));

  const incidentItems = incidents.slice(0, 2).map((inc) => ({
    icon: ExclamationTriangleIcon,
    iconBg: 'bg-orange-100',
    title: `Incident ${inc.incident_code}`,
    subtitle: `${inc.incident_type_display || inc.incident_type} - ${inc.site_name || ''}`,
    time: formatTimeAgo(inc.date),
    status: inc.severity === 'HIGH' || inc.severity === 'CRITICAL' ? 'error' : 'warning',
    date: inc.date,
  }));

  const alertItems = alerts.slice(0, 2).map((alert) => ({
    icon: BellAlertIcon,
    iconBg: 'bg-red-100',
    title: alert.title,
    subtitle: alert.alert_type_display || alert.alert_type,
    time: formatTimeAgo(alert.generated_at),
    status: alert.severity === 'CRITICAL' ? 'error' : 'warning',
    date: alert.generated_at,
  }));

  return [...opItems, ...incidentItems, ...alertItems]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
};

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
          { name: 'Maintenance', value: statusMap.MAINTENANCE || 0, fill: '#F59E0B' },
          { name: 'En panne', value: statusMap.BREAKDOWN || 0, fill: '#EF4444' },
          { name: 'Retiré', value: statusMap.RETIRED || 0, fill: '#6B7280' },
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
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-200 rounded-full animate-spin border-t-indigo-600 mx-auto"></div>
            <SparklesIcon className="h-6 w-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-slate-500 font-medium">Chargement du tableau de bord...</p>
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
    <div className="space-y-8 pb-8">
      {/* Header amélioré */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 animate-fadeIn">
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">
            Bonjour, {user?.first_name || 'Utilisateur'} 👋
          </h1>
          <p className="text-base text-slate-500 flex items-center gap-2 mt-1">
            <CalendarDaysIcon className="h-5 w-5" />
            {currentDate}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Indicateur de scope site */}
          {!isGlobalView && assignedSites.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200/60">
              <MapPinIcon className="h-4 w-4" />
              <span className="text-sm font-medium">
                {assignedSites.length === 1 
                  ? assignedSites[0].name 
                  : `${assignedSites.length} sites`}
              </span>
            </div>
          )}
          {!isGlobalView && assignedSites.length === 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-200/60">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Aucun site assigné</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200/60">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium">Système opérationnel</span>
          </div>
          
          {(user?.role === 'ADMIN' || user?.role === 'SITE_MANAGER' || user?.role === 'SUPERVISOR' || user?.role === 'ANALYST') && (
            <Link
              to="/reports/new"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <PlusIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Nouveau rapport</span>
            </Link>
          )}
        </div>
      </div>

      {/* Stats principales avec animation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          name="Sites Miniers"
          value={stats.sites}
          icon={MapPinIcon}
          color="text-indigo-500"
          colorLight="bg-indigo-50"
          trend="+12%"
          trendUp={true}
          delay={0}
        />
        <StatCard
          name="Personnel Actif"
          value={stats.personnel}
          icon={UsersIcon}
          color="text-teal-500"
          colorLight="bg-teal-50"
          trend="+5.2%"
          trendUp={true}
          delay={100}
        />
        <StatCard
          name="Équipements"
          value={stats.equipment}
          icon={WrenchScrewdriverIcon}
          color="text-slate-500"
          colorLight="bg-slate-100"
          trend="+3%"
          trendUp={true}
          delay={200}
        />
        <StatCard
          name="Incidents"
          value={stats.incidents}
          icon={ExclamationTriangleIcon}
          color="text-rose-500"
          colorLight="bg-rose-50"
          trend="-18%"
          trendUp={false}
          delay={300}
        />
      </div>

      {/* KPI Cards secondaires */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Production Totale"
          value="12,847"
          unit="tonnes"
          trend="+8.2%"
          trendUp={true}
          icon={CubeIcon}
          gradient=""
        />
        <KPICard
          title="Rendement"
          value="94.5"
          unit="%"
          trend="+2.1%"
          trendUp={true}
          icon={ChartBarIcon}
          gradient=""
        />
        <KPICard
          title="Heures Machine"
          value="2,450"
          unit="h"
          trend="+4.5%"
          trendUp={true}
          icon={ClockIcon}
          gradient=""
        />
        <KPICard
          title="Taux Sécurité"
          value="99.2"
          unit="%"
          trend="+0.8%"
          trendUp={true}
          icon={ShieldCheckIcon}
          gradient=""
        />
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production Chart - Grande */}
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
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
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
          <div className="flex flex-col items-center py-4">
            <ProgressRing progress={87} color="#10B981" size={160} strokeWidth={12} />
            <div className="mt-6 w-full space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base text-slate-500">Objectif Production</span>
                  <span className="text-base font-semibold text-slate-800">92%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-indigo-500 h-2 rounded-full transition-all duration-1000 ease-out animate-progressBar" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base text-slate-500">Taux de disponibilité</span>
                  <span className="text-base font-semibold text-slate-800">98%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-indigo-500 h-2 rounded-full transition-all duration-1000 ease-out animate-progressBar" style={{ width: '98%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Deuxième rangée de graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operations Bar Chart */}
        <ChartCard title="Opérations Hebdomadaires" subtitle="Par type d'activité" action="Exporter">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyOperations} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: 20 }}
                formatter={(value) => <span className="text-sm text-slate-500">{value}</span>}
              />
              <Bar dataKey="extraction" name="Extraction" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="traitement" name="Traitement" fill="#10B981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="transport" name="Transport" fill="#F59E0B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Equipment Status Pie */}
        <ChartCard title="État des Équipements" subtitle="Répartition actuelle">
          <div className="flex items-center justify-center gap-8">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={equipmentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {equipmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="space-y-3">
              {equipmentStatusData.map((item, index) => (
                <div key={index} className="flex items-center gap-3 group cursor-pointer">
                  <span className="w-3 h-3 rounded-full transition-transform group-hover:scale-125" style={{ backgroundColor: item.fill }}></span>
                  <span className="text-base text-slate-500 group-hover:text-slate-700 transition-colors">{item.name}</span>
                  <span className="text-base font-semibold text-slate-800 ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activités récentes */}
        <div className="lg:col-span-2">
          <ChartCard title="Activités Récentes" subtitle="Dernières 24 heures" action="Tout voir">
            <div className="space-y-1">
              {recentActivities.map((activity, index) => (
                <ActivityItem key={index} {...activity} />
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Actions Rapides</h3>
          <p className="text-base text-slate-500 mb-6">Accès direct aux fonctionnalités clés</p>
          
          <div className="space-y-3">
            {['ADMIN', 'SITE_MANAGER', 'SUPERVISOR', 'OPERATOR'].includes(user?.role) && (
              <Link
                to="/operations/new"
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-indigo-50 transition-all duration-200 group hover:translate-x-1"
              >
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <PlusIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <span className="text-base font-medium text-slate-600 group-hover:text-indigo-600">Nouvelle opération</span>
                <ArrowRightIcon className="h-4 w-4 ml-auto text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}
            
            {['ADMIN', 'SITE_MANAGER', 'SUPERVISOR', 'OPERATOR', 'ANALYST'].includes(user?.role) && (
              <Link
                to="/incidents/new"
                className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-lg hover:bg-amber-50 transition-all duration-200 group hover:translate-x-1"
              >
                <div className="p-2 bg-amber-100 rounded-lg">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
                </div>
                <span className="text-base font-medium text-slate-600 group-hover:text-amber-700">Signaler un incident</span>
                <ArrowRightIcon className="h-4 w-4 ml-auto text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}
            
            <Link
              to="/equipment"
              className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all duration-200 group hover:translate-x-1"
            >
              <div className="p-2 bg-slate-200 rounded-lg">
                <WrenchScrewdriverIcon className="h-5 w-5 text-slate-600" />
              </div>
              <span className="text-base font-medium text-slate-600 group-hover:text-slate-800">Voir équipements</span>
              <ArrowRightIcon className="h-4 w-4 ml-auto text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            
            {['ADMIN', 'SITE_MANAGER', 'SUPERVISOR', 'ANALYST'].includes(user?.role) && (
              <Link
                to="/analytics"
                className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-lg hover:bg-teal-50 transition-all duration-200 group hover:translate-x-1"
              >
                <div className="p-2 bg-teal-100 rounded-lg">
                  <ChartBarIcon className="h-5 w-5 text-teal-600" />
                </div>
                <span className="text-base font-medium text-slate-600 group-hover:text-teal-600">Voir les analytics</span>
                <ArrowRightIcon className="h-4 w-4 ml-auto text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Alertes récentes */}
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
                className={`p-4 rounded-xl border-l-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${
                  alert.severity === 'HIGH' || alert.severity === 'CRITICAL'
                    ? 'bg-red-50 border-red-500 hover:bg-red-100'
                    : alert.severity === 'MEDIUM'
                    ? 'bg-amber-50 border-amber-500 hover:bg-amber-100'
                    : 'bg-slate-50 border-gray-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    alert.severity === 'HIGH' || alert.severity === 'CRITICAL'
                      ? 'bg-red-100'
                      : alert.severity === 'MEDIUM'
                      ? 'bg-amber-100'
                      : 'bg-slate-100'
                  }`}>
                    <BellAlertIcon className={`h-5 w-5 ${
                      alert.severity === 'HIGH' || alert.severity === 'CRITICAL'
                        ? 'text-red-600'
                        : alert.severity === 'MEDIUM'
                        ? 'text-amber-600'
                        : 'text-slate-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-slate-800 truncate">{alert.title}</p>
                    <p className="text-sm text-slate-500 mt-1">
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

      {/* CSS pour les animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes progressBar {
          from { width: 0; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out forwards;
        }
        .animate-progressBar {
          animation: progressBar 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
