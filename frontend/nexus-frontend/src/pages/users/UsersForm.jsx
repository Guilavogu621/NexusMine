import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  KeyIcon,
  MapPinIcon,
  CheckCircleIcon,
  SparklesIcon,
  UserCircleIcon,
  IdentificationIcon,
  LockClosedIcon,
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
  ADMIN: { bg: 'bg-red-100/80', text: 'text-red-700', border: 'border-red-200', gradient: 'from-red-500 to-red-600' },
  SITE_MANAGER: { bg: 'bg-sky-100/80', text: 'text-sky-700', border: 'border-sky-200', gradient: 'from-sky-500 to-sky-600' },
  TECHNICIEN: { bg: 'bg-indigo-100/80', text: 'text-indigo-700', border: 'border-indigo-200', gradient: 'from-indigo-500 to-indigo-600' },
  ANALYST: { bg: 'bg-emerald-100/80', text: 'text-emerald-700', border: 'border-emerald-200', gradient: 'from-emerald-500 to-emerald-600' },
  MMG: { bg: 'bg-amber-100/80', text: 'text-amber-700', border: 'border-amber-200', gradient: 'from-amber-500 to-amber-600' },
};

export default function UsersForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [availableSites, setAvailableSites] = useState([]);
  
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'TECHNICIEN',
    is_active: true,
    password: '',
    password_confirm: '',
    assigned_sites: [],
  });

  useEffect(() => {
    fetchSites();
    if (isEdit) fetchData();
  }, [id]);

  const fetchSites = async () => {
    try {
      const response = await api.get('/sites/');
      setAvailableSites(response.data.results || response.data);
    } catch (err) { console.error('Erreur sites:', err); }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${id}/`);
      setFormData({
        ...response.data,
        password: '',
        password_confirm: '',
        assigned_sites: response.data.assigned_sites || [],
      });
    } catch (err) { setError('Impossible de charger les données'); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEdit && !formData.password) return setError('Mot de passe requis');
    if (formData.password !== formData.password_confirm) return setError('Les mots de passe ne correspondent pas');

    setSaving(true);
    try {
      const dataToSend = { ...formData };
      if (!formData.password) { delete dataToSend.password; delete dataToSend.password_confirm; }
      if (formData.role === 'ADMIN') dataToSend.assigned_sites = [];

      isEdit ? await api.put(`/users/${id}/`, dataToSend) : await api.post('/users/', dataToSend);
      navigate('/users');
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Erreur lors de la sauvegarde');
    } finally { setSaving(false); }
  };

  if (!isAdmin()) return <div className="p-10 text-center font-bold text-red-600">Accès refusé.</div>;

  const rc = roleConfig[formData.role] || roleConfig.TECHNICIEN;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 relative pb-12">
      {/* Background decoration */}
      <div className="fixed inset-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(99,102,241,0.05),transparent_50%)]"></div>
      </div>

      <div className="relative max-w-4xl mx-auto pt-8 px-4 sm:px-6">
        {/* Header Premium */}
        <div className="group relative bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden mb-8 animate-fadeInDown">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="formGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
              <rect width="100" height="100" fill="url(#formGrid)" />
            </svg>
          </div>
          
          <div className="relative px-8 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Link to="/users" className="p-3 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/30 transition-all">
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  {isEdit ? 'Modifier le profil' : 'Nouvel utilisateur'}
                </h1>
                <p className="text-blue-100 font-medium">
                  {isEdit ? `ID: ${id}` : 'Configuration des accès de la plateforme'}
                </p>
              </div>
            </div>
            
            {isEdit && (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${rc.gradient} flex items-center justify-center text-white font-bold shadow-lg`}>
                  {formData.first_name?.[0]}{formData.last_name?.[0]}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-blue-100 uppercase tracking-widest">Utilisateur</p>
                  <p className="text-sm font-bold text-white uppercase">{formData.first_name} {formData.last_name}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
           <div className="bg-white/80 backdrop-blur-md rounded-3xl p-20 shadow-xl flex flex-col items-center justify-center">
             <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
             <p className="mt-4 text-slate-500 font-bold">Chargement du formulaire...</p>
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="animate-fadeInUp bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-sm flex items-center gap-3">
                <XCircleIcon className="h-6 w-6 flex-shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Section: Identité */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-xl animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <UserCircleIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 font-outfit">Informations personnelles</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Prénom *</label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Ex: Jean"
                    className="w-full rounded-2xl py-3 px-4 bg-white/50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Nom *</label>
                  <input
                    type="text"
                    name="last_name"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Ex: Dupont"
                    className="w-full rounded-2xl py-3 px-4 bg-white/50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Adresse Email *</label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@entreprise.com"
                      className="w-full rounded-2xl py-3 pl-12 pr-4 bg-white/50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Rôle & Statut */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-xl animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <ShieldCheckIcon className="h-6 w-6 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 font-outfit">Habilitations & Accès</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Rôle plateforme *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full rounded-2xl py-3 px-4 bg-white/50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold appearance-none"
                  >
                    {Object.entries(roleLabels).map(([v, l]) => (
                      <option key={v} value={v}>{roleEmojis[v]} {l}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="relative flex items-center gap-4 cursor-pointer group mt-6 md:mt-0">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                    </div>
                    <span className="text-base font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                      Compte actif
                    </span>
                  </label>
                </div>
              </div>

              {/* Sites Assignés */}
              {formData.role !== 'ADMIN' && (
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPinIcon className="h-5 w-5 text-slate-400" />
                    <h3 className="font-bold text-slate-800">Périmètre d'intervention (Sites)</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-52 overflow-y-auto p-1 custom-scrollbar">
                    {availableSites.map(site => (
                      <label
                        key={site.id}
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          formData.assigned_sites.includes(site.id)
                            ? 'border-indigo-500 bg-indigo-50 shadow-md'
                            : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.assigned_sites.includes(site.id)}
                          onChange={(e) => {
                            const sites = e.target.checked 
                              ? [...formData.assigned_sites, site.id]
                              : formData.assigned_sites.filter(s => s !== site.id);
                            setFormData(prev => ({ ...prev, assigned_sites: sites }));
                          }}
                          className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{site.name}</p>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{site.code || 'SITE'}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section: Sécurité */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-xl animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <KeyIcon className="h-6 w-6 text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 font-outfit">Sécurité du compte</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">
                    {isEdit ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe *'}
                  </label>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="password"
                      name="password"
                      required={!isEdit}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full rounded-2xl py-3 pl-12 pr-4 bg-white/50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Confirmer *</label>
                  <input
                    type="password"
                    name="password_confirm"
                    required={!isEdit}
                    value={formData.password_confirm}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full rounded-2xl py-3 px-4 bg-white/50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              <Link
                to="/users"
                className="w-full sm:w-auto px-8 py-4 text-slate-600 font-bold hover:text-slate-900 transition-colors"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-10 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:translate-y-0"
              >
                {saving ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <CheckCircleIcon className="h-5 w-5" />
                )}
                {isEdit ? 'Enregistrer les modifications' : 'Créer l\'utilisateur'}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInDown { animation: fadeInDown 0.7s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; animation-fill-mode: both; }

        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'%3E%3C/path%3E%3C/svg%3E");
          background-position: right 1rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
        }

        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  );
}