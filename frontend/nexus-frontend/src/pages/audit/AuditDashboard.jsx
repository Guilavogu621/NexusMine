import { useEffect, useState } from 'react';
import {
  DocumentTextIcon,
  ClockIcon,
  UserIcon,
  CheckIcon,
  SparklesIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';
import { translateField, translateValue, formatDateFR } from '../../utils/translationUtils';

class AuditAnalyzer {
  static analyzeAnomalies(logs) {
    const anomalies = [];

    const deleteCount = logs.filter(l => l.action === 'DELETE').length;
    if (deleteCount > logs.length * 0.3) {
      anomalies.push({
        type: 'DELETE_SURGE',
        severity: 'HIGH',
        title: 'Vague de suppressions détectée',
        description: `${deleteCount} suppressions (${Math.round(deleteCount / logs.length * 100)}% des actions)`,
        icon: '🗑️',
      });
    }

    const nightLogs = logs.filter(l => {
      const hour = new Date(l.timestamp).getHours();
      return hour >= 22 || hour < 6;
    });
    if (nightLogs.length > logs.length * 0.2) {
      anomalies.push({
        type: 'NIGHT_ACTIVITY',
        severity: 'MEDIUM',
        title: 'Activité nocturne anormale',
        description: `${nightLogs.length} actions entre 22h et 6h`,
        icon: '🌙',
      });
    }

    const userCounts = {};
    logs.forEach(l => {
      userCounts[l.user_email] = (userCounts[l.user_email] || 0) + 1;
    });
    const topUser = Object.entries(userCounts).sort((a, b) => b[1] - a[1])[0];
    if (topUser && topUser[1] > logs.length * 0.4) {
      anomalies.push({
        type: 'POWER_USER',
        severity: 'LOW',
        title: 'Utilisateur très actif',
        description: `${topUser[0]}: ${topUser[1]} actions (${Math.round(topUser[1] / logs.length * 100)}%)`,
        icon: '⚡',
      });
    }

    const suspiciousUpdates = logs.filter(l =>
      l.action === 'UPDATE' &&
      l.object_label &&
      (l.object_label.includes('VALIDATED') || l.object_label.includes('PUBLISHED'))
    );
    if (suspiciousUpdates.length > 0) {
      anomalies.push({
        type: 'LOCKED_UPDATE',
        severity: 'CRITICAL',
        title: 'Modification de documents verrouillés',
        description: `${suspiciousUpdates.length} tentatives de modification de documents finalisés`,
        icon: '⚠️',
      });
    }

    return anomalies;
  }

  static getStats(logs) {
    return {
      total: logs.length,
      creates: logs.filter(l => l.action === 'CREATE').length,
      updates: logs.filter(l => l.action === 'UPDATE').length,
      deletes: logs.filter(l => l.action === 'DELETE').length,
      approvals: logs.filter(l => l.action === 'APPROVE').length,
      uniqueUsers: new Set(logs.map(l => l.user_email)).size,
      lastAction: logs[0]?.timestamp,
    };
  }

  static getActionTimeline(logs) {
    const timeline = {};
    logs.forEach(log => {
      const date = formatDateFR(log.timestamp);
      timeline[date] = (timeline[date] || 0) + 1;
    });
    return Object.entries(timeline)
      .sort((a, b) => {
        const dateA = new Date(a[0].split('/').reverse().join('-'));
        const dateB = new Date(b[0].split('/').reverse().join('-'));
        return dateA - dateB;
      })
      .slice(-14)
      .map(([date, count]) => ({ date, count }));
  }

  static getTopUsers(logs) {
    const userStats = {};
    logs.forEach(log => {
      if (!userStats[log.user_email]) {
        userStats[log.user_email] = {
          email: log.user_email,
          name: log.user_name,
          actions: 0,
          creates: 0,
          updates: 0,
          deletes: 0
        };
      }
      userStats[log.user_email].actions++;
      if (log.action === 'CREATE') userStats[log.user_email].creates++;
      if (log.action === 'UPDATE') userStats[log.user_email].updates++;
      if (log.action === 'DELETE') userStats[log.user_email].deletes++;
    });
    return Object.values(userStats)
      .sort((a, b) => b.actions - a.actions)
      .slice(0, 5);
  }

  static getTopModifiedObjects(logs) {
    const objStats = {};
    logs.forEach(log => {
      if (!objStats[log.object_label]) {
        objStats[log.object_label] = { label: log.object_label, count: 0 };
      }
      objStats[log.object_label].count++;
    });
    return Object.values(objStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
}

const AuditDashboard = () => {
  const user = useAuthStore((s) => s.user);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('timeline');
  const [filters, setFilters] = useState({
    action: '',
    content_type: '',
    date_range: 'all',
    search: '',
  });

  const [anomalies, setAnomalies] = useState([]);
  const [stats, setStats] = useState({});
  const [timeline, setTimeline] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [topObjects, setTopObjects] = useState([]);
  const [expandedLog, setExpandedLog] = useState(null);

  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return `il y a ${diff}s`;
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `il y a ${Math.floor(diff / 86400)}j`;
    return formatDateFR(date);
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [filters]);

  useEffect(() => {
    if (auditLogs.length > 0) {
      setAnomalies(AuditAnalyzer.analyzeAnomalies(auditLogs));
      setStats(AuditAnalyzer.getStats(auditLogs));
      setTimeline(AuditAnalyzer.getActionTimeline(auditLogs));
      setTopUsers(AuditAnalyzer.getTopUsers(auditLogs));
      setTopObjects(AuditAnalyzer.getTopModifiedObjects(auditLogs));
    }
  }, [auditLogs]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      let params = {};

      if (filters.action) params.action = filters.action;
      if (filters.content_type) params.content_type = filters.content_type;

      if (filters.date_range !== 'all') {
        const now = new Date();
        let startDate;

        if (filters.date_range === 'today') {
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else if (filters.date_range === 'week') {
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (filters.date_range === 'month') {
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        params.timestamp__gte = startDate.toISOString();
      }

      const res = await api.get('/audit-logs/', { params });
      setAuditLogs(res.data.results || res.data);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'audit trail:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    const colors = {
      CREATE: 'bg-emerald-100/80 text-emerald-800 border-emerald-200',
      UPDATE: 'bg-blue-100/80 text-blue-800 border-blue-200',
      DELETE: 'bg-red-100/80 text-red-800 border-red-200',
      APPROVE: 'bg-purple-100/80 text-purple-800 border-purple-200',
      VALIDATE: 'bg-green-100/80 text-green-800 border-green-200',
      PUBLISH: 'bg-indigo-100/80 text-indigo-800 border-indigo-200',
      LOCK: 'bg-gray-100/80 text-gray-800 border-gray-200',
    };
    return colors[action] || 'bg-slate-100/80 text-slate-800 border-slate-200';
  };

  const getActionIcon = (action) => {
    const icons = {
      CREATE: '➕',
      UPDATE: '✏️',
      DELETE: '🗑️',
      APPROVE: '✅',
      VALIDATE: '🔍',
      PUBLISH: '📢',
      LOCK: '🔒',
    };
    return icons[action] || '📝';
  };

  if (!user || !['MMG', 'ADMIN'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center max-w-md shadow-lg">
          <div className="p-4 bg-amber-100 rounded-full w-16 h-16 mx-auto mb-4 inline-flex items-center justify-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">🔐 Accès refusé</h3>
          <p className="text-slate-600 mt-3 font-medium">Cette section est réservée aux MMG et ADMIN.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 relative">
      <div className="fixed inset-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.05),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(16,185,129,0.05),transparent_50%)]"></div>
      </div>

      <div className="relative space-y-8 pb-12 px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Premium */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 shadow-2xl animate-fadeInDown max-w-7xl mx-auto w-full">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="auditGrid3" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#auditGrid3)" />
            </svg>
          </div>

          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-indigo-400 opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500"></div>

          <div className="relative px-8 py-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheckIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight flex items-center gap-2">
                    🔍 Audit & Conformité
                  </h1>
                  <p className="mt-2 text-blue-100 font-medium">🛡️ Système de détection d'anomalies & conformité réglementaire</p>
                </div>
              </div>

              <div className="text-white text-center flex-shrink-0">
                <p className="text-4xl font-bold font-outfit">{stats.total || 0}</p>
                <p className="text-blue-100 text-sm mt-1 font-medium">📊 Actions tracées</p>
              </div>
            </div>

            {/* View Mode Tabs */}
            <div className="flex gap-2 mt-8 flex-wrap">
              {['timeline', 'deletions', 'analytics', 'threats'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${viewMode === mode
                    ? 'bg-white text-indigo-700 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                    }`}
                >
                  {mode === 'timeline' && '📊 Historique'}
                  {mode === 'deletions' && '🗑️ Suppressions'}
                  {mode === 'analytics' && '📈 Analyses'}
                  {mode === 'threats' && '⚠️ Menaces'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full space-y-8">
          {/* KPI Cards */}
          {(viewMode === 'analytics' || viewMode === 'timeline') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 animate-fadeInUp">
              {[
                { label: 'Créations', value: stats.creates, gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-100/80', text: 'text-emerald-700', icon: '✨' },
                { label: 'Modifications', value: stats.updates, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-100/80', text: 'text-blue-700', icon: '✏️' },
                { label: 'Suppressions', value: stats.deletes, gradient: 'from-red-500 to-red-600', bg: 'bg-red-100/80', text: 'text-red-700', icon: '🗑️' },
                { label: 'Approbations', value: stats.approvals, gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-100/80', text: 'text-purple-700', icon: '✅' },
                { label: 'Utilisateurs', value: stats.uniqueUsers, gradient: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-100/80', text: 'text-indigo-700', icon: '👥' },
              ].map((kpi, i) => (
                <div key={i} className={`group relative ${kpi.bg} backdrop-blur-sm rounded-2xl border border-white/20 hover:border-white/40 p-6 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
                  <div className="relative z-10">
                    <div className="text-3xl font-bold mb-2">{kpi.icon}</div>
                    <div className={`text-3xl font-bold ${kpi.text} mb-1`}>{kpi.value}</div>
                    <div className={`text-sm font-semibold ${kpi.text}`}>{kpi.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Threat Detection Panel */}
          {viewMode === 'threats' && (
            <div className="space-y-6 animate-fadeInUp">
              {anomalies.length === 0 ? (
                <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-12 shadow-lg overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
                  <div className="relative z-10 text-center">
                    <CheckIcon className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">✅ Aucune anomalie détectée</h3>
                    <p className="text-slate-600 font-medium">🟢 Le système fonctionne normalement</p>
                  </div>
                </div>
              ) : (
                anomalies.map((anomaly, i) => {
                  const severityClasses = {
                    CRITICAL: { gradient: 'from-red-500 to-red-600', bg: 'bg-red-100/80', border: 'border-red-200', text: 'text-red-800', badge: 'bg-red-200 text-red-800' },
                    HIGH: { gradient: 'from-orange-500 to-orange-600', bg: 'bg-orange-100/80', border: 'border-orange-200', text: 'text-orange-800', badge: 'bg-orange-200 text-orange-800' },
                    MEDIUM: { gradient: 'from-yellow-500 to-yellow-600', bg: 'bg-yellow-100/80', border: 'border-yellow-200', text: 'text-yellow-800', badge: 'bg-yellow-200 text-yellow-800' },
                    LOW: { gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-100/80', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-200 text-blue-800' },
                  };
                  const classes = severityClasses[anomaly.severity] || severityClasses.LOW;
                  return (
                    <div
                      key={i}
                      className={`group relative ${classes.bg} backdrop-blur-sm rounded-2xl border ${classes.border} hover:border-white/40 p-6 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
                      <div className="relative z-10 flex items-start gap-4">
                        <div className="text-4xl flex-shrink-0">{anomaly.icon}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold text-lg ${classes.text} mb-1`}>{anomaly.title}</h4>
                          <p className={`text-sm ${classes.text}`}>{anomaly.description}</p>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${classes.badge} flex-shrink-0`}>
                          {anomaly.severity}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Deletions Tracking View */}
          {viewMode === 'deletions' && (
            <div className="space-y-6 animate-fadeInUp">
              {/* Deletion Stats Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-red-50/80 backdrop-blur-sm rounded-2xl border border-red-200/60 p-5">
                  <div className="text-3xl font-bold text-red-700">{auditLogs.filter(l => l.action === 'DELETE').length}</div>
                  <div className="text-sm font-semibold text-red-600 mt-1">🗑️ Total suppressions</div>
                </div>
                <div className="bg-orange-50/80 backdrop-blur-sm rounded-2xl border border-orange-200/60 p-5">
                  <div className="text-3xl font-bold text-orange-700">
                    {new Set(auditLogs.filter(l => l.action === 'DELETE').map(l => l.user_email)).size}
                  </div>
                  <div className="text-sm font-semibold text-orange-600 mt-1">👥 Utilisateurs impliqués</div>
                </div>
                <div className="bg-amber-50/80 backdrop-blur-sm rounded-2xl border border-amber-200/60 p-5">
                  <div className="text-3xl font-bold text-amber-700">
                    {new Set(auditLogs.filter(l => l.action === 'DELETE').map(l => l.content_type)).size}
                  </div>
                  <div className="text-sm font-semibold text-amber-600 mt-1">📦 Types d'objets supprimés</div>
                </div>
              </div>

              {/* Deletion Logs */}
              {auditLogs.filter(l => l.action === 'DELETE').length === 0 ? (
                <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-12 text-center">
                  <CheckIcon className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">✅ Aucune suppression enregistrée</h3>
                  <p className="text-slate-600">Aucun objet n'a été supprimé durant cette période.</p>
                </div>
              ) : (
                auditLogs.filter(l => l.action === 'DELETE').map((log) => (
                  <div key={log.id} className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-red-200/40 hover:border-red-300/60 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-red-500 to-red-600 rounded-l-2xl" />
                    <div className="relative z-10 p-6 pl-7">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="p-3 bg-red-100 rounded-xl flex-shrink-0">
                            <TrashIcon className="h-6 w-6 text-red-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-xs font-bold px-3 py-1.5 rounded-lg border bg-red-100/80 text-red-800 border-red-200">
                                🗑️ SUPPRIMÉ
                              </span>
                              <span className="text-xs text-slate-500 font-medium px-2 py-1 bg-slate-100 rounded-lg">📦 {log.content_type}</span>
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg mb-1">📋 {log.object_label}</h3>
                            <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
                              <span className="flex items-center gap-1">👤 <strong>{log.user_name || log.user_email}</strong></span>
                              <span className="flex items-center gap-1">🕐 {getRelativeTime(log.timestamp)}</span>
                              {log.ip_address && <span className="flex items-center gap-1">🌐 {log.ip_address}</span>}
                            </div>
                            {log.reason && (
                              <div className="mt-2 text-sm text-slate-500 flex items-center gap-1">💬 {log.reason}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="text-right text-xs text-slate-500">
                            <div>📅 {formatDateFR(log.timestamp)}</div>
                            <div>🕐 {new Date(log.timestamp).toLocaleTimeString('fr-FR')}</div>
                          </div>
                          <button
                            onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 transition-all"
                            title="Voir les données supprimées"
                          >
                            {expandedLog === log.id ? <ChevronUpIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Detail - Old Value Data */}
                      {expandedLog === log.id && log.old_value && (
                        <div className="mt-5 pt-5 border-t border-red-100">
                          <h4 className="font-bold text-sm text-red-700 mb-3 flex items-center gap-2">
                            <EyeIcon className="h-4 w-4" /> 📸 Données avant suppression
                          </h4>
                          <div className="bg-red-50/50 rounded-xl border border-red-100 overflow-hidden">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-red-100/60">
                                  <th className="text-left px-4 py-2 font-bold text-red-800">Champ</th>
                                  <th className="text-left px-4 py-2 font-bold text-red-800">Valeur</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(typeof log.old_value === 'string' ? JSON.parse(log.old_value) : log.old_value).map(([key, value], i) => (
                                  <tr key={key} className={i % 2 === 0 ? 'bg-white/50' : 'bg-red-50/30'}>
                                    <td className="px-4 py-2 font-semibold text-slate-700 whitespace-nowrap">{translateField(key)}</td>
                                    <td className="px-4 py-2 text-slate-600 break-all">{translateValue(value)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      {expandedLog === log.id && !log.old_value && (
                        <div className="mt-5 pt-5 border-t border-red-100">
                          <p className="text-sm text-slate-500 italic">⚠️ Pas de snapshot des données disponible pour cette suppression.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Analytics View */}
          {viewMode === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeInUp">
              {/* Top Users */}
              <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 hover:border-white/40 p-6 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
                <div className="relative z-10">
                  <h3 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
                    <div className="p-2.5 rounded-lg bg-indigo-100">
                      <UserIcon className="h-5 w-5 text-indigo-600" />
                    </div>
                    👥 Utilisateurs les plus actifs
                  </h3>
                  <div className="space-y-3">
                    {topUsers.map((u, i) => (
                      <div key={i} className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/60 hover:border-slate-300 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              👤 {u.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">📧 {u.email}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-slate-900">{u.actions}</div>
                            <div className="text-xs text-slate-500">actions</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-emerald-100/80 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-1">
                            ➕ {u.creates}
                          </span>
                          <span className="px-2 py-1 bg-blue-100/80 text-blue-700 text-xs font-bold rounded-lg flex items-center gap-1">
                            ✏️ {u.updates}
                          </span>
                          <span className="px-2 py-1 bg-red-100/80 text-red-700 text-xs font-bold rounded-lg flex items-center gap-1">
                            🗑️ {u.deletes}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Most Modified Objects */}
              <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 hover:border-white/40 p-6 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
                <div className="relative z-10">
                  <h3 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
                    <div className="p-2.5 rounded-lg bg-blue-100">
                      <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    📄 Documents les plus modifiés
                  </h3>
                  <div className="space-y-3">
                    {topObjects.map((obj, i) => (
                      <div key={i} className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/60 hover:border-slate-300 transition-all">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="font-medium text-slate-900 truncate text-sm">📋 {obj.label}</div>
                          <span className="font-bold text-slate-900 min-w-8 text-right text-sm">{obj.count}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-600 to-blue-600 transition-all" style={{ width: `${(obj.count / Math.max(...topObjects.map(o => o.count), 1)) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline Chart */}
              <div className="lg:col-span-2 group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 hover:border-white/40 p-6 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
                <div className="relative z-10">
                  <h3 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
                    <div className="p-2.5 rounded-lg bg-emerald-100">
                      <ChartBarIcon className="h-5 w-5 text-emerald-600" />
                    </div>
                    📊 Tendance des actions (14 derniers jours)
                  </h3>
                  <div className="flex items-end justify-between h-48 gap-2 px-2">
                    {timeline.length > 0 ? (
                      timeline.map((day, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div
                            className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t transition-all hover:shadow-lg hover:from-indigo-700 hover:to-indigo-500"
                            style={{ height: `${(day.count / Math.max(...timeline.map(d => d.count), 1)) * 180}px` }}
                            title={`📅 ${day.date}: ${day.count} actions`}
                          />
                          <div className="text-xs text-slate-500 truncate w-full text-center">{day.date.substring(0, 5)}</div>
                        </div>
                      ))
                    ) : (
                      <div className="w-full text-center text-slate-500 py-12">📭 Aucune donnée</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          {viewMode === 'timeline' && (
            <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 hover:border-white/40 p-6 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden animate-fadeInUp">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
              <div className="relative z-10">
                <h3 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
                  <div className="p-2.5 rounded-lg bg-slate-100">
                    <FunnelIcon className="h-5 w-5 text-slate-600" />
                  </div>
                  🔍 Filtres avancés
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      🔎 Recherche
                    </label>
                    <input type="text" placeholder="User, objet, raison..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200/60 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      ⚙️ Type d'action
                    </label>
                    <select value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200/60 text-slate-900 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 font-medium cursor-pointer appearance-none pr-8">
                      <option value="">📋 Tous</option>
                      <option value="CREATE">➕ Création</option>
                      <option value="UPDATE">✏️ Modification</option>
                      <option value="DELETE">🗑️ Suppression</option>
                      <option value="APPROVE">✅ Approbation</option>
                      <option value="VALIDATE">🔍 Validation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      📦 Type de données
                    </label>
                    <select value={filters.content_type} onChange={(e) => setFilters({ ...filters, content_type: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200/60 text-slate-900 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 font-medium cursor-pointer appearance-none pr-8">
                      <option value="">📋 Tous</option>
                      <option value="reports.Report">📄 Rapports</option>
                      <option value="operations.Operation">⚙️ Opérations</option>
                      <option value="incidents.Incident">🚨 Incidents</option>
                      <option value="personnel.Personnel">👥 Personnel</option>
                      <option value="equipment.Equipment">🔧 Équipements</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      📅 Période
                    </label>
                    <select value={filters.date_range} onChange={(e) => setFilters({ ...filters, date_range: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/50 border border-slate-200/60 text-slate-900 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 font-medium cursor-pointer appearance-none pr-8">
                      <option value="all">📋 Tous</option>
                      <option value="today">☀️ Aujourd'hui</option>
                      <option value="week">📅 Cette semaine</option>
                      <option value="month">📆 Ce mois</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Audit Trail List */}
          {viewMode === 'timeline' && (
            <div className="space-y-6 animate-fadeInUp">
              {loading ? (
                <div className="text-center py-12">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-200 animate-spin border-t-indigo-600 border-r-indigo-500"></div>
                  </div>
                  <p className="text-slate-600 font-semibold">⏳ Chargement...</p>
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-500">📭 Aucun enregistrement d'audit</div>
              ) : (
                auditLogs.map((log, idx) => (
                  <div
                    key={log.id}
                    className={`group relative bg-white/80 backdrop-blur-md rounded-2xl border ${log.action === 'DELETE' ? 'border-red-200/40' : 'border-white/20'} hover:border-white/40 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {/* Color accent bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${log.action === 'DELETE' ? 'bg-gradient-to-b from-red-500 to-red-600' :
                      log.action === 'CREATE' ? 'bg-gradient-to-b from-emerald-500 to-emerald-600' :
                        log.action === 'UPDATE' ? 'bg-gradient-to-b from-blue-500 to-blue-600' :
                          log.action === 'APPROVE' ? 'bg-gradient-to-b from-purple-500 to-purple-600' :
                            'bg-gradient-to-b from-slate-400 to-slate-500'
                      }`} />
                    <div className="relative z-10 p-6 pl-7">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="text-3xl flex-shrink-0">{getActionIcon(log.action)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${getActionColor(log.action)}`}>
                                {log.action_display}
                              </span>
                              <span className="text-xs text-slate-500 font-medium px-2 py-1 bg-slate-100 rounded-lg">📦 {log.content_type}</span>
                              <span className="text-xs text-slate-400 font-medium">🕐 {getRelativeTime(log.timestamp)}</span>
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                              📋 {log.object_label}
                            </h3>
                            <div className="text-sm text-slate-600 space-y-1">
                              {log.field_changed && (
                                <div className="flex items-center gap-2">
                                  <span>🏷️</span>
                                  <span className="font-semibold">Champ:</span> {log.field_changed}
                                  {log.old_value && log.new_value && !log.field_changed && (
                                    <span> ({JSON.stringify(log.old_value)} → {JSON.stringify(log.new_value)})</span>
                                  )}
                                </div>
                              )}
                              {log.reason && (
                                <div className="flex items-center gap-2">
                                  <span>💬</span>
                                  <span className="font-semibold">Raison:</span> {log.reason}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="text-right text-sm">
                            <div className="flex items-center gap-1 text-slate-600 mb-1 justify-end">
                              <UserIcon className="h-4 w-4" />
                              <span className="font-bold text-xs">👤 {log.user_name || log.user_email}</span>
                            </div>
                            <div className="text-xs text-slate-500">
                              📅 {formatDateFR(log.timestamp, true)}
                            </div>
                            {log.ip_address && (
                              <div className="text-xs text-slate-400 mt-0.5">🌐 {log.ip_address}</div>
                            )}
                          </div>
                          {(log.old_value || log.new_value) && (
                            <button
                              onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 transition-all"
                              title="Voir les détails"
                            >
                              {expandedLog === log.id ? <ChevronUpIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expandable Detail Panel */}
                      {expandedLog === log.id && (log.old_value || log.new_value) && (
                        <div className={`mt-5 pt-5 border-t ${log.action === 'DELETE' ? 'border-red-100' : log.action === 'CREATE' ? 'border-emerald-100' : 'border-slate-100'}`}>
                          <div className={`grid ${log.old_value && log.new_value && log.action === 'UPDATE' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-4`}>
                            {log.old_value && (
                              <div>
                                <h4 className={`font-bold text-sm mb-3 flex items-center gap-2 ${log.action === 'DELETE' ? 'text-red-700' : 'text-slate-700'}`}>
                                  � {log.action === 'DELETE' ? 'Données supprimées' : 'Anciennes valeurs'}
                                </h4>
                                <div className={`rounded-xl border overflow-hidden ${log.action === 'DELETE' ? 'bg-red-50/50 border-red-100' : 'bg-slate-50/50 border-slate-200'}`}>
                                  <table className="w-full text-sm">
                                    <tbody>
                                      {Object.entries(typeof log.old_value === 'string' ? JSON.parse(log.old_value) : log.old_value).map(([key, value], i) => (
                                        <tr key={key} className={i % 2 === 0 ? 'bg-white/50' : ''}>
                                          <td className="px-3 py-1.5 font-semibold text-slate-700 whitespace-nowrap text-xs">{translateField(key)}</td>
                                          <td className="px-3 py-1.5 text-slate-600 break-all text-xs">{translateValue(value)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                            {log.new_value && (
                              <div>
                                <h4 className={`font-bold text-sm mb-3 flex items-center gap-2 ${log.action === 'CREATE' ? 'text-emerald-700' : 'text-slate-700'}`}>
                                  ✨ {log.action === 'CREATE' ? 'Données créées' : 'Nouvelles valeurs'}
                                </h4>
                                <div className={`rounded-xl border overflow-hidden ${log.action === 'CREATE' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50/50 border-slate-200'}`}>
                                  <table className="w-full text-sm">
                                    <tbody>
                                      {Object.entries(typeof log.new_value === 'string' ? JSON.parse(log.new_value) : log.new_value).map(([key, value], i) => (
                                        <tr key={key} className={i % 2 === 0 ? 'bg-white/50' : ''}>
                                          <td className="px-3 py-1.5 font-semibold text-slate-700 whitespace-nowrap text-xs">{key}</td>
                                          <td className="px-3 py-1.5 text-slate-600 break-all text-xs">{String(value)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

        .font-outfit { font-family: 'Outfit', sans-serif; }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeInDown { animation: fadeInDown 0.7s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; animation-fill-mode: both; }

        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'%3E%3C/path%3E%3C/svg%3E");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
        }
      `}</style>
    </div>
  );
};

export default AuditDashboard;