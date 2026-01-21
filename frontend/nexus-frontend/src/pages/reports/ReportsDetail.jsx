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

export default function ReportsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSupervisor, isAnalyst } = useAuthStore();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const canEdit = isSupervisor() || isAnalyst();

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
      await api.delete(`/reports/${id}/`);
      navigate('/reports');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Rapport non trouvé</p>
        <Link to="/reports" className="mt-4 text-purple-600 hover:text-purple-500">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/reports"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[report.status]}`}>
                {statusLabels[report.status]}
              </span>
              <span className="text-sm text-gray-500">
                {typeLabels[report.report_type]}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {report.file && (
            <a
              href={report.file}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-500 transition-colors"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Télécharger
            </a>
          )}
          {canEdit && (
            <>
              <Link
                to={`/reports/${id}/edit`}
                className="inline-flex items-center rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50 transition-colors"
              >
                <PencilSquareIcon className="h-4 w-4 mr-2" />
                Modifier
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 transition-colors"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Supprimer
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {report.summary && (
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Résumé</h2>
              <p className="text-gray-600">{report.summary}</p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contenu</h2>
            {report.content ? (
              <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
                {report.content}
              </div>
            ) : (
              <p className="text-gray-400 italic">Aucun contenu</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Informations</h3>
            <dl className="space-y-4">
              <div className="flex items-start gap-3">
                <DocumentTextIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <dt className="text-sm text-gray-500">Type</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {typeLabels[report.report_type]}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <dt className="text-sm text-gray-500">Site</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {report.site_name || 'Multi-sites'}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <dt className="text-sm text-gray-500">Période</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {new Date(report.period_start).toLocaleDateString('fr-FR')} - {new Date(report.period_end).toLocaleDateString('fr-FR')}
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Dates</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Créé le</p>
                <p className="font-medium text-gray-900">
                  {new Date(report.created_at).toLocaleString('fr-FR')}
                </p>
              </div>
              {report.generated_at && (
                <div>
                  <p className="text-gray-500">Généré le</p>
                  <p className="font-medium text-gray-900">
                    {new Date(report.generated_at).toLocaleString('fr-FR')}
                  </p>
                </div>
              )}
              {report.validated_at && (
                <div>
                  <p className="text-gray-500">Validé le</p>
                  <p className="font-medium text-gray-900">
                    {new Date(report.validated_at).toLocaleString('fr-FR')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
