import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  FunnelIcon,
  DocumentChartBarIcon,
  XMarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const typeLabels = {
  DAILY: 'Journalier',
  WEEKLY: 'Hebdomadaire',
  MONTHLY: 'Mensuel',
  QUARTERLY: 'Trimestriel',
  ANNUAL: 'Annuel',
  INCIDENT: 'Incident',
  ENVIRONMENTAL: 'Environnemental',
  CUSTOM: 'Personnalisé',
};

const typeEmojis = {
  DAILY: '📅',
  WEEKLY: '📆',
  MONTHLY: '🗓️',
  QUARTERLY: '📊',
  ANNUAL: '📈',
  INCIDENT: '⚠️',
  ENVIRONMENTAL: '🌿',
  CUSTOM: '📋',
};

const typeColors = {
  DAILY: 'from-blue-500 to-blue-600',
  WEEKLY: 'from-cyan-500 to-blue-500',
  MONTHLY: 'from-indigo-500 to-indigo-600',
  QUARTERLY: 'from-purple-500 to-indigo-600',
  ANNUAL: 'from-violet-500 to-purple-600',
  INCIDENT: 'from-rose-500 to-red-600',
  ENVIRONMENTAL: 'from-emerald-500 to-teal-600',
  CUSTOM: 'from-orange-500 to-amber-600',
};

const statusLabels = {
  DRAFT: 'Brouillon',
  GENERATED: 'Généré',
  VALIDATED: 'Validé',
  PUBLISHED: 'Publié',
};

const statusConfig = {
  DRAFT: { 
    bg: 'bg-slate-100/80', 
    text: 'text-slate-700', 
    badge: 'bg-slate-200 text-slate-800',
    dot: 'bg-slate-500',
    icon: DocumentTextIcon,
  },
  GENERATED: { 
    bg: 'bg-blue-100/80', 
    text: 'text-blue-700',
    badge: 'bg-blue-200 text-blue-800',
    dot: 'bg-blue-500',
    icon: SparklesIcon,
  },
  VALIDATED: { 
    bg: 'bg-emerald-100/80', 
    text: 'text-emerald-700',
    badge: 'bg-emerald-200 text-emerald-800',
    dot: 'bg-emerald-500',
    icon: CheckCircleIcon,
  },
  PUBLISHED: { 
    bg: 'bg-purple-100/80', 
    text: 'text-purple-700',
    badge: 'bg-purple-200 text-purple-800',
    dot: 'bg-purple-500',
    icon: DocumentChartBarIcon,
  },
};

export default function ReportsList() {
  const [reports, setReports] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const { isAdmin, isSiteManager, isAnalyst, isMMG, isTechnicien } = useAuthStore();

  const canEdit = isAdmin() || isSiteManager() || isAnalyst() || isMMG() || isTechnicien();

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterType) params.append('report_type', filterType);
      if (filterStatus) params.append('status', filterStatus);
      if (filterSite) params.append('site', filterSite);
      
      const [reportsRes, sitesRes] = await Promise.all([
        api.get(`/reports/?${params.toString()}`),
        api.get('/sites/'),
      ]);
      
      setReports(reportsRes.data.results || reportsRes.data);
      setSites(sitesRes.data.results || sitesRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType, filterStatus, filterSite]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      return;
    }
    try {
      await api.delete(`/reports/${id}/`);
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const statCounts = {
    total: reports.length,
    draft: reports.filter(r => r.status === 'DRAFT').length,
    validated: reports.filter(r => r.status === 'VALIDATED').length,
    published: reports.filter(r => r.status === 'PUBLISHED').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 relative">
      {/* Background pattern */}
      <div className="fixed inset-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.05),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(16,185,129,0.05),transparent_50%)]"></div>
      </div>

      <div className="relative space-y-8 pb-12 px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Premium avec gradient animé */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-2xl animate-fadeInDown">
          {/* SVG Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="reportListGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#reportListGrid)" />
            </svg>
          </div>
          
          {/* Animated gradient orbs */}
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-indigo-400 opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500"></div>
          
          <div className="relative px-8 py-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div className="flex items-start gap-5">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <DocumentChartBarIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                    Rapports
                  </h1>
                  <p className="mt-2 text-blue-100 font-medium">
                    Gérez et explorez les rapports de vos sites miniers
                  </p>
                </div>
              </div>
              
              {canEdit && (
                <Link
                  to="/reports/new"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-white text-indigo-700 rounded-xl font-bold shadow-lg hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-1 transition-all duration-300 flex-shrink-0"
                >
                  <PlusIcon className="h-5 w-5" />
                  Nouveau rapport
                </Link>
              )}
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-2">Total rapports</p>
                <p className="text-3xl font-bold text-white font-outfit">{statCounts.total}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-2">Brouillons</p>
                <p className="text-3xl font-bold text-white font-outfit">{statCounts.draft}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-2">Validés</p>
                <p className="text-3xl font-bold text-white font-outfit">{statCounts.validated}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-2">Publiés</p>
                <p className="text-3xl font-bold text-white font-outfit">{statCounts.published}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-lg hover:shadow-xl hover:border-white/40 transition-all duration-500 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FunnelIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recherche & Filtres</h2>
            </div>
            
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Search Bar */}
              <div className="relative group/search">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within/search:text-indigo-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Rechercher un rapport..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-xl py-3 pl-12 pr-4 text-slate-900 bg-white/50 border border-slate-200/60 placeholder:text-slate-500 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 font-medium"
                />
              </div>

              {/* Filters Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Site Filter */}
                <div className="relative group/select">
                  <select
                    value={filterSite}
                    onChange={(e) => setFilterSite(e.target.value)}
                    className="w-full rounded-xl py-3 px-4 text-slate-900 bg-white/50 border border-slate-200/60 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 font-medium cursor-pointer appearance-none pr-8"
                  >
                    <option value="">📍 Tous les sites</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>{site.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>

                {/* Type Filter */}
                <div className="relative group/select">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full rounded-xl py-3 px-4 text-slate-900 bg-white/50 border border-slate-200/60 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 font-medium cursor-pointer appearance-none pr-8"
                  >
                    <option value="">📋 Tous types</option>
                    {Object.entries(typeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{typeEmojis[value]} {label}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>

                {/* Status Filter */}
                <div className="relative group/select">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full rounded-xl py-3 px-4 text-slate-900 bg-white/50 border border-slate-200/60 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 font-medium cursor-pointer appearance-none pr-8"
                  >
                    <option value="">📊 Tous statuts</option>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-indigo-800 hover:-translate-y-1 transition-all duration-300"
                >
                  Rechercher
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Reports Grid */}
        {loading ? (
          <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-12 shadow-lg flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-slate-200 animate-spin border-t-indigo-600 border-r-indigo-500"></div>
                <SparklesIcon className="h-8 w-8 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <p className="text-slate-600 font-semibold">Chargement des rapports...</p>
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-12 shadow-lg flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="p-4 bg-indigo-100 rounded-full mb-6 inline-block">
                <DocumentTextIcon className="h-12 w-12 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun rapport</h3>
              <p className="text-slate-600 mb-6">Aucun rapport ne correspond à vos critères de recherche</p>
              {canEdit && (
                <Link
                  to="/reports/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-indigo-700 transition-all duration-300"
                >
                  <PlusIcon className="h-5 w-5" />
                  Créer le premier rapport
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report, index) => {
              const statConf = statusConfig[report.status] || statusConfig.DRAFT;
              const typeGradient = typeColors[report.report_type] || typeColors.CUSTOM;
              
              return (
                <div
                  key={report.id}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 hover:border-white/40 overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-500 animate-fadeInUp"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Gradient accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${typeGradient}`}></div>
                  
                  {/* Hover gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  <div className="relative z-10 p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{typeEmojis[report.report_type] || '📋'}</span>
                        <div>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${statConf.badge} transition-all duration-300`}>
                            <span className={`h-2 w-2 rounded-full ${statConf.dot} animate-pulse`}></span>
                            {statusLabels[report.status]}
                          </span>
                          <p className="text-xs text-slate-500 mt-2 font-semibold uppercase tracking-wide">
                            {typeLabels[report.report_type]}
                          </p>
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Link
                          to={`/reports/${report.id}`}
                          className="p-2 rounded-lg bg-blue-100/80 text-blue-600 hover:bg-blue-200 transition-all duration-200"
                          title="Voir"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        {report.file && (
                          <a
                            href={report.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-indigo-100/80 text-indigo-600 hover:bg-indigo-200 transition-all duration-200"
                            title="Télécharger"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </a>
                        )}
                        {canEdit && (
                          <>
                            <Link
                              to={`/reports/${report.id}/edit`}
                              className="p-2 rounded-lg bg-amber-100/80 text-amber-600 hover:bg-amber-200 transition-all duration-200"
                              title="Éditer"
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(report.id)}
                              className="p-2 rounded-lg bg-red-100/80 text-red-600 hover:bg-red-200 transition-all duration-200"
                              title="Supprimer"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h3 className="font-bold text-slate-900 line-clamp-2 mb-3 text-sm group-hover:text-indigo-700 transition-colors duration-300">
                      {report.title}
                    </h3>
                    
                    {/* Summary */}
                    {report.summary && (
                      <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                        {report.summary}
                      </p>
                    )}
                    
                    {/* Footer Info */}
                    <div className="text-xs text-slate-500 pt-4 border-t border-slate-200/60 space-y-2">
                      <p className="flex items-center gap-2">
                        <span>📍</span>
                        <span className="truncate font-medium">{report.site_name || 'Multi-sites'}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span>📅</span>
                        <span className="truncate">
                          {new Date(report.period_start).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })} 
                          {' → '}
                          {new Date(report.period_end).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CSS Animations */}
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

        .animate-fadeInDown {
          animation: fadeInDown 0.7s ease-out forwards;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          animation-fill-mode: both;
        }

        /* Select styling */
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
}