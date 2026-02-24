import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  WrenchScrewdriverIcon,
  ChevronDownIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CogIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  WrenchIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const statusLabels = {
  OPERATIONAL: 'Opérationnel',
  MAINTENANCE: 'En maintenance',
  BREAKDOWN: 'En panne',
  RETIRED: 'Hors service',
};

const statusColors = {
  OPERATIONAL: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  MAINTENANCE: 'bg-amber-100 text-amber-700 ring-amber-600/20',
  BREAKDOWN: 'bg-orange-100 text-orange-700 ring-orange-600/20',
  RETIRED: 'bg-red-100 text-red-700 ring-red-600/20',
};

const statusDots = {
  OPERATIONAL: 'bg-emerald-500',
  MAINTENANCE: 'bg-amber-500',
  BREAKDOWN: 'bg-orange-500',
  RETIRED: 'bg-red-500',
};

const typeLabels = {
  EXCAVATOR: 'Pelle excavatrice',
  TRUCK: 'Camion',
  LOADER: 'Chargeuse',
  DRILL: 'Foreuse',
  CRUSHER: 'Concasseur',
  CONVEYOR: 'Convoyeur',
  PUMP: 'Pompe',
  GENERATOR: 'Générateur',
  OTHER: 'Autre',
};

const typeEmojis = {
  EXCAVATOR: '🚜',
  TRUCK: '🚛',
  LOADER: '🏗️',
  DRILL: '🔩',
  CRUSHER: '⚙️',
  CONVEYOR: '🏭',
  PUMP: '💧',
  GENERATOR: '⚡',
  OTHER: '🔧',
};

const typeColors = {
  EXCAVATOR: 'from-amber-500 to-amber-600',
  TRUCK: 'from-blue-500 to-blue-600',
  LOADER: 'from-orange-500 to-orange-600',
  DRILL: 'from-purple-500 to-purple-600',
  CRUSHER: 'from-gray-500 to-gray-600',
  CONVEYOR: 'from-cyan-500 to-cyan-600',
  PUMP: 'from-sky-500 to-sky-600',
  GENERATOR: 'from-yellow-500 to-yellow-600',
  OTHER: 'from-slate-500 to-slate-600',
};

export default function EquipmentList() {
  const [equipment, setEquipment] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const { isAdmin, isSiteManager, isAnalyst, isMMG, isTechnicien } = useAuthStore();
  const navigate = useNavigate();

  const canEdit = isAdmin() || isSiteManager() || isAnalyst() || isTechnicien();

  const stats = {
    total: equipment.length,
    operational: equipment.filter(e => e.status === 'OPERATIONAL').length,
    maintenance: equipment.filter(e => e.status === 'MAINTENANCE').length,
    breakdown: equipment.filter(e => e.status === 'BREAKDOWN').length,
  };

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
  }, [filterStatus, filterType, filterSite, searchQuery]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) return;
    try {
      await api.delete(`/equipment/${id}/`);
      fetchData();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <div className="max-w-7xl mx-auto px-4 pt-8 space-y-6">

        {/* ── HEADER PREMIUM AZURE (Design Capture) ── */}
        <div className="relative overflow-hidden rounded-[35px] bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-xl animate-fadeInDown">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          <div className="relative p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white/20 backdrop-blur-md rounded-[24px] shadow-lg">
                <WrenchScrewdriverIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Gestion Parc Matériel</h1>
                <p className="text-blue-100 font-medium opacity-90">Supervisez l'état et la disponibilité de vos actifs miniers</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-white hover:bg-white/10'}`}>
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-white hover:bg-white/10'}`}>
                  <ListBulletIcon className="h-5 w-5" />
                </button>
              </div>
              {canEdit && (
                <Link to="/equipment/new" className="px-6 py-3 bg-white text-blue-700 rounded-2xl font-black shadow-lg hover:scale-105 transition-all flex items-center gap-2">
                  <PlusIcon className="h-5 w-5" /> Nouveau
                </Link>
              )}
            </div>
          </div>

          {/* Quick Stats Overlay Header */}
          <div className="relative px-8 pb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickStat label="Total" value={stats.total} color="bg-white/10" />
            <QuickStat label="Opérationnels" value={stats.operational} color="bg-emerald-500/20" dot="bg-emerald-400" />
            <QuickStat label="Maintenance" value={stats.maintenance} color="bg-amber-500/20" dot="bg-amber-400" />
            <QuickStat label="En Panne" value={stats.breakdown} color="bg-red-500/20" dot="bg-red-400" />
          </div>
        </div>

        {/* ── FILTRES STYLE CAPTURE ── */}
        <div className="bg-[#f0f9ff] rounded-[32px] p-1 border border-blue-50 shadow-sm animate-fadeInUp">
          <div className="bg-white rounded-[28px] p-4 flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un équipement..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none font-medium"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <FilterSelect value={filterSite} onChange={setFilterSite} options={sites.map(s => ({ v: s.id, l: s.name }))} placeholder="Tous les sites" />
              <FilterSelect value={filterType} onChange={setFilterType} options={Object.entries(typeLabels).map(([v, l]) => ({ v, l: `${typeEmojis[v]} ${l}` }))} placeholder="Tous types" />
              <FilterSelect value={filterStatus} onChange={setFilterStatus} options={Object.entries(statusLabels).map(([v, l]) => ({ v, l }))} placeholder="Tous statuts" />
            </div>
          </div>
        </div>

        {/* ── CONTENU ── */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>
        ) : equipment.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] border border-blue-50">
            <WrenchScrewdriverIcon className="h-16 w-16 mx-auto text-slate-300" />
            <p className="mt-4 text-xl font-bold text-slate-800">Aucun équipement trouvé</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInUp">
            {equipment.map((item) => (
              <EquipmentCard key={item.id} item={item} navigate={navigate} canEdit={canEdit} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="bg-[#f0f9ff] rounded-[32px] p-1 border border-blue-50 overflow-hidden animate-fadeInUp">
            <div className="bg-white rounded-[28px] overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Équipement</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Site</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Statut</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {equipment.map((item) => (
                    <tr key={item.id} onClick={() => navigate(`/equipment/${item.id}`)} className="hover:bg-blue-50/50 transition-colors cursor-pointer group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-xl bg-gradient-to-br ${typeColors[item.equipment_type]} text-white text-lg shadow-sm`}>{typeEmojis[item.equipment_type]}</div>
                          <div>
                            <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{item.name}</p>
                            <p className="text-xs text-slate-400 font-medium">S/N: {item.serial_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-600">{item.site_name || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusColors[item.status]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDots[item.status]}`}></span>
                          {statusLabels[item.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/equipment/${item.id}/edit`); }} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-all"><PencilSquareIcon className="h-5 w-5" /></button>
                          <button onClick={(e) => handleDelete(item.id, e)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"><TrashIcon className="h-5 w-5" /></button>
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

      <style>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeInDown { animation: fadeInDown 0.6s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
}

/* ── HELPER COMPONENTS ── */

function QuickStat({ label, value, color, dot }) {
  return (
    <div className={`${color} backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/10`}>
      <div>
        <p className="text-xs font-bold text-blue-100 uppercase opacity-80">{label}</p>
        <p className="text-2xl font-black text-white">{value}</p>
      </div>
      {dot && <div className={`h-3 w-3 rounded-full ${dot} shadow-[0_0_8px_rgba(255,255,255,0.5)] animate-pulse`} />}
    </div>
  );
}

function FilterSelect({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-4 pr-10 py-3 bg-slate-50 border-0 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer transition-all"
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
      <ChevronDownIcon className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
    </div>
  );
}

function EquipmentCard({ item, navigate, canEdit, onDelete }) {
  return (
    <div onClick={() => navigate(`/equipment/${item.id}`)} className="group bg-[#f0f9ff] rounded-[32px] p-1 border border-blue-50 hover:shadow-xl transition-all cursor-pointer">
      <div className="bg-white rounded-[28px] p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className={`p-4 rounded-[20px] bg-gradient-to-br ${typeColors[item.equipment_type]} text-3xl shadow-lg group-hover:scale-110 transition-transform`}>
            {typeEmojis[item.equipment_type]}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-black tracking-tight ${statusColors[item.status]}`}>
            {statusLabels[item.status]}
          </span>
        </div>

        <div>
          <h3 className="text-lg font-black text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{item.name}</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{typeLabels[item.equipment_type]}</p>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-50">
          <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
            <MapPinIcon className="h-4 w-4 text-red-500" /> {item.site_name || 'Non assigné'}
          </div>
          <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
            <CogIcon className="h-4 w-4 text-blue-500" /> S/N: {item.serial_number}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex gap-1">
            <button onClick={(e) => { e.stopPropagation(); navigate(`/equipment/${item.id}`); }} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all"><EyeIcon className="h-5 w-5" /></button>
            {canEdit && <button onClick={(e) => { e.stopPropagation(); navigate(`/equipment/${item.id}/edit`); }} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all"><PencilSquareIcon className="h-5 w-5" /></button>}
          </div>
          {canEdit && <button onClick={(e) => { e.stopPropagation(); onDelete(item.id, e); }} className="p-2 bg-red-50 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition-all"><TrashIcon className="h-5 w-5" /></button>}
        </div>
      </div>
    </div>
  );
}