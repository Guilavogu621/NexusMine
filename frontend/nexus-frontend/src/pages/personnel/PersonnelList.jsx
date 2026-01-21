import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const statusLabels = {
  ACTIVE: 'Actif',
  ON_LEAVE: 'En congé',
  INACTIVE: 'Inactif',
  TERMINATED: 'Licencié',
};

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800',
  ON_LEAVE: 'bg-yellow-100 text-yellow-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  TERMINATED: 'bg-red-100 text-red-800',
};

export default function PersonnelList() {
  const [personnel, setPersonnel] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const { isSupervisor } = useAuthStore();

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterStatus) params.append('status', filterStatus);
      if (filterSite) params.append('site', filterSite);
      
      const [personnelRes, sitesRes] = await Promise.all([
        api.get(`/personnel/?${params.toString()}`),
        api.get('/sites/'),
      ]);
      
      setPersonnel(personnelRes.data.results || personnelRes.data);
      setSites(sitesRes.data.results || sitesRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, filterStatus, filterSite]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) {
      return;
    }
    try {
      await api.delete(`/personnel/${id}/`);
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
          <h1 className="text-2xl font-bold text-gray-900">Personnel</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez le personnel de vos sites miniers
          </p>
        </div>
        {isSupervisor() && (
          <Link
            to="/personnel/new"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouvel employé
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un employé..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
            />
          </div>

          {/* Filter by site */}
          <select
            value={filterSite}
            onChange={(e) => setFilterSite(e.target.value)}
            className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
          >
            <option value="">Tous les sites</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </select>

          {/* Filter by status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="ACTIVE">Actif</option>
            <option value="ON_LEAVE">En congé</option>
            <option value="INACTIVE">Inactif</option>
            <option value="TERMINATED">Licencié</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : personnel.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <UserIcon className="h-12 w-12 mb-4" />
            <p>Aucun employé trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Poste
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {personnel.map((person) => (
                  <tr key={person.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {person.first_name?.[0]}{person.last_name?.[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {person.last_name} {person.first_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {person.employee_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {person.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {person.site_name || person.site?.name || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {person.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <PhoneIcon className="h-4 w-4 mr-1" />
                            {person.phone}
                          </div>
                        )}
                        {person.email && (
                          <div className="flex items-center text-sm text-gray-500">
                            <EnvelopeIcon className="h-4 w-4 mr-1" />
                            {person.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusColors[person.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {statusLabels[person.status] || person.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/personnel/${person.id}`}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Voir"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        {isSupervisor() && (
                          <>
                            <Link
                              to={`/personnel/${person.id}/edit`}
                              className="text-gray-400 hover:text-yellow-600 transition-colors"
                              title="Modifier"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(person.id, `${person.last_name} ${person.first_name}`)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              title="Supprimer"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
