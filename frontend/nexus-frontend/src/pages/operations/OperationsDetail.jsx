import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const typeLabels = {
  EXTRACTION: 'Extraction',
  DRILLING: 'Forage',
  BLASTING: 'Dynamitage',
  TRANSPORT: 'Transport',
  PROCESSING: 'Traitement',
  MAINTENANCE: 'Maintenance',
  INSPECTION: 'Inspection',
  OTHER: 'Autre',
};

const statusLabels = {
  PLANNED: 'Planifiée',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
};

const statusColors = {
  PLANNED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

export default function OperationsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSupervisor } = useAuthStore();
  const [operation, setOperation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOperation();
  }, [id]);

  const fetchOperation = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/operations/${id}/`);
      setOperation(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'opération "${operation.operation_code}" ?`)) {
      return;
    }
    try {
      await api.delete(`/operations/${id}/`);
      navigate('/operations');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!operation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Opération non trouvée</p>
        <Link to="/operations" className="mt-4 text-blue-600 hover:text-blue-500">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/operations"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{operation.operation_code}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {typeLabels[operation.operation_type] || operation.operation_type}
            </p>
          </div>
        </div>
        {isSupervisor() && (
          <div className="flex items-center gap-2">
            <Link
              to={`/operations/${id}/edit`}
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
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details card */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Détails de l'opération
            </h2>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                statusColors[operation.status] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {statusLabels[operation.status] || operation.status}
            </span>
          </div>
          
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex items-start gap-3">
              <ClipboardDocumentListIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {typeLabels[operation.operation_type] || operation.operation_type}
                </dd>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Site</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {operation.site_name || '—'}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(operation.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </dd>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Horaires</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {operation.start_time || '—'} → {operation.end_time || '—'}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CubeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Quantité extraite</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {operation.quantity_extracted 
                    ? `${Number(operation.quantity_extracted).toLocaleString('fr-FR')} tonnes`
                    : 'Non renseignée'}
                </dd>
              </div>
            </div>
          </dl>

          {operation.description && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {operation.description}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Dates */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Historique</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-gray-500">Créé le</p>
                  <p className="font-medium text-gray-900">
                    {new Date(operation.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-gray-500">Modifié le</p>
                  <p className="font-medium text-gray-900">
                    {new Date(operation.updated_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
