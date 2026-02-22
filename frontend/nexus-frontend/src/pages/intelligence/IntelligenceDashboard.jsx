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

  const {
    site_risks,
    production_forecast,
    hse_correlation,
    incident_trends,
    equipment_at_risk,
    recommendations,
    cv_audit,
    kpis
  } = data;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 pb-12">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn pt-8">

        {/* ── HEADER PREMIUM ── */}
        <div className="group relative overflow-hidden rounded-[40px] bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 shadow-2xl animate-fadeInDown">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="intelGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
              <rect width="100" height="100" fill="url(#intelGrid)" />
            </svg>
          </div>

          <div className="relative p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="p-5 bg-white/20 backdrop-blur-md rounded-[32px] shadow-2xl ring-4 ring-white/30 group-hover:scale-110 transition-transform duration-500">
                <CpuChipIcon className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-outfit">NexusMine Intelligence</h1>
                <p className="text-blue-100 font-medium opacity-90 mt-1">Analyse prédictive & Surveillance HSE automatisée</p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 font-outfit disabled:opacity-50"
              disabled={refreshing}
            >
              <ArrowPathIcon className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Analyse...' : 'Relancer l\'IA'}
            </button>
          </div>

          {/* Quick KPIs Overlay */}
          <div className="px-8 pb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickKPI label="Taux de Résolution" value={`${resolutionRate}%`} icon={CheckCircleIcon} />
            <QuickKPI label="Jours Sans Incident" value={daysWithoutCritical} icon={ShieldCheckIcon} />
            <QuickKPI label="Tendance 30j" value={`${incident_trends?.trend_pct > 0 ? '+' : ''}${incident_trends?.trend_pct}%`} icon={incident_trends?.trend === 'hausse' ? ArrowTrendingUpIcon : ArrowTrendingDownIcon} color={incident_trends?.trend === 'hausse' ? 'text-rose-200' : 'text-emerald-200'} />
            <QuickKPI label="Incidents 30j" value={kpis?.total_incidents_30d || 0} icon={FireIcon} />
          </div>
        </div>

        {/* ── AI PREDICTIONS & RECOMMENDATIONS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Production Forecast */}
          <ChartCard
            title="Prévision de Production (30j)"
            icon={ChartBarIcon}
            subtitle="Basé sur l'historique des 6 derniers mois"
            className="lg:col-span-1"
          >
            <div className="text-center py-6">
              <div className="inline-flex items-baseline gap-2 mb-2">
                <p className="text-5xl font-black text-indigo-600 font-outfit tracking-tighter">
                  {Number(production_forecast?.next_30d || 0).toLocaleString()}
                </p>
                <p className="text-xl font-bold text-slate-400">tonnes</p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mt-4">
                <SparklesIcon className="h-4 w-4 text-amber-500" />
                Fiabilité de l'IA : {production_forecast?.confidence}%
              </div>
              <div className={`mt-6 px-4 py-2 rounded-xl text-xs font-bold ${production_forecast?.trend === 'increase' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'} inline-flex items-center gap-2`}>
                {production_forecast?.trend === 'increase' ? <ArrowTrendingUpIcon className="h-4 w-4" /> : <MinusIcon className="h-4 w-4" />}
                Tendance : {production_forecast?.trend === 'increase' ? 'Hausse prévue' : 'Stable'}
              </div>
            </div>
          </ChartCard>

          {/* Smart Recommendations */}
          <ChartCard
            title="Recommandations Intelligentes"
            icon={LightBulbIcon}
            subtitle="Actions prioritaires générées par le moteur d'insights"
            className="lg:col-span-2"
          >
            <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
              {recommendations?.map((rec, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-4 group hover:bg-white hover:shadow-md transition-all duration-300">
                  <div className="text-2xl pt-1">{rec.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase text-xs tracking-wider">{rec.title}</h4>
                      <PriorityBadge priority={rec.priority} />
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* ── RISK ANALYSIS & CORRELATION ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Site Risks */}
          <ChartCard
            title="Score de Risque Opérationnel"
            icon={ExclamationTriangleIcon}
            subtitle="Agrégation des incidents et états machines"
          >
            <div className="space-y-4">
              {site_risks?.map((site) => (
                <div key={site.site_id} className="flex items-center gap-6 p-4 bg-white/50 rounded-2xl border border-slate-100 hover:shadow-lg transition-all duration-300">
                  <RiskGauge score={site.risk_score} size={80} />
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-slate-800 font-outfit">{site.site_name}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-lg">
                        🛑 {site.critical_incidents} Critiques
                      </span>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                        🔧 {site.broken_equipment} Pannes
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
          {/* ── COMPUTER VISION AUDIT ── */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
            <ChartCard
              title="Vision par Ordinateur : Audit de Sécurité Automatisé"
              icon={CpuChipIcon}
              subtitle={`Analyse intelligente de ${cv_audit?.analyzed_count} images sur les 7 derniers jours`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-4">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <ShieldCheckIcon className="h-5 w-5 text-emerald-600" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">Taux de conformité EPI</span>
                    </div>
                    <span className="text-2xl font-black text-emerald-600 font-outfit">{cv_audit?.compliance_rate}%</span>
                  </div>

                  <div className="space-y-4">
                    {cv_audit?.ppe_details?.map((ppe, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-wider">
                          <span>{ppe.name}</span>
                          <span className={ppe.status === 'ALERTE' ? 'text-rose-500' : 'text-emerald-500'}>{ppe.score}% • {ppe.status}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 ${ppe.status === 'ALERTE' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${ppe.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-4 w-4 text-rose-500" />
                    Anomalies visuelles prioritaires
                  </h4>
                  <div className="space-y-3">
                    {cv_audit?.anomalies?.map((ano, idx) => (
                      <div key={idx} className="flex gap-3 text-sm font-medium text-slate-600 bg-white p-3 rounded-xl border border-slate-100 shadow-sm animate-fadeIn">
                        <span className="text-rose-500">⚠️</span>
                        {ano}
                      </div>
                    ))}
                    {cv_audit?.anomalies?.length === 0 && (
                      <div className="text-center py-12 text-emerald-600 font-bold text-sm">
                        ✅ Aucune anomalie visuelle détectée
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ChartCard>
          </div>


          {/* HSE Correlation */}
          <ChartCard
            title="Corrélation HSE : Humidité & Sol"
            icon={FireIcon}
            subtitle="Analyse préventive des risques géologiques"
          >
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-8 border-slate-100 flex items-center justify-center overflow-hidden">
                  <div
                    className="absolute bottom-0 w-full bg-blue-500 transition-all duration-1000"
                    style={{ height: `${hse_correlation?.avg_humidity}%` }}
                  />
                  <span className="relative z-10 text-xl font-black text-slate-900">{Math.round(hse_correlation?.avg_humidity)}%</span>
                </div>
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-4">Humidité Moyenne (Sols)</p>
              <div className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-tighter">
                Seuil de danger détecté par l'IA : {hse_correlation?.dynamic_threshold || 75}%
              </div>

              <div className={`mt-6 w-full p-6 rounded-[2rem] border transition-all duration-500 ${hse_correlation?.landslide_risk === 'CRITIQUE' ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${hse_correlation?.landslide_risk === 'CRITIQUE' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                    <ExclamationTriangleIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold opacity-60 uppercase tracking-widest">Risque Glissement</p>
                    <h4 className={`text-xl font-black ${hse_correlation?.landslide_risk === 'CRITIQUE' ? 'text-rose-600' : 'text-emerald-600'}`}>{hse_correlation?.landslide_risk}</h4>
                  </div>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* ── INCIDENT TRENDS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartCard title="Répartition des Incidents" icon={ChartBarIcon} subtitle="Distribution par nature sur 30 jours">
            <div className="space-y-4">
              {incident_trends?.by_type?.map((item, idx) => {
                const maxVal = incident_trends.by_type[0]?.count || 1;
                const progress = (item.count / maxVal) * 100;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase text-slate-600">
                      <span>{item.incident_type}</span>
                      <span>{item.count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>

          <ChartCard title="Équipements Haute Surveillance" icon={WrenchScrewdriverIcon} subtitle="Récurrence d'incidents détectée">
            <div className="space-y-3">
              {equipment_at_risk?.length > 0 ? equipment_at_risk.map((eq) => (
                <div key={eq.id} className="flex items-center justify-between p-4 bg-rose-50/50 border border-rose-100 rounded-2xl">
                  <div>
                    <p className="font-bold text-slate-800">{eq.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{eq.site__name}</p>
                  </div>
                  <span className="px-3 py-1 bg-rose-500 text-white text-xs font-black rounded-lg">{eq.ic} alertes</span>
                </div>
              )) : (
                <div className="text-center py-12">
                  <CheckCircleIcon className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                  <p className="font-bold text-slate-400">Aucune haute surveillance requise</p>
                </div>
              )}
            </div>
          </ChartCard>
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

        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}

function QuickKPI({ label, value, icon: Icon, color = 'text-white' }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-xl">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-[10px] font-black text-blue-100 uppercase tracking-[0.1em]">{label}</p>
          <p className={`text-2xl font-black ${color} font-outfit`}>{value}</p>
        </div>
      </div>
    </div>
  );
}