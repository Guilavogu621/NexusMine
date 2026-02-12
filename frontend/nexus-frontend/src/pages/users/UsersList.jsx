import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  FunnelIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  TableCellsIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const roleLabels = {
  ADMIN: 'Administrateur',
  SITE_MANAGER: 'Responsable de site',
  SUPERVISOR: 'Gestionnaire de Site',
  OPERATOR: 'Technicien/Opérateur',
  ANALYST: 'Analyste',
  MMG: 'Autorité (MMG)',
};

const roleEmojis = {
  ADMIN: '👑',
  SITE_MANAGER: '🏗️',
  SUPERVISOR: '🎯',
  OPERATOR: '⚙️',
  ANALYST: '📊',
  MMG: '🏛️',
};

const roleConfig = {
  ADMIN: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200' },
  SITE_MANAGER: { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500', border: 'border-sky-200' },
  SUPERVISOR: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', border: 'border-purple-200' },
  OPERATOR: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500', border: 'border-indigo-200' },
  ANALYST: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  MMG: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/** Resolve profile photo URL to absolute */
function getPhotoUrl(user) {
  if (user.profile_photo_url) {
    if (user.profile_photo_url.startsWith('http')) return user.profile_photo_url;
    return `${API_BASE}${user.profile_photo_url}`;
  }
  if (user.profile_photo) {
    if (user.profile_photo.startsWith('http')) return user.profile_photo;
    return `${API_BASE}/media/${user.profile_photo}`;
  }
  return null;
}

/** Avatar component with photo fallback */
function UserAvatar({ user, size = 'md' }) {
  const [imgError, setImgError] = useState(false);
  const photoUrl = getPhotoUrl(user);
  const sizeClasses = { sm: 'h-9 w-9 text-xs', md: 'h-11 w-11 text-sm', lg: 'h-14 w-14 text-base' };
  const sz = sizeClasses[size] || sizeClasses.md;

  if (photoUrl && !imgError) {
    return (
      <img
        src={photoUrl}
        alt={`${user.first_name} ${user.last_name}`}
        className={`${sz} rounded-xl object-cover ring-2 ring-white`}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div className={`${sz} bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm`}>
      <span className="font-bold text-white">{user.first_name?.[0]}{user.last_name?.[0]}</span>
    </div>
  );
}

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const { isAdmin } = useAuthStore();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterRole) params.append('role', filterRole);
      if (filterActive !== '') params.append('is_active', filterActive);
      
      const response = await api.get(`/users/?${params.toString()}`);
      setUsers(response.data.results || response.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterRole, filterActive]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await api.patch(`/users/${id}/`, { is_active: !currentStatus });
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la modification');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    try {
      await api.delete(`/users/${id}/`);
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const clearFilters = () => { setSearchQuery(''); setFilterRole(''); setFilterActive(''); };
  const hasActiveFilters = searchQuery || filterRole || filterActive !== '';

  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md">
          <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <ShieldCheckIcon className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-base font-semibold text-red-800">Accès refusé</h3>
          <p className="text-red-600 mt-2">Cette section est réservée aux administrateurs.</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    operators: users.filter(u => u.role === 'OPERATOR').length,
  };

  return (
    <div className="space-y-5 pb-8">
      {/* ─── Header + Stats ─── */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
        <div className="px-6 py-5 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 rounded-xl">
                <UserGroupIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Utilisateurs</h1>
                <p className="text-sm text-slate-500">Gérez les comptes utilisateurs de la plateforme</p>
              </div>
            </div>
            <Link
              to="/users/new"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-sm hover:bg-indigo-700 transition-all"
            >
              <PlusIcon className="h-5 w-5" />
              Nouvel utilisateur
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{stats.total}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-100">
              <p className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider">Actifs</p>
              <p className="text-2xl font-bold text-emerald-700 mt-0.5">{stats.active}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3.5 border border-red-100">
              <p className="text-[11px] font-medium text-red-500 uppercase tracking-wider">Admins</p>
              <p className="text-2xl font-bold text-red-700 mt-0.5">{stats.admins}</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-3.5 border border-indigo-100">
              <p className="text-[11px] font-medium text-indigo-500 uppercase tracking-wider">Opérateurs</p>
              <p className="text-2xl font-bold text-indigo-700 mt-0.5">{stats.operators}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Filters + View Toggle ─── */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-4 w-4 text-slate-400" />
            <span className="font-semibold text-sm text-slate-700">Filtres</span>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition-colors">
                <XMarkIcon className="h-3 w-3" /> Effacer
              </button>
            )}
          </div>
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`} title="Vue grille">
              <Squares2X2Icon className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`} title="Vue tableau">
              <TableCellsIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Rechercher par nom ou email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-4 text-sm text-slate-800 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-medium" />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
              className="rounded-xl border-0 py-2.5 px-3 text-sm text-slate-700 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-medium">
              <option value="">Tous les rôles</option>
              {Object.entries(roleLabels).map(([v, l]) => <option key={v} value={v}>{roleEmojis[v]} {l}</option>)}
            </select>
            <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)}
              className="rounded-xl border-0 py-2.5 px-3 text-sm text-slate-700 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-500 bg-slate-50 font-medium">
              <option value="">Tous statuts</option>
              <option value="true">✅ Actifs</option>
              <option value="false">❌ Inactifs</option>
            </select>
            <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition-all">
              Rechercher
            </button>
          </div>
        </form>
      </div>

      {/* ─── Content ─── */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="relative">
                <div className="w-10 h-10 border-3 border-slate-200 rounded-full animate-spin border-t-indigo-600 mx-auto"></div>
                <SparklesIcon className="h-4 w-4 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="mt-3 text-sm text-slate-500 font-medium">Chargement...</p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="p-4 bg-slate-50 rounded-full mb-4">
              <UserGroupIcon className="h-12 w-12 text-slate-300" />
            </div>
            <p className="text-lg font-semibold text-slate-700">Aucun utilisateur</p>
            <p className="text-sm text-slate-400 mt-1">Aucun résultat pour vos critères</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium">Effacer les filtres</button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* ── Grid View ── */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
            {users.map((user) => {
              const rc = roleConfig[user.role] || roleConfig.OPERATOR;
              return (
                <div key={user.id} className="group bg-white rounded-xl p-4 hover:shadow-md transition-all border border-slate-200/80 hover:border-indigo-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <UserAvatar user={user} size="md" />
                        <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${user.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-slate-800 truncate">{user.first_name} {user.last_name}</h3>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/users/${user.id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"><EyeIcon className="h-3.5 w-3.5" /></Link>
                      <Link to={`/users/${user.id}/edit`} clasName="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"><PencilSquareIcon className="h-3.5 w-3.5" /></Link>
                      <button onClick={() => handleDelete(user.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"><TrashIcon className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${rc.bg} ${rc.text}`}>
                      <span className="text-[10px]">{roleEmojis[user.role]}</span>
                      {roleLabels[user.role]}
                    </span>
                    <button onClick={() => handleToggleActive(user.id, user.is_active)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium transition-all ${user.is_active ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                      {user.is_active ? <><CheckCircleIcon className="h-3 w-3" /> Actif</> : <><XCircleIcon className="h-3 w-3" /> Inactif</>}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    🕐 {user.last_login ? `Connexion: ${new Date(user.last_login).toLocaleString('fr-FR')}` : 'Jamais connecté'}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── Table View ── */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Utilisateur</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Rôle</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Statut</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Dernière connexion</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const rc = roleConfig[user.role] || roleConfig.OPERATOR;
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <UserAvatar user={user} size="sm" />
                            <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${user.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{user.first_name} {user.last_name}</p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${rc.bg} ${rc.text}`}>
                          {roleEmojis[user.role]} {roleLabels[user.role]}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button onClick={() => handleToggleActive(user.id, user.is_active)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${user.is_active ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                          {user.is_active ? <><CheckCircleIcon className="h-3.5 w-3.5" /> Actif</> : <><XCircleIcon className="h-3.5 w-3.5" /> Inactif</>}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500">
                        {user.last_login ? new Date(user.last_login).toLocaleString('fr-FR') : <span className="text-slate-300">Jamais</span>}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/users/${user.id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all" title="Voir"><EyeIcon className="h-4 w-4" /></Link>
                          <Link to={`/users/${user.id}/edit`} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all" title="Modifier"><PencilSquareIcon className="h-4 w-4" /></Link>
                          <button onClick={() => handleDelete(user.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Supprimer"><TrashIcon className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
