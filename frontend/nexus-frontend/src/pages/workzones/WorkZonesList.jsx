import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  MapIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

export default function WorkZonesList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [sites, setSites] = useState([]);
  const { isAdmin, isSupervisor } = useAuthStore();

  const canManage = isAdmin() || isSupervisor();

  useEffect(() => {
    fetchData();
    fetchSites();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/work-zones/');
      setData(response.data.results || response.data);
    } catch (err) {
      setError('Erreur lors du chargement des zones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      const response = await api.get('/sites/');
      setSites(response.data.results || response.data);
    } catch (err) {
      console.error('Erreur chargement sites:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette zone ?')) return;
    try {
      await api.delete(`/work-zones/${id}/`);
      setData(data.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const getSiteName = (siteId) => {
    const site = sites.find(s => s.id === siteId);
    return site ? site.name : 'N/A';
  };

  const filteredData = data.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSite = !filterSite || item.site === parseInt(filterSite);
    const matchesActive = filterActive === '' || (filterActive === 'true' ? item.is_active : !item.is_active);
    return matchesSearch && matchesSite && matchesActive;
  });

  // Stats
  const stats = {
    total: data.length,
    active: data.filter(d => d.is_active).length,
    inactive: data.filter(d => !d.is_active).length,
    withGPS: data.filter(d => d.gps_latitude && d.gps_longitude).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <MapIcon className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-semibold">Zones de Travail</h1>
            </div>
            <p className="text-emerald-100">Gestion des zones d'opération au sein des sites miniers</p>
          </div>
          
          {canManage && (
            <Link
              to="/workzones/new"
              className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <PlusIcon className="h-5 w-5" />
              Nouvelle zone
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/60">
          <div className="text-xl font-semibold text-slate-800">{stats.total}</div>
          <div className="text-base text-slate-500">Total zones</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
          <div className="text-xl font-semibold text-green-600">{stats.active}</div>
          <div className="text-base text-slate-500">Actives</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/60">
          <div className="text-xl font-semibold text-slate-400">{stats.inactive}</div>
          <div className="text-base text-slate-500">Inactives</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
          <div className="text-xl font-semibold text-indigo-600">{stats.withGPS}</div>
          <div className="text-base text-slate-500">Géolocalisées</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200/60 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className="px-4 py-2.5 border border-slate-200/60 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tous les sites</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>{site.name}</option>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredData.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 bg-white rounded-xl p-12 text-center">
            <MapIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800">Aucune zone trouvée</h3>
            <p className="text-slate-500 mt-1">Créez une zone de travail pour commencer</p>
          </div>
        ) : (
          filteredData.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-all ${item.is_active ? 'border-slate-100' : 'border-slate-200/60 opacity-60'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-sm font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                    {item.code}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-sm font-medium ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {item.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <h3 className="font-semibold text-slate-800 text-lg mb-2">{item.name}</h3>
              
              <div className="flex items-center gap-2 text-base text-slate-500 mb-3">
                <MapPinIcon className="h-4 w-4" />
                {getSiteName(item.site)}
              </div>

              {item.gps_latitude && item.gps_longitude && (
                <div className="text-sm text-slate-400 mb-3">
                  📍 {parseFloat(item.gps_latitude).toFixed(5)}, {parseFloat(item.gps_longitude).toFixed(5)}
                </div>
              )}

              {item.description && (
                <p className="text-base text-slate-500 mb-4 line-clamp-2">{item.description}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Link
                  to={`/workzones/${item.id}`}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Voir"
                >
                  <EyeIcon className="h-5 w-5" />
                </Link>
                {canManage && (
                  <>
                    <Link
                      to={`/workzones/${item.id}/edit`}
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
          ))
        )}
      </div>
    </div>
  );
}
