import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BellAlertIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  CheckCircleIcon,
  SparklesIcon,
  TagIcon,
  ChatBubbleLeftRightIcon,
  BoltIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const typeLabels = {
  THRESHOLD_EXCEEDED: 'Seuil dépassé',
  SAFETY: 'Sécurité',
  MAINTENANCE: 'Maintenance',
  ENVIRONMENTAL: 'Environnement',
  PRODUCTION: 'Production',
  INCIDENT: 'Incident',
  EQUIPMENT: 'Équipement',
  STOCK: 'Stock',
  SYSTEM: 'Système',
};

const severityLabels = {
  LOW: 'Faible',
  MEDIUM: 'Moyen',
  HIGH: 'Élevé',
  CRITICAL: 'Critique',
};

const typeEmojis = {
  THRESHOLD_EXCEEDED: '📊',
  SAFETY: '🛡️',
  MAINTENANCE: '🔧',
  ENVIRONMENTAL: '🌿',
  PRODUCTION: '⚙️',
  INCIDENT: '⚠️',
  EQUIPMENT: '🧰',
  STOCK: '📦',
  SYSTEM: '💻',
};

const severityConfig = {
  LOW: { bg: 'bg-slate-100/80', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500' },
  MEDIUM: { bg: 'bg-blue-100/80', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  HIGH: { bg: 'bg-orange-100/80', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  CRITICAL: { bg: 'bg-red-100/80', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', animation: 'animate-pulse' },
};

export default function AlertsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isSiteManager, isTechnicien } = useAuthStore();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [sites, setSites] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    alert_type: 'INCIDENT',
    severity: 'MEDIUM',
    status: 'NEW',
    site: '',
  });

  useEffect(() => {
    fetchSites();
    if (isEdit) fetchData();
  }, [id]);

  const fetchSites = async () => {
    try {
      const response = await api.get('/sites/');
      setSites(response.data.results || response.data);
    } catch (err) { console.error('Erreur sites:', err); }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/alerts/${id}/`);
      setFormData(response.data);
    } catch (err) { setError('Impossible de charger l\'alerte'); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      isEdit ? await api.put(`/alerts/${id}/`, formData) : await api.post('/alerts/', formData);
      navigate('/alerts');
    } catch (err) {
      setError('Erreur lors de la validation. Vérifiez les champs.');
    } finally { setSaving(false); }
  };

  const currentSeverity = severityConfig[formData.severity] || severityConfig.MEDIUM;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 relative pb-12">
      <div className="fixed inset-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_75%,rgba(99,102,241,0.05),transparent_50%)]"></div>
      </div>

      <div className="relative max-w-4xl mx-auto pt-8 px-4 sm:px-6">
        {/* Header Premium */}
        <div className="group relative bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 rounded-3xl shadow-2xl overflow-hidden mb-8 animate-fadeInDown">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="alertGrid" width="8" height="8" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="0.5" fill="white" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#alertGrid)" />
            </svg>
          </div>

          <div className="relative px-8 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Link to="/alerts" className="p-3 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/30 transition-all shadow-lg">
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight font-outfit">
                  {isEdit ? 'Détails de l\'alerte' : 'Émettre une alerte'}
                </h1>
                <p className="text-indigo-100 font-medium opacity-90">
                  {isEdit ? `Signalement #${id}` : 'Diffusion d\'un incident sur le réseau'}
                </p>
              </div>
            </div>

            <div className={`hidden md:flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 shadow-xl`}>
              <span className="text-2xl">{typeEmojis[formData.alert_type]}</span>
              <div className="text-left">
                <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Type Actuel</p>
                <p className="text-sm font-bold text-white uppercase">{typeLabels[formData.alert_type]}</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-20 shadow-xl flex flex-col items-center justify-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="mt-6 text-slate-500 font-bold animate-pulse">Synchronisation des données...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="animate-fadeInUp bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                <p className="font-bold">{error}</p>
              </div>
            )}

            {/* Section 1: Contenu de l'alerte */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-xl animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-100 rounded-lg shadow-sm">
                  <TagIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 font-outfit">Contenu du signalement</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Titre de l'alerte *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ex: Surchauffe moteur groupe électrogène"
                    className="w-full rounded-2xl py-4 px-5 bg-white border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-semibold text-slate-800 shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Description détaillée *</label>
                  <div className="relative">
                    <ChatBubbleLeftRightIcon className="absolute left-5 top-5 h-6 w-6 text-slate-400" />
                    <textarea
                      name="message"
                      required
                      rows="4"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Décrivez précisément l'incident ou l'anomalie constatée..."
                      className="w-full rounded-2xl py-4 pl-14 pr-5 bg-white border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-800 shadow-sm"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Classification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <BoltIcon className="h-6 w-6 text-amber-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 font-outfit">Type & Criticité</h2>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Catégorie</label>
                    <select
                      name="alert_type"
                      value={formData.alert_type}
                      onChange={handleChange}
                      className="w-full rounded-xl py-3 px-4 bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                    >
                      {Object.entries(typeLabels).map(([v, l]) => (
                        <option key={v} value={v}>{typeEmojis[v]} {l}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Niveau d'urgence</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((sev) => (
                        <button
                          key={sev}
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, severity: sev }))}
                          className={`py-3 px-2 rounded-xl text-xs font-bold border-2 transition-all ${formData.severity === sev
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md'
                              : 'border-transparent bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                        >
                          {sev === 'CRITICAL' && '🔥 '}
                          {sev === 'HIGH' && '⚡ '}
                          {sev === 'MEDIUM' && '🛡️ '}
                          {sev === 'LOW' && '🍃 '}
                          {severityLabels[sev]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-sky-100 rounded-lg">
                    <MapPinIcon className="h-6 w-6 text-sky-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 font-outfit">Localisation & Suivi</h2>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Site concerné *</label>
                    <select
                      name="site"
                      required
                      value={formData.site}
                      onChange={handleChange}
                      className="w-full rounded-xl py-3 px-4 bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                    >
                      <option value="">Sélectionner un site...</option>
                      {sites.map(s => (
                        <option key={s.id} value={s.id}>📍 {s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Statut du traitement</label>
                    <div className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${currentSeverity.bg} ${currentSeverity.border}`}>
                      <div className={`h-3 w-3 rounded-full ${currentSeverity.dot} ${currentSeverity.animation}`}></div>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="bg-transparent border-none focus:ring-0 font-bold text-sm w-full cursor-pointer"
                      >
                        <option value="NEW">🆕 Nouvelle</option>
                        <option value="READ">👁️ Lue / Prise en compte</option>
                        <option value="IN_PROGRESS">⏳ En cours de résolution</option>
                        <option value="RESOLVED">✅ Résolue</option>
                        <option value="ARCHIVED">📦 Archivée</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <Link
                to="/alerts"
                className="w-full sm:w-auto px-8 py-4 text-slate-500 font-bold hover:text-slate-800 transition-colors"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-4 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-2xl font-bold shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <CheckCircleIcon className="h-6 w-6" />
                )}
                {isEdit ? 'Mettre à jour l\'alerte' : 'Diffuser l\'alerte'}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-25px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(25px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInDown { animation: fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-fill-mode: both; }

        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'%3E%3C/path%3E%3C/svg%3E");
          background-position: right 1rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
        }
      `}</style>
    </div>
  );
}