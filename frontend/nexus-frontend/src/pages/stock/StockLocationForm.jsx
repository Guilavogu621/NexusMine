import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    MapPinIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const locationTypeOptions = [
    { value: 'PIT', label: 'Fosse', emoji: '🕳️' },
    { value: 'STOCKPILE', label: 'Terril/Stock', emoji: '⛰️' },
    { value: 'WAREHOUSE', label: 'Entrepôt', emoji: '🏭' },
    { value: 'LOADING_ZONE', label: 'Zone de chargement', emoji: '🏗️' },
    { value: 'PORT', label: 'Port/Terminal', emoji: '🚢' }
];

export default function StockLocationForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const { isSupervisor, isAdmin, isTechnicien } = useAuthStore();
    const canEdit = isSupervisor() || isAdmin() || isTechnicien();

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [sites, setSites] = useState([]);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        site: '',
        location_type: 'STOCKPILE',
        capacity: '',
        gps_latitude: '',
        gps_longitude: '',
        description: '',
        is_active: true
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const sitesRes = await api.get('/sites/');
                setSites(sitesRes.data.results || sitesRes.data);

                if (isEdit) {
                    const locRes = await api.get(`/stock-locations/${id}/`);
                    const data = locRes.data;
                    setFormData({
                        code: data.code || '',
                        name: data.name || '',
                        site: data.site || '',
                        location_type: data.location_type || 'STOCKPILE',
                        capacity: data.capacity || '',
                        gps_latitude: data.gps_latitude || '',
                        gps_longitude: data.gps_longitude || '',
                        description: data.description || '',
                        is_active: data.is_active ?? true
                    });
                }
            } catch (err) {
                setError("Erreur lors du chargement des données.");
            }
        };
        loadData();
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canEdit) return;
        setSaving(true);
        setError(null);

        try {
            const payload = { ...formData };
            if (!payload.capacity) payload.capacity = null;
            if (!payload.gps_latitude) payload.gps_latitude = null;
            if (!payload.gps_longitude) payload.gps_longitude = null;

            if (isEdit) {
                await api.put(`/stock-locations/${id}/`, payload);
            } else {
                await api.post('/stock-locations/', payload);
            }
            navigate('/stock/locations');
        } catch (err) {
            setError(err.response?.data?.detail || "Erreur lors de l'enregistrement de la zone.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50 pb-12">
            <div className="relative z-10 space-y-8 px-4 sm:px-6 lg:px-8 pt-8 max-w-4xl mx-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/stock/locations')}
                            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                        >
                            <ArrowLeftIcon className="h-6 w-6 text-slate-600" />
                        </button>
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                            <MapPinIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {isEdit ? 'Modifier la zone' : 'Nouvelle Zone de Stockage'}
                            </h1>
                            <p className="text-sm text-slate-500 font-medium">Définissez les propriétés de l'emplacement</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-4xl shadow-sm border border-slate-200 p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="space-y-2 text-left">
                            <label className="text-sm font-bold text-slate-700 ml-1">Site minier</label>
                            <select
                                name="site"
                                value={formData.site}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-medium disabled:opacity-50 text-black text-left"
                                disabled={!canEdit}
                            >
                                <option value="">Sélectionner le site</option>
                                {sites.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.code ? `[${s.code}] ${s.name}` : s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2 text-left">
                            <label className="text-sm font-bold text-slate-700 ml-1">Type de zone</label>
                            <select
                                name="location_type"
                                value={formData.location_type}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-medium disabled:opacity-50 text-black text-left"
                                disabled={!canEdit}
                            >
                                {locationTypeOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.emoji} {opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2 text-left">
                            <label className="text-sm font-bold text-slate-700 ml-1">Code de la zone</label>
                            <input
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                required
                                placeholder="Ex: Z01"
                                disabled={!canEdit}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-bold text-black text-left"
                            />
                        </div>

                        <div className="space-y-2 text-left">
                            <label className="text-sm font-bold text-slate-700 ml-1">Nom descriptif</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Ex: Hangar Bauxite Nord"
                                disabled={!canEdit}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-medium text-black text-left"
                            />
                        </div>

                        <div className="space-y-2 text-left">
                            <label className="text-sm font-bold text-slate-700 ml-1">Capacité maximale (Tonnes) - Optionnel</label>
                            <input
                                name="capacity"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.capacity}
                                onChange={handleChange}
                                placeholder="Ex: 50000"
                                disabled={!canEdit}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-medium text-black text-left"
                            />
                        </div>

                        <div className="flex items-center gap-3 pt-8 pb-4">
                            <input
                                type="checkbox"
                                id="is_active"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                                disabled={!canEdit}
                                className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            />
                            <label htmlFor="is_active" className="text-sm font-bold text-slate-700 cursor-pointer">
                                Zone Active (Visible dans les listes)
                            </label>
                        </div>

                        {/* GPS block */}
                        <div className="md:col-span-2 grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200 mt-2">
                            <div className="col-span-2 mb-2">
                                <span className="text-sm font-bold text-slate-800">Coordonnées GPS (Optionnel)</span>
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Latitude</label>
                                <input
                                    name="gps_latitude"
                                    type="number"
                                    step="any"
                                    value={formData.gps_latitude}
                                    onChange={handleChange}
                                    placeholder="ex: 10.6543"
                                    disabled={!canEdit}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl font-medium text-black"
                                />
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Longitude</label>
                                <input
                                    name="gps_longitude"
                                    type="number"
                                    step="any"
                                    value={formData.gps_longitude}
                                    onChange={handleChange}
                                    placeholder="ex: -14.2345"
                                    disabled={!canEdit}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl font-medium text-black"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2 text-left mt-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Description (Optionnel)</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                disabled={!canEdit}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-medium text-black resize-none"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                            <p className="text-sm font-bold text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="mt-8 flex items-center justify-end gap-4 border-t border-slate-100 pt-6">
                        <button
                            type="button"
                            onClick={() => navigate('/stock/locations')}
                            className="px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                        >
                            Annuler
                        </button>
                        {canEdit && (
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                                ) : (
                                    <>
                                        <CheckCircleIcon className="h-5 w-5" />
                                        Enregistrer
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
