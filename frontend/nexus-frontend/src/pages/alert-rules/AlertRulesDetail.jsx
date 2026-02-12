import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const alertTypeLabels = {
  THRESHOLD_EXCEEDED: 'Seuil dépassé',
  SAFETY: 'Sécurité',
  MAINTENANCE: 'Maintenance',
  ENVIRONMENTAL: 'Environnement',
  PRODUCTION: 'Production',
  INCIDENT: 'Incident',
  EQUIPMENT: 'Équipement',
  STOCK: 'Stock',
  SYSTEM: 'Système',
};

const severityLabels = {
  LOW: 'Faible',
  MEDIUM: 'Moyen',
  HIGH: 'Élevé',
  CRITICAL: 'Critique',
};

const severityColors = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

export default function AlertRulesDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin, isSupervisor } = useAuthStore();

  const canManage = isAdmin() || isSupervisor();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/alert-rules/${id}/`);
      setData(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette règle ?')) return;
    try {
      await api.delete(`/alert-rules/${id}/`);
      navigate('/alert-rules');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleToggleActive = async () => {
    try {
      await api.patch(`/alert-rules/${id}/`, { is_active: !data.is_active });
      setData({ ...data, is_active: !data.is_active });
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error || 'Règle non trouvée'}</p>
        <Link to="/alert-rules" className="text-indigo-600 hover:underline mt-4 inline-block">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/alert-rules"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Retour aux règles
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <BoltIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{data.name}</h1>
              <p className="text-slate-500">{alertTypeLabels[data.alert_type]}</p>
            </div>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleActive}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                data.is_active
                  ? 'bg-slate-100 text-slate-600 hover:bg-gray-200'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {data.is_active ? (
                <>
                  <XCircleIcon className="h-4 w-4" />
                  Désactiver
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4" />
                  Activer
                </>
              )}
            </button>
            <Link
              to={`/alert-rules/${id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <PencilSquareIcon className="h-4 w-4" />
              Modifier
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
              Supprimer
            </button>
          </div>
        )}
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-3">
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${severityColors[data.severity]}`}>
          Gravité: {severityLabels[data.severity]}
        </span>
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${data.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
          {data.is_active ? '✓ Active' : '✗ Inactive'}
        </span>
      </div>

      {/* Description */}
      {data.description && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Description</h2>
          <p className="text-slate-600">{data.description}</p>
        </div>
      )}

      {/* Conditions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Conditions de déclenchement</h2>
        
        {data.conditions && Object.keys(data.conditions).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(data.conditions).map(([key, condition]) => (
              <div key={key} className="flex items-center gap-3 bg-indigo-50 p-3 rounded-lg">
                <span className="font-medium text-slate-600">{key}</span>
                <span className="text-indigo-600 font-mono">{condition.operator}</span>
                <span className="text-indigo-700 font-bold">{condition.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 italic">Aucune condition définie</p>
        )}
      </div>

      {/* Sites concernés */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <MapPinIcon className="h-5 w-5 text-indigo-600" />
          Sites concernés
        </h2>
        
        {data.sites && data.sites.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.sites.map((site, index) => (
              <span key={index} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                {typeof site === 'object' ? site.name : site}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">🌍 Appliquée à tous les sites</p>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <UserGroupIcon className="h-5 w-5 text-indigo-600" />
          Notifications
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-base font-semibold text-slate-500 mb-2 block">Rôles notifiés</label>
            {data.notify_roles && data.notify_roles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.notify_roles.map((role) => {
                  const roleLabels = {
                    ADMIN: 'Administrateur',
                    SITE_MANAGER: 'Responsable de site',
                    SUPERVISOR: 'Gestionnaire de site',
                    OPERATOR: 'Technicien / Opérateur',
                    ANALYST: 'Analyste',
                    MMG: 'Ministère des Mines',
                  };
                  return (
                    <span key={role} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                      {roleLabels[role] || role}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-500 italic">Aucun rôle configuré</p>
            )}
          </div>

          {data.notify_users && data.notify_users.length > 0 && (
            <div>
              <label className="text-base font-semibold text-slate-500 mb-2 block">Utilisateurs notifiés</label>
              <div className="flex flex-wrap gap-2">
                {data.notify_users.map((user, index) => (
                  <span key={index} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {typeof user === 'object' ? user.email : user}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-base font-semibold text-slate-500">Créée le</label>
            <p className="text-slate-800 mt-1">
              {data.created_at ? new Date(data.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : '-'}
            </p>
          </div>
          <div>
            <label className="text-base font-semibold text-slate-500">Modifiée le</label>
            <p className="text-slate-800 mt-1">
              {data.updated_at ? new Date(data.updated_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
