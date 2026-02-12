import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentTextIcon,
  MapPinIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  ClockIcon,
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

export default function ReportsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSupervisor, isSiteManager, isAnalyst } = useAuthStore();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [generatingExcel, setGeneratingExcel] = useState(false);

  // Générer PDF/Excel : ADMIN, SITE_MANAGER, SUPERVISOR, ANALYST
  const canGenerate = isSupervisor() || isAnalyst();
  // Modifier/Supprimer : ADMIN, SITE_MANAGER uniquement
  const canEditDelete = isSiteManager();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reports/${id}/`);
      setReport(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      return;
    }
    try {
      setDeleting(true);
      await api.delete(`/reports/${id}/`);
      navigate('/reports');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
      setDeleting(false);
    }
  };

  const handleGeneratePdf = async () => {
    try {
      setGeneratingPdf(true);
      const response = await api.post(`/reports/${id}/generate_pdf/`);
      setReport(response.data);
    } catch (error) {
      console.error('Erreur lors de la génération PDF:', error);
      alert('Erreur lors de la génération PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleGenerateExcel = async () => {
    try {
      setGeneratingExcel(true);
      const response = await api.post(`/reports/${id}/generate_excel/`);
      setReport(response.data);
    } catch (error) {
      console.error('Erreur lors de la génération Excel:', error);
      alert('Erreur lors de la génération Excel');
    } finally {
      setGeneratingExcel(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600 mx-auto"></div>
            <SparklesIcon className="h-6 w-6 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-slate-500 font-medium">Chargement du rapport...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-96">
        <div className="p-4 bg-purple-100 rounded-full mb-4">
          <ExclamationTriangleIcon className="h-12 w-12 text-purple-600" />
        </div>
        <p className="text-xl font-semibold text-slate-800">Rapport non trouvé</p>
        <p className="text-slate-500 mt-1">Ce rapport n'existe pas ou a été supprimé</p>
        <Link to="/reports" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
          Retour à la liste
        </Link>
      </div>
    );
  }

  const statConf = statusConfig[report.status] || statusConfig.DRAFT;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-8">
      {/* Premium Header avec bannière */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 shadow-2xl">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="reportGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#reportGrid)" />
          </svg>
        </div>
        
        {/* Gradient orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-indigo-400 opacity-10 blur-3xl"></div>
        
        <div className="relative px-8 py-8">
          {/* Back button */}
          <Link
            to="/reports"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-200 mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Retour aux rapports</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <span className="text-4xl">{typeEmojis[report.report_type] || '📋'}</span>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white">{report.title}</h1>
                <p className="mt-2 text-purple-100 flex items-center gap-2">
                  <DocumentTextIcon className="h-4 w-4" />
                  {typeLabels[report.report_type] || report.report_type}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold ${statConf.bg} ${statConf.text}`}>
                    <span className={`h-2 w-2 rounded-full ${statConf.dot}`}></span>
                    {statusLabels[report.status] || report.status}
                  </span>
                  {report.site_name && (
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm">
                      <MapPinIcon className="h-4 w-4" />
                      {report.site_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {report.file && (
                <a
                  href={report.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:bg-emerald-600 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Télécharger
                </a>
              )}
              {canGenerate && (
                <>
                  <button
                    onClick={handleGeneratePdf}
                    disabled={generatingPdf}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-purple-700 rounded-xl font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
                  >
                    {generatingPdf ? (
                      <div className="h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    )}
                    Générer PDF
                  </button>
                  <button
                    onClick={handleGenerateExcel}
                    disabled={generatingExcel}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-xl font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
                  >
                    {generatingExcel ? (
                      <div className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    )}
                    Générer Excel
                  </button>
                </>
              )}
              {canEditDelete && (
                <>
                  <Link
                    to={`/reports/${id}/edit`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-purple-700 rounded-xl font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Modifier
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl font-semibold shadow-lg hover:bg-red-600 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
                  >
                    {deleting ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <TrashIcon className="h-4 w-4" />
                    )}
                    Supprimer
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Period info */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-sm">
            <CalendarIcon className="h-7 w-7 text-white" />
          </div>
          <div>
            <p className="text-base font-semibold text-purple-600">Période du rapport</p>
            <p className="text-xl font-bold text-slate-800">
              {new Date(report.period_start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              <span className="mx-2 text-slate-400">→</span>
              {new Date(report.period_end).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content column */}
        <div className="lg:col-span-2 space-y-6">
          {report.summary && (
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
              <div className="border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <DocumentChartBarIcon className="h-5 w-5 text-purple-600" />
                  Résumé
                </h2>
              </div>
              <div className="p-6">
                <p className="text-base text-slate-500 leading-relaxed bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                  {report.summary}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5 text-purple-600" />
                Contenu
              </h2>
            </div>
            <div className="p-6">
              {report.content ? (
                <div className="prose prose-sm max-w-none text-slate-500 whitespace-pre-wrap bg-slate-50 p-4 rounded-xl">
                  {report.content}
                </div>
              ) : (
                <p className="text-slate-400 italic text-center py-8">Aucun contenu disponible</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info card */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-base font-semibold text-slate-800">Informations</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-xl">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DocumentTextIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Type</p>
                  <p className="text-base font-semibold text-slate-800 mt-0.5">
                    {typeLabels[report.report_type] || report.report_type}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPinIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Site</p>
                  <p className="text-base font-semibold text-slate-800 mt-0.5">
                    {report.site_name || 'Multi-sites'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dates card */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-base font-semibold text-slate-800">Historique</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-xl">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Créé le</p>
                  <p className="text-base font-semibold text-slate-800 mt-0.5">
                    {new Date(report.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
              {report.generated_at && (
                <div className="flex items-start gap-4 p-3 bg-indigo-50 rounded-xl">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ClockIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Généré le</p>
                    <p className="text-base font-semibold text-slate-800 mt-0.5">
                      {new Date(report.generated_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .max-w-5xl > * {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
