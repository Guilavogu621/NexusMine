import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  BellAlertIcon,
  MapPinIcon,
  CalendarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const typeLabels = {
  THRESHOLD_EXCEEDED: 'Seuil dépassé',
  SAFETY: 'Sécurité',
  MAINTENANCE: 'Maintenance',
  ENVIRONMENTAL: 'Environnement',
  PRODUCTION: 'Production',
  SYSTEM: 'Système',
};

const priorityLabels = {
  LOW: 'Basse',
  MEDIUM: 'Moyenne',
  HIGH: 'Haute',
  URGENT: 'Urgente',
};

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

const statusLabels = {
  NEW: 'Nouvelle',
  READ: 'Lue',
  IN_PROGRESS: 'En cours',
  RESOLVED: 'Résolue',
  ARCHIVED: 'Archivée',
};

const statusColors = {
  NEW: 'bg-red-100 text-red-800',
  READ: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-gray-100 text-gray-800',
};

export default function AlertsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSupervisor } = useAuthStore();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/alerts/${id}/`);
      setAlert(response.data);
      // Mark as read if new
      if (response.data.status === 'NEW') {
        await api.patch(`/alerts/${id}/`, { status: 'READ' });
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    try {
      await api.patch(`/alerts/${id}/`, { status: 'RESOLVED' });
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
      return;
    }
    try {
      await api.delete(`/alerts/${id}/`);
      navigate('/alerts');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Alerte non trouvée</p>
        <Link to="/alerts" className="mt-4 text-orange-600 hover:text-orange-500">
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
            to="/alerts"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityColors[alert.priority]}`}>
                {priorityLabels[alert.priority]}
              </span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[alert.status]}`}>
                {statusLabels[alert.status]}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{alert.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {alert.status !== 'RESOLVED' && alert.status !== 'ARCHIVED' && (
            <button
              onClick={handleResolve}
              className="inline-flex items-center rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-500 transition-colors"
            >
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Résoudre
            </button>
          )}
          {isSupervisor() && (
            <>
              <Link
                to={`/alerts/${id}/edit`}
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
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Message</h2>
          <p className="text-gray-600 whitespace-pre-line">{alert.message}</p>
          
          <div className="mt-6 pt-6 border-t border-gray-100">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex items-start gap-3">
                <BellAlertIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {typeLabels[alert.alert_type] || alert.alert_type}
                  </dd>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <dt className="text-sm font-medium text-gray-500">Site</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {alert.site_name || 'Tous les sites'}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Chronologie</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-gray-500">Générée le</p>
                  <p className="font-medium text-gray-900">
                    {new Date(alert.generated_at).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
              {alert.read_at && (
                <div className="flex items-center gap-3 text-sm">
                  <CalendarIcon className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-gray-500">Lue le</p>
                    <p className="font-medium text-gray-900">
                      {new Date(alert.read_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              )}
              {alert.resolved_at && (
                <div className="flex items-center gap-3 text-sm">
                  <CalendarIcon className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-gray-500">Résolue le</p>
                    <p className="font-medium text-gray-900">
                      {new Date(alert.resolved_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
