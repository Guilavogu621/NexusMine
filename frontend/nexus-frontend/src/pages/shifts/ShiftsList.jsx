import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  SunIcon,
  MoonIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const shiftTypeLabels = {
  DAY: 'Jour (6h-18h)',
  NIGHT: 'Nuit (18h-6h)',
  MORNING: 'Matin (6h-14h)',
  AFTERNOON: 'Après-midi (14h-22h)',
  EVENING: 'Soir (22h-6h)',
};

const shiftTypeIcons = {
  DAY: '☀️',
  NIGHT: '🌙',
  MORNING: '🌅',
  AFTERNOON: '🌤️',
  EVENING: '🌆',
};

const shiftTypeColors = {
  DAY: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
  NIGHT: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  MORNING: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  AFTERNOON: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-indigo-200' },
  EVENING: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
};

export default function ShiftsList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterShiftType, setFilterShiftType] = useState('');
  const [filterDate, setFilterDate] = useState('');
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
      const response = await api.get('/shifts/');
      setData(response.data.results || response.data);
    } catch (err) {
      setError('Erreur lors du chargement des rotations');
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
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette rotation ?')) return;
    try {
      await api.delete(`/shifts/${id}/`);
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
    const matchesSearch = item.supervisor_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSite = !filterSite || item.site === parseInt(filterSite);
    const matchesShiftType = !filterShiftType || item.shift_type === filterShiftType;
    const matchesDate = !filterDate || item.date === filterDate;
    return matchesSearch && matchesSite && matchesShiftType && matchesDate;
  });

  // Stats
  const today = new Date().toISOString().split('T')[0];
  const stats = {
    total: data.length,
    today: data.filter(d => d.date === today).length,
    day: data.filter(d => d.shift_type === 'DAY').length,
    night: data.filter(d => d.shift_type === 'NIGHT').length,
  };

  // Group by date for calendar view
  const groupedByDate = filteredData.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <ClockIcon className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-semibold">Rotations / Shifts</h1>
            </div>
            <p className="text-amber-100">Planification des équipes et des postes de travail</p>
          </div>
          
          {canManage && (
            <Link
              to="/shifts/new"
              className="inline-flex items-center gap-2 bg-white text-amber-700 px-6 py-3 rounded-xl font-semibold hover:bg-amber-50 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <PlusIcon className="h-5 w-5" />
              Nouvelle rotation
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/60">
          <div className="text-xl font-semibold text-slate-800">{stats.total}</div>
          <div className="text-base text-slate-500">Total rotations</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-100">
          <div className="text-xl font-semibold text-amber-600">{stats.today}</div>
          <div className="text-base text-slate-500">Aujourd'hui</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-yellow-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">☀️</span>
            <span className="text-xl font-semibold text-yellow-600">{stats.day}</span>
          </div>
          <div className="text-base text-slate-500">Équipes jour</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌙</span>
            <span className="text-xl font-semibold text-indigo-600">{stats.night}</span>
          </div>
          <div className="text-base text-slate-500">Équipes nuit</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par superviseur ou notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200/60 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2.5 border border-slate-200/60 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
            <select
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className="px-4 py-2.5 border border-slate-200/60 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Tous les sites</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
            <select
              value={filterShiftType}
              onChange={(e) => setFilterShiftType(e.target.value)}
              className="px-4 py-2.5 border border-slate-200/60 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Tous les types</option>
              {Object.entries(shiftTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
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

      {/* List grouped by date */}
      <div className="space-y-6">
        {Object.keys(groupedByDate).length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <ClockIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800">Aucune rotation trouvée</h3>
            <p className="text-slate-500 mt-1">Planifiez une rotation pour commencer</p>
          </div>
        ) : (
          Object.entries(groupedByDate)
            .sort(([a], [b]) => new Date(b) - new Date(a))
            .map(([date, shifts]) => (
              <div key={date} className="space-y-3">
                <div className="flex items-center gap-3">
                  <CalendarDaysIcon className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold text-slate-800">
                    {new Date(date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </h3>
                  <span className="text-sm text-slate-500">({shifts.length} rotation{shifts.length > 1 ? 's' : ''})</span>
                </div>
                
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {shifts.map((item) => {
                    const typeStyle = shiftTypeColors[item.shift_type] || shiftTypeColors.DAY;
                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-all ${typeStyle.border}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${typeStyle.bg} ${typeStyle.text}`}>
                            <span>{shiftTypeIcons[item.shift_type]}</span>
                            {shiftTypeLabels[item.shift_type]}
                          </span>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-base text-slate-500">
                            <span className="text-slate-400">📍</span>
                            {getSiteName(item.site)}
                          </div>
                          {item.supervisor_name && (
                            <div className="flex items-center gap-2 text-base text-slate-500">
                              <UserGroupIcon className="h-4 w-4 text-slate-400" />
                              Superviseur: {item.supervisor_name}
                            </div>
                          )}
                          {item.personnel_count !== undefined && (
                            <div className="flex items-center gap-2 text-base text-slate-500">
                              <span className="text-slate-400">👷</span>
                              {item.personnel_count} personnel
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                          <Link
                            to={`/shifts/${item.id}`}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Voir"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          {canManage && (
                            <>
                              <Link
                                to={`/shifts/${item.id}/edit`}
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
                    );
                  })}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
