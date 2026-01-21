import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const statusLabels = {
  OPERATIONAL: 'Opérationnel',
  MAINTENANCE: 'En maintenance',
  REPAIR: 'En réparation',
  OUT_OF_SERVICE: 'Hors service',
};

const statusColors = {
  OPERATIONAL: 'bg-green-100 text-green-800',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800',
  REPAIR: 'bg-orange-100 text-orange-800',
  OUT_OF_SERVICE: 'bg-red-100 text-red-800',
};

const typeLabels = {
  EXCAVATOR: 'Excavatrice',
  TRUCK: 'Camion',
  LOADER: 'Chargeuse',
  DRILL: 'Foreuse',
  CRUSHER: 'Concasseur',
  CONVEYOR: 'Convoyeur',
  PUMP: 'Pompe',
  GENERATOR: 'Générateur',
  VEHICLE: 'Véhicule',
  OTHER: 'Autre',
};

export default function EquipmentList() {
  const [equipment, setEquipment] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const { isSupervisor } = useAuthStore();

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterStatus) params.append('status', filterStatus);
      if (filterType) params.append('equipment_type', filterType);
      if (filterSite) params.append('site', filterSite);
      
      const [equipmentRes, sitesRes] = await Promise.all([
        api.get(`/equipment/?${params.toString()}`),
        api.get('/sites/'),
      ]);
      
      setEquipment(equipmentRes.data.results || equipmentRes.data);
      setSites(sitesRes.data.results || sitesRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterType, filterSite]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) {
      return;
    }
    try {
      await api.delete(`/equipment/${id}/`);
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
          <h1 className="text-2xl font-bold text-gray-900">Équipements</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les équipements de vos sites miniers
          </p>
        </div>
        {isSupervisor() && (
          <Link
            to="/equipment/new"
            className="inline-flex items-center justify-center rounded-lg bg-yellow-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouvel équipement
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
              placeholder="Rechercher un équipement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-yellow-600 sm:text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className="rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-yellow-600 sm:text-sm"
            >
              <option value="">Tous les sites</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-yellow-600 sm:text-sm"
            >
              <option value="">Tous types</option>
              {Object.entries(typeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-yellow-600 sm:text-sm"
            >
              <option value="">Tous statuts</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-yellow-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-yellow-500 transition-colors"
            >
              Rechercher
            </button>
          </div>
        </form>
      </div>

      {/* Equipment grid */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
          </div>
        ) : equipment.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <WrenchScrewdriverIcon className="h-12 w-12 mb-4" />
            <p>Aucun équipement trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {equipment.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[item.status]}`}>
                      {statusLabels[item.status]}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {typeLabels[item.equipment_type] || item.equipment_type}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Link
                      to={`/equipment/${item.id}`}
                      className="p-1 rounded text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                    {isSupervisor() && (
                      <>
                        <Link
                          to={`/equipment/${item.id}/edit`}
                          className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{item.serial_number}</p>
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-400">
                  <p>{item.site_name}</p>
                  {item.last_maintenance && (
                    <p className="mt-1">
                      Dernière maintenance: {new Date(item.last_maintenance).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
