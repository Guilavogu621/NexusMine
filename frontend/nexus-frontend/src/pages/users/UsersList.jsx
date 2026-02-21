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
  SITE_MANAGER: 'Chef de site',
  TECHNICIEN: 'Technicien',
  ANALYST: 'Analyste',
  MMG: 'Autorité MMG',
};

const roleEmojis = {
  ADMIN: '👑',
  SITE_MANAGER: '🏗️',
  TECHNICIEN: '⚙️',
  ANALYST: '📊',
  MMG: '🏛️',
};

const roleConfig = {
  ADMIN: { bg: 'bg-red-100/80', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200', gradient: 'from-red-500 to-red-600' },
  SITE_MANAGER: { bg: 'bg-sky-100/80', text: 'text-sky-700', dot: 'bg-sky-500', border: 'border-sky-200', gradient: 'from-sky-500 to-sky-600' },
  TECHNICIEN: { bg: 'bg-indigo-100/80', text: 'text-indigo-700', dot: 'bg-indigo-500', border: 'border-indigo-200', gradient: 'from-indigo-500 to-indigo-600' },
  ANALYST: { bg: 'bg-emerald-100/80', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200', gradient: 'from-emerald-500 to-emerald-600' },
  MMG: { bg: 'bg-amber-100/80', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200', gradient: 'from-amber-500 to-amber-600' },
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

function UserAvatar({ user, size = 'md' }) {
  const [imgError, setImgError] = useState(false);
  const photoUrl = getPhotoUrl(user);
  const sizeClasses = { sm: 'h-8 w-8 text-xs', md: 'h-12 w-12 text-sm', lg: 'h-16 w-16 text-base' };
  const sz = sizeClasses[size] || sizeClasses.md;
  const rc = roleConfig[user.role] || roleConfig.TECHNICIEN;

  if (photoUrl && !imgError) {
    return (
      <img
        src={photoUrl}
        alt={`${user.first_name} ${user.last_name}`}
        className={`${sz} rounded-lg object-cover ring-2 ring-white shadow-md`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={`${sz} bg-gradient-to-br ${rc.gradient} rounded-lg flex items-center justify-center shadow-md ring-2 ring-white font-bold text-white`}>
      {user.first_name?.[0]}{user.last_name?.[0]}
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

  const clearFilters = () => {
    setSearchQuery('');
    setFilterRole('');
    setFilterActive('');
  };

  const hasActiveFilters = searchQuery || filterRole || filterActive !== '';

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center max-w-md shadow-lg">
          <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <ShieldCheckIcon className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Accès refusé</h3>
          <p className="text-slate-600 mt-3 font-medium">Cette section est réservée aux administrateurs.</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    techniciens: users.filter(u => u.role === 'TECHNICIEN').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 relative">
      {/* Background pattern */}
      <div className="fixed inset-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.05),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(16,185,129,0.05),transparent_50%)]"></div>
      </div>

      <div className="relative space-y-8 pb-12 px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Premium */}
        <div className="group relative bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden animate-fadeInDown">
          {/* SVG Grid */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="usersGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#usersGrid)" />
            </svg>
          </div>

          {/* Animated Orbs */}
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-indigo-400 opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500"></div>

          <div className="relative px-8 py-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div className="flex items-start gap-5">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <UserGroupIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                    Utilisateurs
                  </h1>
                  <p className="mt-2 text-blue-100 font-medium">
                    Gérez les comptes utilisateurs de la plateforme
                  </p>
                </div>
              </div>

              <Link
                to="/users/new"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-white text-indigo-700 rounded-xl font-bold shadow-lg hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-1 transition-all duration-300 flex-shrink-0"
              >
                <PlusIcon className="h-5 w-5" />
                Nouvel utilisateur
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-2">Total</p>
                <p className="text-3xl font-bold text-white font-outfit">{stats.total}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-2">Actifs</p>
                <p className="text-3xl font-bold text-white font-outfit">{stats.active}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-2">Admins</p>
                <p className="text-3xl font-bold text-white font-outfit">{stats.admins}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <p className="text-sm font-semibold text-blue-100 uppercase tracking-wider mb-2">Opérateurs</p>
                <p className="text-3xl font-bold text-white font-outfit">{stats.techniciens}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-lg hover:shadow-xl hover:border-white/40 transition-all duration-500 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FunnelIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <span className="font-bold text-slate-900">Filtres & Recherche</span>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="ml-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    Effacer
                  </button>
                )}
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-slate-100/60 rounded-lg p-1 border border-slate-200/60">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-300 ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm text-indigo-600'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Vue grille"
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-all duration-300 ${
                    viewMode === 'table'
                      ? 'bg-white shadow-sm text-indigo-600'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Vue tableau"
                >
                  <TableCellsIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              {/* Search Bar */}
              <div className="relative group/search">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within/search:text-indigo-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-xl py-3 pl-12 pr-4 text-slate-900 bg-white/50 border border-slate-200/60 placeholder:text-slate-500 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 font-medium"
                />
              </div>

              {/* Selects */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="rounded-xl py-3 px-4 text-slate-900 bg-white/50 border border-slate-200/60 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 font-medium cursor-pointer appearance-none pr-8"
                >
                  <option value="">Tous les rôles</option>
                  {Object.entries(roleLabels).map(([v, l]) => (
                    <option key={v} value={v}>
                      {roleEmojis[v]} {l}
                    </option>
                  ))}
                </select>

                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value)}
                  className="rounded-xl py-3 px-4 text-slate-900 bg-white/50 border border-slate-200/60 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 font-medium cursor-pointer appearance-none pr-8"
                >
                  <option value="">Tous statuts</option>
                  <option value="true">✅ Actifs</option>
                  <option value="false">❌ Inactifs</option>
                </select>

                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-indigo-800 hover:-translate-y-1 transition-all duration-300"
                >
                  Rechercher
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-12 shadow-lg flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-slate-200 animate-spin border-t-indigo-600 border-r-indigo-500"></div>
                <SparklesIcon className="h-8 w-8 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <p className="text-slate-600 font-semibold">Chargement des utilisateurs...</p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-12 shadow-lg flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="p-4 bg-indigo-100 rounded-full mb-6 inline-block">
                <UserGroupIcon className="h-12 w-12 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun utilisateur</h3>
              <p className="text-slate-600 mb-6">Aucun résultat pour vos critères de recherche</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-indigo-700 transition-all duration-300"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInUp">
            {users.map((user, index) => {
              const rc = roleConfig[user.role] || roleConfig.TECHNICIEN;
              return (
                <div
                  key={user.id}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 hover:border-white/40 p-6 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Gradient bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${rc.gradient}`}></div>

                  {/* Hover background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <UserAvatar user={user} size="md" />
                          <span
                            className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-3 border-white ${
                              user.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 truncate">
                            {user.first_name} {user.last_name}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1 truncate">{user.email}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Link
                          to={`/users/${user.id}`}
                          className="p-2 rounded-lg bg-blue-100/80 text-blue-600 hover:bg-blue-200 transition-all duration-200"
                          title="Voir"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/users/${user.id}/edit`}
                          className="p-2 rounded-lg bg-amber-100/80 text-amber-600 hover:bg-amber-200 transition-all duration-200"
                          title="Modifier"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 rounded-lg bg-red-100/80 text-red-600 hover:bg-red-200 transition-all duration-200"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Role Badge */}
                    <div className="mb-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${rc.bg} ${rc.text}`}>
                        <span className="text-lg">{roleEmojis[user.role]}</span>
                        {roleLabels[user.role]}
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-slate-200/60 space-y-3">
                      <button
                        onClick={() => handleToggleActive(user.id, user.is_active)}
                        className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                          user.is_active
                            ? 'bg-emerald-100/80 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {user.is_active ? (
                          <>
                            <CheckCircleIcon className="h-4 w-4" />
                            Actif
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="h-4 w-4" />
                            Inactif
                          </>
                        )}
                      </button>
                      <p className="text-xs text-slate-500 text-center">
                        🕐 {user.last_login
                          ? `Dernière connexion: ${new Date(user.last_login).toLocaleString('fr-FR')}`
                          : 'Jamais connecté'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg overflow-hidden animate-fadeInUp">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/60">
                    <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-wider px-6 py-4">Utilisateur</th>
                    <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-wider px-6 py-4">Rôle</th>
                    <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-wider px-6 py-4">Statut</th>
                    <th className="text-left text-xs font-bold text-slate-700 uppercase tracking-wider px-6 py-4">Dernière connexion</th>
                    <th className="text-right text-xs font-bold text-slate-700 uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => {
                    const rc = roleConfig[user.role] || roleConfig.TECHNICIEN;
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors duration-300">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative flex-shrink-0">
                              <UserAvatar user={user} size="sm" />
                              <span
                                className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                                  user.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">
                                {user.first_name} {user.last_name}
                              </p>
                              <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${rc.bg} ${rc.text}`}>
                            <span className="text-sm">{roleEmojis[user.role]}</span>
                            {roleLabels[user.role]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleActive(user.id, user.is_active)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                              user.is_active
                                ? 'bg-emerald-100/80 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {user.is_active ? (
                              <>
                                <CheckCircleIcon className="h-4 w-4" />
                                Actif
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="h-4 w-4" />
                                Inactif
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-slate-600 font-medium">
                            {user.last_login
                              ? new Date(user.last_login).toLocaleString('fr-FR')
                              : <span className="text-slate-400">Jamais</span>}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/users/${user.id}`}
                              className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                              title="Voir"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/users/${user.id}/edit`}
                              className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                              title="Modifier"
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                              title="Supprimer"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Animations CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

        .font-outfit {
          font-family: 'Outfit', sans-serif;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInDown {
          animation: fadeInDown 0.7s ease-out forwards;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          animation-fill-mode: both;
        }

        /* Select styling */
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'%3E%3C/path%3E%3C/svg%3E");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
        }

        /* Table hover effect */
        tbody tr {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        tbody tr:nth-child(1) { animation-delay: 50ms; }
        tbody tr:nth-child(2) { animation-delay: 100ms; }
        tbody tr:nth-child(3) { animation-delay: 150ms; }
        tbody tr:nth-child(4) { animation-delay: 200ms; }
        tbody tr:nth-child(5) { animation-delay: 250ms; }
      `}</style>
    </div>
  );
}