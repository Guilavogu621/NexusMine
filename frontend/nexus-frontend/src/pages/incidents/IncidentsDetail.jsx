import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const typeLabels = {
  ACCIDENT: 'Accident corporel',
  EQUIPMENT_FAILURE: 'Panne équipement',
  ENVIRONMENTAL: 'Incident environnemental',
  SECURITY: 'Incident de sécurité',
  LANDSLIDE: 'Glissement de terrain',
  FIRE: 'Incendie',
  OTHER: 'Autre',
};

const severityLabels = {
  LOW: 'Faible',
  MEDIUM: 'Moyen',
  HIGH: 'Élevé',
  CRITICAL: 'Critique',
};

const severityColors = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

const statusLabels = {
  REPORTED: 'Déclaré',
  INVESTIGATING: 'En investigation',
  RESOLVED: 'Résolu',
  CLOSED: 'Clôturé',
};

const statusColors = {
  REPORTED: 'bg-blue-100 text-blue-800',
  INVESTIGATING: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

export default function IncidentsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSupervisor } = useAuthStore();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const fetchIncident = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/incidents/${id}/`);
      setIncident(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'incident "${incident.incident_code}" ?`)) {
      return;
    }
    try {
      await api.delete(`/incidents/${id}/`);
      navigate('/incidents');
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

  if (!incident) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Incident non trouvé</p>
        <Link to="/incidents" className="mt-4 text-blue-600 hover:text-blue-500">
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
            to="/incidents"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{incident.incident_code}</h1>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                  severityColors[incident.severity] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {severityLabels[incident.severity] || incident.severity}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {typeLabels[incident.incident_type] || incident.incident_type}
            </p>
          </div>
        </div>
        {isSupervisor() && (
          <div className="flex items-center gap-2">
            <Link
              to={`/incidents/${id}/edit`}
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
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Détails de l'incident
              </h2>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                  statusColors[incident.status] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {statusLabels[incident.status] || incident.status}
              </span>
            </div>
            
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {typeLabels[incident.incident_type] || incident.incident_type}
                  </dd>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <dt className="text-sm font-medium text-gray-500">Site</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {incident.site_name || '—'}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(incident.date).toLocaleDateString('fr-FR', {
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
                  <dt className="text-sm font-medium text-gray-500">Heure</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {incident.time || 'Non précisée'}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldExclamationIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <dt className="text-sm font-medium text-gray-500">Gravité</dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        severityColors[incident.severity] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {severityLabels[incident.severity] || incident.severity}
                    </span>
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Description détaillée</h3>
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {incident.description}
            </p>
          </div>

          {/* Actions taken */}
          {incident.actions_taken && (
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Actions prises</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {incident.actions_taken}
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
                  <p className="text-gray-500">Déclaré le</p>
                  <p className="font-medium text-gray-900">
                    {new Date(incident.created_at).toLocaleDateString('fr-FR', {
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
                    {new Date(incident.updated_at).toLocaleDateString('fr-FR', {
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
