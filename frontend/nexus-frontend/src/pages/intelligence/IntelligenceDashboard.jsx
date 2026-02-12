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
} from '@heroicons/react/24/outline';

// ── Helper: animated counter ──
function useAnimatedNumber(target, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.round(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

// ── Risk gauge SVG ──
function RiskGauge({ score, size = 100 }) {
  const radius = (size - 10) / 2;
  const circumference = Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score >= 70 ? '#EF4444' : score >= 45 ? '#F97316' : score >= 20 ? '#EAB308' : '#22C55E';
  
  return (
    <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
      <path
        d={`M 5 ${size / 2 + 5} A ${radius} ${radius} 0 0 1 ${size - 5} ${size / 2 + 5}`}
        fill="none" stroke="#E5E7EB" strokeWidth="8" strokeLinecap="round"
      />
      <path
        d={`M 5 ${size / 2 + 5} A ${radius} ${radius} 0 0 1 ${size - 5} ${size / 2 + 5}`}
        fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={`${progress} ${circumference}`}
        style={{ transition: 'stroke-dasharray 1s ease-in-out' }}
      />
      <text x={size / 2} y={size / 2} textAnchor="middle" fontSize="20" fontWeight="bold" fill={color}>
        {score}
      </text>
      <text x={size / 2} y={size / 2 + 16} textAnchor="middle" fontSize="10" fill="#6B7280">
        / 100
      </text>
    </svg>
  );
}

// ── Priority badge ──
function PriorityBadge({ priority }) {
  const colors = {
    CRITICAL: 'bg-red-100 text-red-700 border-red-200',
    HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
    MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    LOW: 'bg-green-100 text-green-700 border-green-200',
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${colors[priority] || colors.LOW}`}>
      {priority}
    </span>
  );
}

export default function IntelligenceDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const resolutionRate = useAnimatedNumber(data?.kpis?.resolution_rate || 0);
  const daysWithoutCritical = useAnimatedNumber(data?.kpis?.days_without_critical || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <CpuChipIcon className="w-12 h-12 text-indigo-500 animate-pulse" />
          <p className="text-gray-500 font-medium">Analyse en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <ExclamationTriangleIcon className="w-16 h-16 text-red-400" />
        <p className="text-red-600">{error}</p>
        <button onClick={loadIntelligence} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Réessayer
        </button>
      </div>
    );
  }

  const { site_risks, incident_trends, equipment_at_risk, recommendations, kpis } = data;

  return (
    <div className="space-y-6 p-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CpuChipIcon className="w-7 h-7 text-indigo-600" />
            NexusMine Intelligence
          </h1>
          <p className="text-gray-500 mt-1">Analyse prédictive • Détection de risques • Recommandations</p>
        </div>
        <button
          onClick={loadIntelligence}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm"
        >
          <ChartBarIcon className="w-4 h-4" />
          Actualiser l'analyse
        </button>
      </div>

      {/* ── KPIs Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{resolutionRate}%</p>
              <p className="text-xs text-gray-500">Taux de résolution</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{daysWithoutCritical}</p>
              <p className="text-xs text-gray-500">Jours sans incident critique</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${incident_trends?.trend === 'hausse' ? 'bg-red-100' : incident_trends?.trend === 'baisse' ? 'bg-green-100' : 'bg-gray-100'}`}>
              {incident_trends?.trend === 'hausse' ? (
                <ArrowTrendingUpIcon className="w-6 h-6 text-red-600" />
              ) : incident_trends?.trend === 'baisse' ? (
                <ArrowTrendingDownIcon className="w-6 h-6 text-green-600" />
              ) : (
                <MinusIcon className="w-6 h-6 text-gray-600" />
              )}
            </div>
            <div>
              <p className={`text-2xl font-bold ${incident_trends?.trend === 'hausse' ? 'text-red-600' : incident_trends?.trend === 'baisse' ? 'text-green-600' : 'text-gray-600'}`}>
                {incident_trends?.trend_pct > 0 ? '+' : ''}{incident_trends?.trend_pct}%
              </p>
              <p className="text-xs text-gray-500">Tendance incidents (30j)</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FireIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{kpis?.total_incidents_30d || 0}</p>
              <p className="text-xs text-gray-500">Incidents (30 derniers jours)</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recommendations ── */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <LightBulbIcon className="w-5 h-5 text-indigo-600" />
            Recommandations Intelligentes
          </h2>
        </div>
        <div className="divide-y">
          {recommendations?.map((rec, idx) => (
            <div key={idx} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
              <span className="text-2xl">{rec.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900">{rec.title}</h3>
                  <PriorityBadge priority={rec.priority} />
                </div>
                <p className="text-sm text-gray-600">{rec.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Risk Scores + Equipment at Risk ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Risk Scores */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
              Score de Risque par Site
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {site_risks?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun site configuré</p>
            ) : (
              site_risks?.map((site) => (
                <div key={site.site_id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                  <RiskGauge score={site.risk_score} size={80} />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{site.site_name}</h3>
                    <span
                      className="inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1"
                      style={{
                        backgroundColor: site.risk_color + '20',
                        color: site.risk_color,
                      }}
                    >
                      {site.risk_level}
                    </span>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>🔴 {site.critical_incidents} critiques</span>
                      <span>⏳ {site.unresolved_incidents} non résolus</span>
                      <span>🔧 {site.broken_equipment}/{site.total_equipment} en panne</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Equipment at Risk */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <WrenchScrewdriverIcon className="w-5 h-5 text-yellow-500" />
              Équipements à Risque de Panne
            </h2>
            <p className="text-xs text-gray-500 mt-1">Équipements opérationnels avec 2+ incidents récents</p>
          </div>
          <div className="divide-y">
            {equipment_at_risk?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun équipement à risque détecté ✅</p>
            ) : (
              equipment_at_risk?.map((eq) => (
                <div key={eq.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{eq.name}</p>
                    <p className="text-xs text-gray-500">{eq.site__name} • {eq.equipment_type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">
                      {eq.incident_count} incidents
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Incident Trends ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-indigo-500" />
              Évolution Hebdomadaire des Incidents
            </h2>
          </div>
          <div className="p-6">
            {incident_trends?.weekly?.length > 0 ? (
              <div className="flex items-end gap-2 h-40">
                {incident_trends.weekly.map((w, idx) => {
                  const maxCount = Math.max(...incident_trends.weekly.map(x => x.count), 1);
                  const height = (w.count / maxCount) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-500 font-medium">{w.count}</span>
                      <div
                        className="w-full bg-indigo-500 rounded-t transition-all duration-500"
                        style={{ height: `${Math.max(height, 4)}%` }}
                      />
                      <span className="text-xs text-gray-400">{w.week}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Aucune donnée hebdomadaire</p>
            )}
          </div>
        </div>

        {/* Incidents by Type */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-teal-500" />
              Incidents par Type (30 jours)
            </h2>
          </div>
          <div className="p-6 space-y-3">
            {incident_trends?.by_type?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun incident sur cette période</p>
            ) : (
              incident_trends?.by_type?.map((item, idx) => {
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
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{typeLabels[item.incident_type] || item.incident_type}</span>
                      <span className="font-medium text-gray-900">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-teal-500 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Production Efficiency ── */}
      {kpis?.production_7d && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Production (7 derniers jours)</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-600">
                {kpis.production_7d.extracted?.toLocaleString('fr-FR') || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">Tonnes extraites</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-teal-600">
                {kpis.production_7d.processed?.toLocaleString('fr-FR') || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">Tonnes traitées</p>
            </div>
            <div className="text-center">
              <p className={`text-3xl font-bold ${kpis.production_7d.efficiency >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                {kpis.production_7d.efficiency}%
              </p>
              <p className="text-sm text-gray-500 mt-1">Efficacité</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
