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

const statusLabels = {
  DRAFT: 'Brouillon',
  GENERATED: 'Généré',
  VALIDATED: 'Validé',
  PUBLISHED: 'Publié',
};

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  GENERATED: 'bg-blue-100 text-blue-800',
  VALIDATED: 'bg-green-100 text-green-800',
  PUBLISHED: 'bg-purple-100 text-purple-800',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les rapports de vos sites miniers
          </p>
        </div>
        {canEdit && (
          <Link
            to="/reports/new"
            className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouveau rapport
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un rapport..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-600 sm:text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className="rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-purple-600 sm:text-sm"
            >
              <option value="">Tous les sites</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-purple-600 sm:text-sm"
            >
              <option value="">Tous types</option>
              {Object.entries(typeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-purple-600 sm:text-sm"
            >
              <option value="">Tous statuts</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
            >
              Rechercher
            </button>
          </div>
        </form>
      </div>

      {/* Reports grid */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <DocumentTextIcon className="h-12 w-12 mb-4" />
            <p>Aucun rapport trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="h-8 w-8 text-purple-600" />
                    <div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[report.status]}`}>
                        {statusLabels[report.status]}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {typeLabels[report.report_type]}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Link
                      to={`/reports/${report.id}`}
                      className="p-1 rounded text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                    {report.file && (
                      <a
                        href={report.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded text-gray-400 hover:text-green-600 hover:bg-green-50"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </a>
                    )}
                    {canEdit && (
                      <>
                        <Link
                          to={`/reports/${report.id}/edit`}
                          className="p-1 rounded text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                  {report.title}
                </h3>
                {report.summary && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {report.summary}
                  </p>
                )}
                <div className="text-xs text-gray-400">
                  <p>{report.site_name || 'Multi-sites'}</p>
                  <p className="mt-1">
                    Période: {new Date(report.period_start).toLocaleDateString('fr-FR')} - {new Date(report.period_end).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
