import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    MapPinIcon,
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    InformationCircleIcon,
    ScaleIcon
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const locationTypeLabels = {
    PIT: 'Fosse',
    STOCKPILE: 'Terril/Stock',
    WAREHOUSE: 'Entrepôt',
    LOADING_ZONE: 'Zone de chargement',
    PORT: 'Port/Terminal'
};

const locationTypeColors = {
    PIT: 'bg-orange-100 text-orange-800',
    STOCKPILE: 'bg-amber-100 text-amber-800',
    WAREHOUSE: 'bg-indigo-100 text-indigo-800',
    LOADING_ZONE: 'bg-sky-100 text-sky-800',
    PORT: 'bg-blue-100 text-blue-800'
};

export default function StockLocationsList() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const { isSupervisor, isAdmin, isTechnicien } = useAuthStore();
    const canEdit = isSupervisor() || isAdmin() || isTechnicien();
    const canDelete = isSupervisor() || isAdmin();
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (search) params.append('search', search);

            const response = await api.get(`/stock-locations/?${params.toString()}`);
            setLocations(response.data.results || response.data);
        } catch (error) {
            console.error('Erreur de chargement:', error);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchData]);

    const handleDelete = async (id, code, e) => {
        e.stopPropagation();
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'emplacement ${code} ?\nCette action est irréversible et échouera si des mouvements y sont liés.`)) {
            try {
                await api.delete(`/stock-locations/${id}/`);
                fetchData();
            } catch (error) {
                alert("Erreur lors de la suppression. Des mouvements de stock y sont probablement rattachés.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            {/* HEADER */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                                <MapPinIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-outfit">
                                    Zones de Stockage
                                </h1>
                                <p className="text-sm text-slate-500 font-medium mt-1">
                                    Gérez vos entrepôts, fosses et zones de transit
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {canEdit && (
                                <Link
                                    to="/stock/locations/new"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                                >
                                    <PlusIcon className="h-5 w-5" />
                                    Nouvelle Zone
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="pb-6">
                        <input
                            type="text"
                            placeholder="Rechercher un code, un nom..."
                            className="w-full sm:max-w-md px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : locations.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                        <MapPinIcon className="mx-auto h-12 w-12 text-slate-300" />
                        <h3 className="mt-4 text-lg font-bold text-slate-900">Aucune zone trouvée</h3>
                        <p className="mt-2 text-slate-500">Commencez par créer votre première zone de stockage.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Zone</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Site</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Capacité</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Statut</th>
                                        <th className="px-6 py-4 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {locations.map((loc) => (
                                        <tr
                                            key={loc.id}
                                            className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/stock/locations/${loc.id}/edit`)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                                                        {loc.code.substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900">{loc.name}</div>
                                                        <div className="text-sm font-medium text-slate-500 flex items-center gap-1">
                                                            <span className="text-slate-400">#</span>{loc.code}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${locationTypeColors[loc.location_type] || 'bg-slate-100 text-slate-800'}`}>
                                                    {locationTypeLabels[loc.location_type] || loc.location_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-slate-700">{loc.site_name || loc.site}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {loc.capacity ? (
                                                    <div className="inline-flex items-center gap-1 text-slate-700 font-bold">
                                                        {Number(loc.capacity).toLocaleString()} <span className="text-slate-400 text-xs text-medium">T</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-sm italic">Illimitée</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${loc.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${loc.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                    {loc.is_active ? 'Actif' : 'Inactif'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {canEdit && (
                                                        <button onClick={(e) => { e.stopPropagation(); navigate(`/stock/locations/${loc.id}/edit`); }} className="p-2 text-indigo-600 hover:bg-white rounded-lg shadow-sm">
                                                            <PencilSquareIcon className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    {canDelete && (
                                                        <button onClick={(e) => handleDelete(loc.id, loc.code, e)} className="p-2 text-red-600 hover:bg-white rounded-lg shadow-sm">
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
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
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
      `}</style>
        </div>
    );
}
