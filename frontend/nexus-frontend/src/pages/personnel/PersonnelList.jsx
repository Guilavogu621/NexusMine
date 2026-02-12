import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  UsersIcon,
  ChevronDownIcon,
  Squares2X2Icon,
  ListBulletIcon,
  BriefcaseIcon,
  MapPinIcon,
  IdentificationIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
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
  ACTIVE: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  ON_LEAVE: 'bg-amber-100 text-amber-700 ring-amber-600/20',
  INACTIVE: 'bg-slate-100 text-slate-600 ring-gray-600/20',
  TERMINATED: 'bg-red-100 text-red-700 ring-red-600/20',
};

const statusDots = {
  ACTIVE: 'bg-emerald-500',
  ON_LEAVE: 'bg-amber-500',
  INACTIVE: 'bg-gray-500',
  TERMINATED: 'bg-red-500',
};

// Couleurs d'avatar variées
const avatarColors = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-emerald-500 to-emerald-600',
  'from-amber-500 to-amber-600',
  'from-pink-500 to-pink-600',
  'from-cyan-500 to-cyan-600',
  'from-indigo-500 to-indigo-600',
  'from-rose-500 to-rose-600',
];

const getAvatarColor = (id) => avatarColors[id % avatarColors.length];

const approvalLabels = {
  PENDING: 'En attente',
  APPROVED: 'Approuvé',
  REJECTED: 'Refusé',
};

const approvalColors = {
  PENDING: 'bg-yellow-100 text-yellow-700 ring-yellow-600/20',
  APPROVED: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  REJECTED: 'bg-red-100 text-red-700 ring-red-600/20',
};

const approvalDots = {
  PENDING: 'bg-yellow-500',
  APPROVED: 'bg-emerald-500',
  REJECTED: 'bg-red-500',
};

export default function PersonnelList() {
  const [personnel, setPersonnel] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterApproval, setFilterApproval] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const { isSupervisor, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  // Stats calculées
  const stats = {
    total: personnel.length,
    active: personnel.filter(p => p.status === 'ACTIVE').length,
    onLeave: personnel.filter(p => p.status === 'ON_LEAVE').length,
    inactive: personnel.filter(p => p.status === 'INACTIVE').length,
    pending: personnel.filter(p => p.approval_status === 'PENDING').length,
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterStatus) params.append('status', filterStatus);
      if (filterSite) params.append('site', filterSite);
      if (filterApproval) params.append('approval_status', filterApproval);
      
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
  }, [search, filterStatus, filterSite, filterApproval]);

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
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

  const handleApprove = async (id, name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Approuver l'assignation de "${name}" ?`)) return;
    try {
      await api.post(`/personnel/${id}/approve/`);
      fetchData();
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
      alert(error.response?.data?.detail || 'Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (id, name, e) => {
    e.stopPropagation();
    const reason = window.prompt(`Motif du refus pour "${name}" :`);
    if (reason === null) return;
    try {
      await api.post(`/personnel/${id}/reject/`, { reason });
      fetchData();
    } catch (error) {
      console.error('Erreur lors du refus:', error);
      alert(error.response?.data?.detail || 'Erreur lors du refus');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Background subtil */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30"></div>
      
      <div className="space-y-6">
        {/* Premium Header */}
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200/60">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-blue-500/5 to-indigo-500/5 rounded-full translate-y-1/2 -translate-x-1/4"></div>
          
          <div className="relative p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-sm">
                  <div className="absolute inset-0 rounded-2xl bg-white/20"></div>
                  <UsersIcon className="h-7 w-7 text-white relative" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-semibold text-slate-800">Personnel</h1>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700">
                      {personnel.length} employés
                    </span>
                  </div>
                  <p className="mt-1 text-slate-500">Gérez le personnel de vos sites miniers</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex items-center bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-600'}`}
                  >
                    <Squares2X2Icon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-600'}`}
                  >
                    <ListBulletIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {isSupervisor() && (
                  <Link
                    to="/personnel/new"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-2.5 text-base font-semibold text-white shadow-sm"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Nouvel employé
                  </Link>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
              <div className="text-center p-3 rounded-xl bg-gray-50/50 hover:bg-slate-50 transition-colors">
                <p className="text-xl font-semibold text-slate-800">{stats.total}</p>
                <p className="text-base text-slate-500">Total</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 transition-colors">
                <p className="text-xl font-semibold text-emerald-600">{stats.active}</p>
                <p className="text-base text-slate-500">Actifs</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-amber-50/50 hover:bg-amber-50 transition-colors">
                <p className="text-xl font-semibold text-amber-600">{stats.onLeave}</p>
                <p className="text-base text-slate-500">En congé</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-slate-100/50 hover:bg-slate-100 transition-colors">
                <p className="text-xl font-semibold text-slate-500">{stats.inactive}</p>
                <p className="text-base text-slate-500">Inactifs</p>
              </div>
              {isAdmin() && stats.pending > 0 && (
                <div className="text-center p-3 rounded-xl bg-yellow-50/50 hover:bg-yellow-50 transition-colors col-span-2 md:col-span-1">
                  <p className="text-xl font-semibold text-yellow-600">{stats.pending}</p>
                  <p className="text-base text-slate-500">En attente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Premium Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom, poste, matricule..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-0 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Site Filter */}
            <div className="relative">
              <select
                value={filterSite}
                onChange={(e) => setFilterSite(e.target.value)}
                className="appearance-none w-full lg:w-48 pl-4 pr-10 py-3 bg-slate-50 border-0 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                <option value="">Tous les sites</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none w-full lg:w-48 pl-4 pr-10 py-3 bg-slate-50 border-0 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              >
                <option value="">Tous les statuts</option>
                <option value="ACTIVE">Actif</option>
                <option value="ON_LEAVE">En congé</option>
                <option value="INACTIVE">Inactif</option>
                <option value="TERMINATED">Licencié</option>
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>

            {/* Approval Status Filter (ADMIN) */}
            {isAdmin() && (
              <div className="relative">
                <select
                  value={filterApproval}
                  onChange={(e) => setFilterApproval(e.target.value)}
                  className="appearance-none w-full lg:w-48 pl-4 pr-10 py-3 bg-slate-50 border-0 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                >
                  <option value="">Toutes approbations</option>
                  <option value="PENDING">⏳ En attente</option>
                  <option value="APPROVED">✅ Approuvé</option>
                  <option value="REJECTED">❌ Refusé</option>
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-5 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-slate-100 rounded"></div>
                  <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : personnel.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                  <UsersIcon className="h-10 w-10 text-slate-400" />
                </div>
              </div>
              <h3 className="mt-6 text-base font-semibold text-slate-800">Aucun employé trouvé</h3>
              <p className="mt-2 text-base text-slate-500 text-center max-w-sm">
                Commencez par ajouter votre premier employé.
              </p>
              {isSupervisor() && (
                <Link
                  to="/personnel/new"
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl shadow-sm"
                >
                  <PlusIcon className="h-5 w-5" />
                  Ajouter un employé
                </Link>
              )}
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personnel.map((person) => (
              <div
                key={person.id}
                onClick={() => navigate(`/personnel/${person.id}`)}
                className="group relative bg-white rounded-2xl border border-slate-200/60 p-5 hover:shadow-md hover:border-indigo-200 transition-all duration-300 cursor-pointer"
              >
                {/* Hover gradient */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-500/[0.02] group-hover:to-blue-500/[0.02] transition-all"></div>
                
                <div className="relative">
                  {/* Header with Avatar */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`relative w-14 h-14 rounded-full bg-gradient-to-br ${getAvatarColor(person.id)} shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <span className="text-lg font-bold text-white">
                          {person.first_name?.[0]}{person.last_name?.[0]}
                        </span>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${statusDots[person.status] || 'bg-gray-500'}`}></span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 group-hover:text-purple-600 transition-colors">
                          {person.last_name} {person.first_name}
                        </h3>
                        <p className="text-base text-slate-500 mt-0.5">
                          {person.position || 'Non spécifié'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="flex flex-col items-end gap-1">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ring-1 ring-inset ${statusColors[person.status] || 'bg-slate-100 text-slate-600 ring-gray-600/20'}`}>
                        {statusLabels[person.status] || person.status}
                      </span>
                      {person.approval_status && person.approval_status !== 'APPROVED' && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${approvalColors[person.approval_status]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${approvalDots[person.approval_status]}`}></span>
                          {approvalLabels[person.approval_status]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4 pb-4 border-b border-slate-100">
                    {person.employee_id && (
                      <div className="flex items-center gap-2 text-base text-slate-500">
                        <IdentificationIcon className="h-4 w-4" />
                        <span>{person.employee_id}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-base text-slate-500">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{person.site_name || person.site?.name || 'Non assigné'}</span>
                    </div>
                    {person.phone && (
                      <div className="flex items-center gap-2 text-base text-slate-500">
                        <PhoneIcon className="h-4 w-4" />
                        <span>{person.phone}</span>
                      </div>
                    )}
                    {person.email && (
                      <div className="flex items-center gap-2 text-base text-slate-500">
                        <EnvelopeIcon className="h-4 w-4" />
                        <span className="truncate">{person.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      {person.hire_date && (
                        <span>Embauché le {new Date(person.hire_date).toLocaleDateString('fr-FR')}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Approve / Reject buttons for ADMIN */}
                      {isAdmin() && person.approval_status === 'PENDING' && (
                        <>
                          <button
                            onClick={(e) => handleApprove(person.id, `${person.last_name} ${person.first_name}`, e)}
                            className="p-2 rounded-lg text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Approuver"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(e) => handleReject(person.id, `${person.last_name} ${person.first_name}`, e)}
                            className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Refuser"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/personnel/${person.id}`);
                        }}
                        className="p-2 rounded-lg text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Voir"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {isSupervisor() && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/personnel/${person.id}/edit`);
                            }}
                            className="p-2 rounded-lg text-indigo-500 hover:text-blue-700 hover:bg-indigo-50 transition-colors"
                            title="Modifier"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(person.id, `${person.last_name} ${person.first_name}`, e)}
                            className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Employé
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Poste
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Site
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Approbation
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {personnel.map((person) => (
                    <tr 
                      key={person.id} 
                      onClick={() => navigate(`/personnel/${person.id}`)}
                      className="hover:bg-indigo-50/30 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(person.id)} shadow-md flex items-center justify-center`}>
                            <span className="text-base font-bold text-white">
                              {person.first_name?.[0]}{person.last_name?.[0]}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-slate-800">
                              {person.last_name} {person.first_name}
                            </div>
                            <div className="text-base text-slate-500">
                              {person.employee_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-base text-slate-800">
                          <BriefcaseIcon className="h-4 w-4 text-slate-400" />
                          {person.position || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-base text-slate-500">
                          <MapPinIcon className="h-4 w-4" />
                          {person.site_name || person.site?.name || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {person.phone && (
                            <div className="flex items-center text-base text-slate-500">
                              <PhoneIcon className="h-4 w-4 mr-1.5" />
                              {person.phone}
                            </div>
                          )}
                          {person.email && (
                            <div className="flex items-center text-base text-slate-500">
                              <EnvelopeIcon className="h-4 w-4 mr-1.5" />
                              <span className="truncate max-w-[150px]">{person.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ring-1 ring-inset ${statusColors[person.status] || 'bg-slate-100 text-slate-600 ring-gray-600/20'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDots[person.status] || 'bg-gray-500'}`}></span>
                          {statusLabels[person.status] || person.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ring-1 ring-inset ${approvalColors[person.approval_status] || approvalColors.PENDING}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${approvalDots[person.approval_status] || approvalDots.PENDING}`}></span>
                            {approvalLabels[person.approval_status] || 'En attente'}
                          </span>
                          {isAdmin() && person.approval_status === 'PENDING' && (
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => handleApprove(person.id, `${person.last_name} ${person.first_name}`, e)}
                                className="p-1.5 rounded-lg text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                                title="Approuver"
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={(e) => handleReject(person.id, `${person.last_name} ${person.first_name}`, e)}
                                className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Refuser"
                              >
                                <XCircleIcon className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/personnel/${person.id}`);
                            }}
                            className="p-2 rounded-lg text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Voir"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          {isSupervisor() && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/personnel/${person.id}/edit`);
                                }}
                                className="p-2 rounded-lg text-indigo-500 hover:text-blue-700 hover:bg-indigo-50 transition-colors"
                                title="Modifier"
                              >
                                <PencilSquareIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(person.id, `${person.last_name} ${person.first_name}`, e)}
                                className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
          </div>
        )}
      </div>
    </div>
  );
}
