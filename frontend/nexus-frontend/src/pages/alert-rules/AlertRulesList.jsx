import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  PauseIcon,
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

const alertTypeColors = {
  THRESHOLD_EXCEEDED: { bg: 'bg-red-100', text: 'text-red-700', icon: '📊' },
  SAFETY: { bg: 'bg-orange-100', text: 'text-orange-700', icon: '⚠️' },
  MAINTENANCE: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '🔧' },
  ENVIRONMENTAL: { bg: 'bg-green-100', text: 'text-green-700', icon: '🌿' },
  PRODUCTION: { bg: 'bg-purple-100', text: 'text-purple-700', icon: '⛏️' },
  INCIDENT: { bg: 'bg-red-100', text: 'text-red-700', icon: '🚨' },
  EQUIPMENT: { bg: 'bg-cyan-100', text: 'text-cyan-700', icon: '🏗️' },
  STOCK: { bg: 'bg-amber-100', text: 'text-amber-700', icon: '📦' },
  SYSTEM: { bg: 'bg-slate-100', text: 'text-slate-600', icon: '⚙️' },
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

export default function AlertRulesList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const { isAdmin, isSupervisor } = useAuthStore();

  const canManage = isAdmin() || isSupervisor();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/alert-rules/');
      setData(response.data.results || response.data);
    } catch (err) {
      setError('Erreur lors du chargement des règles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette règle ?')) return;
    try {
      await api.delete(`/alert-rules/${id}/`);
      setData(data.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await api.patch(`/alert-rules/${item.id}/`, { is_active: !item.is_active });
      setData(data.map(d => d.id === item.id ? { ...d, is_active: !d.is_active } : d));
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
    }
  };

  const filteredData = data.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || item.alert_type === filterType;
    const matchesActive = filterActive === '' || (filterActive === 'true' ? item.is_active : !item.is_active);
    return matchesSearch && matchesType && matchesActive;
  });

  // Stats
  const stats = {
    total: data.length,
    active: data.filter(d => d.is_active).length,
    inactive: data.filter(d => !d.is_active).length,
    critical: data.filter(d => d.severity === 'CRITICAL').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <BoltIcon className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-semibold">Règles d'Alerte</h1>
            </div>
            <p className="text-indigo-100">Configuration des règles de génération automatique d'alertes</p>
          </div>
          
          {canManage && (
            <Link
              to="/alert-rules/new"
              className="inline-flex items-center gap-2 bg-white text-indigo-700 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <PlusIcon className="h-5 w-5" />
              Nouvelle règle
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/60">
          <div className="text-xl font-semibold text-slate-800">{stats.total}</div>
          <div className="text-base text-slate-500">Total règles</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
          <div className="text-xl font-semibold text-green-600">{stats.active}</div>
          <div className="text-base text-slate-500">Actives</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/60">
          <div className="text-xl font-semibold text-slate-400">{stats.inactive}</div>
          <div className="text-base text-slate-500">Inactives</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-red-100">
          <div className="text-xl font-semibold text-red-600">{stats.critical}</div>
          <div className="text-base text-slate-500">Critiques</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une règle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200/60 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 border border-slate-200/60 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tous les types</option>
              {Object.entries(alertTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="px-4 py-2.5 border border-slate-200/60 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tous les statuts</option>
              <option value="true">Actives</option>
              <option value="false">Inactives</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-2">
          <ExclamationTriangleIcon className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* List */}
      <div className="grid gap-4">
        {filteredData.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <BoltIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800">Aucune règle trouvée</h3>
            <p className="text-slate-500 mt-1">Créez une règle pour automatiser les alertes</p>
          </div>
        ) : (
          filteredData.map((item) => {
            const typeStyle = alertTypeColors[item.alert_type] || alertTypeColors.SYSTEM;
            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-all ${item.is_active ? 'border-slate-100' : 'border-slate-200/60 opacity-60'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{typeStyle.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="font-semibold text-slate-800">{item.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-sm font-medium ${typeStyle.bg} ${typeStyle.text}`}>
                          {alertTypeLabels[item.alert_type]}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-sm font-medium ${severityColors[item.severity]}`}>
                          {severityLabels[item.severity]}
                        </span>
                        {item.is_active ? (
                          <span className="px-2 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-700 flex items-center gap-1">
                            <CheckCircleIcon className="h-3 w-3" /> Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-sm font-medium bg-slate-100 text-slate-500 flex items-center gap-1">
                            <XCircleIcon className="h-3 w-3" /> Inactive
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-base text-slate-500 mt-1">{item.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.notify_roles && item.notify_roles.length > 0 && (
                          <span className="text-sm text-slate-500">
                            Notifie: {item.notify_roles.map(r => ({
                              ADMIN: 'Admin',
                              SITE_MANAGER: 'Resp. site',
                              SUPERVISOR: 'Gestionnaire',
                              OPERATOR: 'Opérateur',
                              ANALYST: 'Analyste',
                              MMG: 'MMG',
                            })[r] || r).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {canManage && (
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`p-2 rounded-lg transition-colors ${
                          item.is_active 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-slate-400 hover:bg-slate-100'
                        }`}
                        title={item.is_active ? 'Désactiver' : 'Activer'}
                      >
                        {item.is_active ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                      </button>
                    )}
                    <Link
                      to={`/alert-rules/${item.id}`}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Voir"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Link>
                    {canManage && (
                      <>
                        <Link
                          to={`/alert-rules/${item.id}/edit`}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
