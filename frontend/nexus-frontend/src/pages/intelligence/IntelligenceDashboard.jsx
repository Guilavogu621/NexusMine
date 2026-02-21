import { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  LightBulbIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  ClockIcon,
  FireIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

// Helper: animated counter
function useAnimatedNumber(target, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.round(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

// Risk gauge SVG amélioré
function RiskGauge({ score, size = 100 }) {
  const radius = (size - 10) / 2;
  const circumference = Math.PI * radius;
  const progress = (score / 100) * circumference;
  
  let color = '#22C55E';
  let label = 'Faible';
  if (score >= 70) {
    color = '#EF4444';
    label = 'Critique';
  } else if (score >= 45) {
    color = '#F97316';
    label = 'Élevé';
  } else if (score >= 20) {
    color = '#EAB308';
    label = 'Moyen';
  }

  return (
    <div className="text-center">
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 10}`} className="mx-auto">
        <defs>
          <linearGradient id={`gradient-${score}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <path
          d={`M 5 ${size / 2 + 5} A ${radius} ${radius} 0 0 1 ${size - 5} ${size / 2 + 5}`}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d={`M 5 ${size / 2 + 5} A ${radius} ${radius} 0 0 1 ${size - 5} ${size / 2 + 5}`}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          style={{ transition: 'stroke-dasharray 1s ease-in-out' }}
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          fontSize="24"
          fontWeight="700"
          fill={color}
          fontFamily="'Outfit', sans-serif"
        >
          {score}
        </text>
      </svg>
      <p className="text-xs font-bold text-slate-600 mt-2 uppercase tracking-wider">{label}</p>
    </div>
  );
}

// Priority badge amélioré
function PriorityBadge({ priority }) {
  const colors = {
    CRITICAL: 'bg-red-100/80 text-red-700 border-red-200',
    HIGH: 'bg-orange-100/80 text-orange-700 border-orange-200',
    MEDIUM: 'bg-yellow-100/80 text-yellow-700 border-yellow-200',
    LOW: 'bg-green-100/80 text-green-700 border-green-200',
  };
  const icons = {
    CRITICAL: '🔴',
    HIGH: '🟠',
    MEDIUM: '🟡',
    LOW: '🟢',
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${colors[priority] || colors.LOW} inline-flex items-center gap-1`}>
      <span>{icons[priority]}</span>
      {priority}
    </span>
  );
}

// ChartCard component
function ChartCard({ title, icon: Icon, subtitle, children, className = '' }) {
  return (
    <div className={`group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 hover:border-white/40 p-6 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Icon className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function IntelligenceDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadIntelligence();
  }, []);

  const loadIntelligence = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/indicators/intelligence/');
      setData(res.data);
    } catch (err) {
      setError('Impossible de charger les données d\'intelligence');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadIntelligence();
    setRefreshing(false);
  };

  const resolutionRate = useAnimatedNumber(data?.kpis?.resolution_rate || 0);
  const daysWithoutCritical = useAnimatedNumber(data?.kpis?.days_without_critical || 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200 animate-spin border-t-indigo-600 border-r-indigo-500"></div>
            <CpuChipIcon className="h-8 w-8 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-slate-600 font-semibold">Analyse intelligente en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center max-w-md shadow-lg space-y-4">
          <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-red-700 font-semibold">{error}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-indigo-700 transition-all"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const { site_risks, incident_trends, equipment_at_risk, recommendations, kpis } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 relative">
      {/* Background pattern */}
      <div className="fixed inset-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.05),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(16,185,129,0.05),transparent_50%)]"></div>
      </div>

      <div className="relative space-y-8 pb-12 px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Premium */}
        <div className="group relative bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden animate-fadeInDown">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="intelligenceGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#intelligenceGrid)" />
            </svg>
          </div>

          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-indigo-400 opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500"></div>

          <div className="relative px-8 py-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div className="flex items-start gap-5">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <CpuChipIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                    NexusMine Intelligence
                  </h1>
                  <p className="mt-2 text-blue-100 font-medium">
                    Analyse prédictive • Détection de risques • Recommandations intelligentes
                  </p>
                </div>
              </div>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-white text-indigo-700 rounded-xl font-bold shadow-lg hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 flex-shrink-0"
              >
                <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualisation...' : 'Actualiser'}
              </button>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <CheckCircleIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-1">Taux Résolution</p>
                    <p className="text-2xl font-bold text-white font-outfit">{resolutionRate}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <ShieldCheckIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-1">Jours Sûrs</p>
                    <p className="text-2xl font-bold text-white font-outfit">{daysWithoutCritical}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${incident_trends?.trend === 'hausse' ? 'bg-red-500/20' : incident_trends?.trend === 'baisse' ? 'bg-green-500/20' : 'bg-white/20'}`}>
                    {incident_trends?.trend === 'hausse' ? (
                      <ArrowTrendingUpIcon className="h-5 w-5 text-white" />
                    ) : incident_trends?.trend === 'baisse' ? (
                      <ArrowTrendingDownIcon className="h-5 w-5 text-white" />
                    ) : (
                      <MinusIcon className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-1">Tendance 30j</p>
                    <p className="text-2xl font-bold text-white font-outfit">
                      {incident_trends?.trend_pct > 0 ? '+' : ''}{incident_trends?.trend_pct}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FireIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-1">Incidents 30j</p>
                    <p className="text-2xl font-bold text-white font-outfit">{kpis?.total_incidents_30d || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <ChartCard
          title="Recommandations Intelligentes"
          icon={LightBulbIcon}
          subtitle="Actions prioritaires basées sur l'analyse prédictive"
        >
          <div className="space-y-3">
            {recommendations?.length === 0 ? (
              <p className="text-slate-500 text-center py-8 font-medium">Aucune recommandation immédiate</p>
            ) : (
              recommendations?.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200/60 bg-white/40 hover:bg-white/80 transition-all duration-300 flex items-start gap-4 group"
                >
                  <div className="text-2xl flex-shrink-0">{rec.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-bold text-slate-900">{rec.title}</h3>
                      <PriorityBadge priority={rec.priority} />
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{rec.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ChartCard>

        {/* Risk Scores + Equipment at Risk */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Site Risk Scores */}
          <ChartCard
            title="Score de Risque par Site"
            icon={ExclamationTriangleIcon}
            subtitle="Analyse de risque en temps réel"
          >
            {site_risks?.length === 0 ? (
              <p className="text-slate-500 text-center py-8 font-medium">Aucun site configuré</p>
            ) : (
              <div className="space-y-4">
                {site_risks?.map((site) => (
                  <div
                    key={site.site_id}
                    className="p-4 rounded-xl border border-slate-200/60 bg-white/40 hover:bg-white/80 transition-all duration-300 flex items-center gap-4"
                  >
                    <RiskGauge score={site.risk_score} size={80} />
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 mb-2">{site.site_name}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border"
                          style={{
                            backgroundColor: site.risk_color + '20',
                            color: site.risk_color,
                            borderColor: site.risk_color + '40',
                          }}
                        >
                          {site.risk_level}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
                        <span>🔴 {site.critical_incidents} critiques</span>
                        <span>⏳ {site.unresolved_incidents} non résolus</span>
                        <span>🔧 {site.broken_equipment}/{site.total_equipment} en panne</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>

          {/* Equipment at Risk */}
          <ChartCard
            title="Équipements à Risque"
            icon={WrenchScrewdriverIcon}
            subtitle="Équipements avec 2+ incidents récents"
          >
            {equipment_at_risk?.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-slate-600 font-semibold">Aucun équipement à risque détecté</p>
              </div>
            ) : (
              <div className="space-y-2">
                {equipment_at_risk?.map((eq) => (
                  <div
                    key={eq.id}
                    className="p-3 rounded-lg border border-slate-200/60 bg-white/40 hover:bg-white/80 transition-all duration-300 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{eq.name}</p>
                      <p className="text-xs text-slate-500">{eq.site__name} • {eq.equipment_type}</p>
                    </div>
                    <span className="bg-red-100/80 text-red-700 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
                      {eq.incident_count} incidents
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </div>

        {/* Incident Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Trend */}
          <ChartCard
            title="Évolution Hebdomadaire"
            icon={ChartBarIcon}
            subtitle="Tendance des incidents (7 dernières semaines)"
          >
            {incident_trends?.weekly?.length > 0 ? (
              <div className="flex items-end gap-2 h-48 justify-between">
                {incident_trends.weekly.map((w, idx) => {
                  const maxCount = Math.max(...incident_trends.weekly.map(x => x.count), 1);
                  const height = (w.count / maxCount) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-bold text-slate-600">{w.count}</span>
                      <div
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-500 hover:shadow-lg"
                        style={{ height: `${Math.max(height, 8)}%`, minHeight: '8px' }}
                      />
                      <span className="text-xs text-slate-500 font-medium">{w.week}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8 font-medium">Aucune donnée disponible</p>
            )}
          </ChartCard>

          {/* Incidents by Type */}
          <ChartCard
            title="Incidents par Type"
            icon={ClockIcon}
            subtitle="Distribution sur 30 jours"
          >
            {incident_trends?.by_type?.length === 0 ? (
              <p className="text-slate-500 text-center py-8 font-medium">Aucun incident sur cette période</p>
            ) : (
              <div className="space-y-4">
                {incident_trends?.by_type?.map((item, idx) => {
                  const maxCount = incident_trends.by_type[0]?.count || 1;
                  const width = (item.count / maxCount) * 100;
                  const typeLabels = {
                    ACCIDENT: 'Accident corporel',
                    NEAR_MISS: 'Presqu\'accident',
                    EQUIPMENT_FAILURE: 'Panne équipement',
                    ENVIRONMENTAL: 'Environnemental',
                    SECURITY: 'Sécurité',
                    LANDSLIDE: 'Glissement de terrain',
                    FIRE: 'Incendie',
                    EXPLOSION: 'Explosion',
                    CHEMICAL_SPILL: 'Déversement chimique',
                    OTHER: 'Autre',
                  };
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700">
                          {typeLabels[item.incident_type] || item.incident_type}
                        </span>
                        <span className="text-sm font-bold text-slate-900 bg-slate-100/80 px-2.5 py-1 rounded-lg">
                          {item.count}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-teal-500 to-teal-600 h-2.5 rounded-full transition-all duration-700"
                          style={{ width: `${Math.max(width, 5)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ChartCard>
        </div>

        {/* Production Efficiency */}
        {kpis?.production_7d && (
          <ChartCard
            title="Efficacité de Production"
            icon={ChartBarIcon}
            subtitle="7 derniers jours"
          >
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-100/50 to-indigo-100/50 border border-blue-200/60">
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">Tonnes Extraites</p>
                <p className="text-3xl font-bold text-indigo-600 font-outfit">
                  {(kpis.production_7d.extracted?.toLocaleString('fr-FR') || 0).split(',')[0]}
                </p>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-100/50 to-teal-100/50 border border-emerald-200/60">
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">Tonnes Traitées</p>
                <p className="text-3xl font-bold text-emerald-600 font-outfit">
                  {(kpis.production_7d.processed?.toLocaleString('fr-FR') || 0).split(',')[0]}
                </p>
              </div>
              <div className={`text-center p-4 rounded-xl border ${kpis.production_7d.efficiency >= 70 ? 'bg-gradient-to-br from-green-100/50 to-emerald-100/50 border-green-200/60' : 'bg-gradient-to-br from-orange-100/50 to-amber-100/50 border-orange-200/60'}`}>
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">Efficacité</p>
                <p className={`text-3xl font-bold font-outfit ${kpis.production_7d.efficiency >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                  {kpis.production_7d.efficiency}%
                </p>
              </div>
            </div>
          </ChartCard>
        )}
      </div>

      {/* Animations CSS */}
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

        .animate-fadeInDown {
          animation: fadeInDown 0.7s ease-out forwards;
        }

        /* SVG animations */
        svg path {
          stroke-linecap: round;
          stroke-linejoin: round;
        }
      `}</style>
    </div>
  );
}