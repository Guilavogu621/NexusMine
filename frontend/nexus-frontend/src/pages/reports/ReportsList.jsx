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

const statusLabels = {
  DRAFT: 'Brouillon',
  GENERATED: 'Généré',
  VALIDATED: 'Validé',
  PUBLISHED: 'Publié',
};

const statusConfig = {
  DRAFT: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-gray-500' },
  GENERATED: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-indigo-500' },
  VALIDATED: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  PUBLISHED: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
};

export default function ReportsList() {
  const [reports, setReports] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const { isSupervisor, isAnalyst } = useAuthStore();

  const canEdit = isSupervisor() || isAnalyst();

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

  return (
    <div className="space-y-6 pb-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 shadow-2xl">
        {/* Background pattern */}
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
        
        {/* Gradient orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-indigo-400 opacity-10 blur-3xl"></div>
        
        <div className="relative px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <DocumentChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white">Rapports</h1>
                <p className="mt-1 text-indigo-100">
                  Gérez les rapports de vos sites miniers
                </p>
              </div>
            </div>
            {canEdit && (
              <Link
                to="/reports/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-xl font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <PlusIcon className="h-5 w-5" />
                Nouveau rapport
              </Link>
            )}
          </div>
          
          {/* Stats row */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-base text-indigo-100">Total rapports</p>
              <p className="text-xl font-semibold text-white">{reports.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-base text-indigo-100">Brouillons</p>
              <p className="text-xl font-semibold text-white">{reports.filter(r => r.status === 'DRAFT').length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-base text-indigo-100">Validés</p>
              <p className="text-xl font-semibold text-white">{reports.filter(r => r.status === 'VALIDATED').length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-base text-indigo-100">Publiés</p>
              <p className="text-xl font-semibold text-white">{reports.filter(r => r.status === 'PUBLISHED').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="h-5 w-5 text-slate-500" />
          <span className="font-semibold text-slate-800">Recherche et filtres</span>
        </div>
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un rapport..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-xl border-0 py-3 pl-11 pr-4 text-slate-800 ring-1 ring-inset ring-gray-300 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 sm:text-sm bg-slate-50 font-medium"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className="rounded-xl border-0 py-3 px-4 text-slate-800 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-500 sm:text-sm bg-slate-50 font-medium"
            >
              <option value="">📍 Tous les sites</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-xl border-0 py-3 px-4 text-slate-800 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-500 sm:text-sm bg-slate-50 font-medium"
            >
              <option value="">📋 Tous types</option>
              {Object.entries(typeLabels).map(([value, label]) => (
                <option key={value} value={value}>{typeEmojis[value]} {label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border-0 py-3 px-4 text-slate-800 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-500 sm:text-sm bg-slate-50 font-medium"
            >
              <option value="">📊 Tous statuts</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white hover:from-indigo-700 hover:to-blue-700 shadow-sm hover:shadow-md transition-all duration-200"
            >
              Rechercher
            </button>
          </div>
        </form>
      </div>

      {/* Reports grid */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600 mx-auto"></div>
                <SparklesIcon className="h-5 w-5 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="mt-4 text-slate-500 font-medium">Chargement des rapports...</p>
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="p-4 bg-indigo-100 rounded-full mb-4">
              <DocumentTextIcon className="h-12 w-12 text-indigo-600" />
            </div>
            <p className="text-xl font-semibold text-slate-800">Aucun rapport</p>
            <p className="text-slate-500 mt-1">Aucun rapport ne correspond à vos critères</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {reports.map((report, index) => {
              const statConf = statusConfig[report.status] || statusConfig.DRAFT;
              
              return (
                <div
                  key={report.id}
                  className="bg-slate-50 rounded-2xl p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-200 border border-slate-200/60"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{typeEmojis[report.report_type] || '📋'}</span>
                      <div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-semibold ${statConf.bg} ${statConf.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${statConf.dot}`}></span>
                          {statusLabels[report.status]}
                        </span>
                        <p className="text-sm text-slate-500 mt-1">
                          {typeLabels[report.report_type]}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Link
                        to={`/reports/${report.id}`}
                        className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      {report.file && (
                        <a
                          href={report.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </a>
                      )}
                      {canEdit && (
                        <>
                          <Link
                            to={`/reports/${report.id}/edit`}
                            className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(report.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-800 line-clamp-2 mb-2">
                    {report.title}
                  </h3>
                  {report.summary && (
                    <p className="text-base text-slate-500 line-clamp-2 mb-3">
                      {report.summary}
                    </p>
                  )}
                  <div className="text-sm text-slate-400 pt-3 border-t border-slate-200/60 space-y-1">
                    <p className="flex items-center gap-1">📍 {report.site_name || 'Multi-sites'}</p>
                    <p className="flex items-center gap-1">
                      📅 {new Date(report.period_start).toLocaleDateString('fr-FR')} → {new Date(report.period_end).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .space-y-6 > * {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
