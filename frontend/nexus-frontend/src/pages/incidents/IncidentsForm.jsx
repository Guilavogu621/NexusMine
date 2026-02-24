import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
  TagIcon,
  ArrowLeftIcon,
  XCircleIcon,
  WrenchScrewdriverIcon,
  BeakerIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useFormPermissions from '../../hooks/useFormPermissions';
import ReadOnlyBanner from '../../components/ui/ReadOnlyBanner';

const INCIDENT_TYPES = [
  { value: 'SAFETY', label: 'Sécurité', emoji: '🛡️', gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-100 text-blue-700' },
  { value: 'EQUIPMENT', label: 'Équipement', emoji: '🔧', gradient: 'from-orange-500 to-orange-600', bg: 'bg-orange-100 text-orange-700' },
  { value: 'ENVIRONMENTAL', label: 'Environnement', emoji: '🌿', gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-100 text-emerald-700' },
  { value: 'OPERATIONAL', label: 'Opérationnel', emoji: '⚙️', gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-100 text-purple-700' },
  { value: 'OTHER', label: 'Autre', emoji: '📋', gradient: 'from-slate-500 to-slate-600', bg: 'bg-slate-100 text-slate-700' },
];

const SEVERITY_OPTIONS = [
  { value: 'LOW', label: 'Faible', emoji: '🟢', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-300', pulse: false },
  { value: 'MEDIUM', label: 'Moyen', emoji: '🟡', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700', border: 'border-amber-300', pulse: false },
  { value: 'HIGH', label: 'Élevé', emoji: '🟠', dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700', border: 'border-orange-300', pulse: true },
  { value: 'CRITICAL', label: 'Critique', emoji: '🔴', dot: 'bg-red-500', badge: 'bg-red-100 text-red-700', border: 'border-red-300', pulse: true },
];

const STATUS_OPTIONS = [
  { value: 'REPORTED', label: 'Signalé', emoji: '📋', dot: 'bg-indigo-500', badge: 'bg-blue-100/80 text-blue-800' },
  { value: 'INVESTIGATING', label: 'En investigation', emoji: '🔍', dot: 'bg-amber-500', badge: 'bg-amber-100/80 text-amber-800' },
  { value: 'IN_PROGRESS', label: 'En cours de résolution', emoji: '⚙️', dot: 'bg-purple-500', badge: 'bg-purple-100/80 text-purple-800' },
  { value: 'RESOLVED', label: 'Résolu', emoji: '✅', dot: 'bg-emerald-500', badge: 'bg-emerald-100/80 text-emerald-800' },
  { value: 'CLOSED', label: 'Clôturé', emoji: '🔒', dot: 'bg-slate-500', badge: 'bg-slate-100/80 text-slate-800' },
];

// Style des inputs pour correspondre à la capture
const inputCls = 'block w-full rounded-xl border-0 py-3 px-4 bg-slate-50/50 text-slate-800 ring-1 ring-inset ring-gray-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium outline-none';

// Composant de section style "Capture"
const StyledSection = ({ icon: Icon, title, iconBg, children }) => (
  <div className="bg-[#f0f9ff] rounded-[32px] overflow-hidden mb-6 border border-blue-50 shadow-sm animate-fadeInUp">
    <div className="px-6 py-4 flex items-center gap-3">
      <div className={`p-2 ${iconBg} rounded-xl`}>
        <Icon className="h-5 w-5 text-blue-600" />
      </div>
      <h2 className="font-bold text-slate-800 text-base">{title}</h2>
    </div>
    <div className="bg-white m-1 rounded-[28px] p-6 shadow-sm">
      {children}
    </div>
  </div>
);

export default function IncidentsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { readOnly, canSubmit, roleBanner } = useFormPermissions('incidents');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [sites, setSites] = useState([]);

  const [formData, setFormData] = useState({
    incident_code: '',
    incident_type: 'OTHER',
    site: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    severity: 'LOW',
    status: 'REPORTED',
    description: '',
    actions_taken: '',
  });

  useEffect(() => {
    fetchSites();
    if (isEdit) { fetchIncident(); } else { generateIncidentCode(); }
  }, [id]);

  const generateIncidentCode = () => {
    const d = new Date();
    const code = `INC-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    setFormData(prev => ({ ...prev, incident_code: code }));
  };

  const fetchSites = async () => {
    try {
      const response = await api.get('/sites/');
      const sitesData = response.data.results || response.data;
      setSites(sitesData.map(site => ({ value: site.id, label: site.name })));
    } catch (err) { console.error(err); }
  };

  const fetchIncident = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/incidents/${id}/`);
      setFormData({
        incident_code: response.data.incident_code || '',
        incident_type: response.data.incident_type || 'OTHER',
        site: response.data.site || '',
        date: response.data.date || '',
        time: response.data.time || '',
        severity: response.data.severity || 'LOW',
        status: response.data.status || 'REPORTED',
        description: response.data.description || '',
        actions_taken: response.data.actions_taken || '',
      });
    } catch (err) {
      setError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const dataToSend = { ...formData, time: formData.time || null };
      if (isEdit) {
        await api.put(`/incidents/${id}/`, dataToSend);
      } else {
        await api.post('/incidents/', dataToSend);
      }
      setSuccess(true);
      setTimeout(() => navigate('/incidents'), 1500);
    } catch (err) {
      if (err.response?.data) {
        const errors = Object.entries(err.response.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('\n');
        setError(errors);
      } else {
        setError('Une erreur est survenue');
      }
    } finally {
      setSaving(false);
    }
  };

  const currentType = INCIDENT_TYPES.find(t => t.value === formData.incident_type) || INCIDENT_TYPES[4];
  const currentSeverity = SEVERITY_OPTIONS.find(s => s.value === formData.severity) || SEVERITY_OPTIONS[0];
  const currentStatus = STATUS_OPTIONS.find(s => s.value === formData.status) || STATUS_OPTIONS[0];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <div className="max-w-5xl mx-auto px-4 pt-8 space-y-6">

        {/* ── HEADER BLEU (Design Capture) ── */}
        <div className="relative overflow-hidden rounded-[35px] bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 shadow-xl animate-fadeInDown">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          </div>

          <div className="relative p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/incidents')}
                className="p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-white/30 transition-all shadow-lg"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-4">
                <div className="text-5xl drop-shadow-md">{currentType.emoji}</div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                    {isEdit ? "Modifier l'incident" : 'Nouvelle déclaration'}
                  </h1>
                  <p className="text-blue-100 font-medium opacity-90">
                    {isEdit ? "Mise à jour des informations" : 'Enregistrez un nouvel incident environnemental'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30 text-white font-bold">
              <ChartBarIcon className="h-5 w-5" />
              {currentType.label}
            </div>
          </div>
        </div>

        {/* ── ALERTS ── */}
        {success && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 font-bold shadow-sm animate-fadeInUp">
            <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
            Opération réussie. Redirection...
          </div>
        )}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 shadow-sm animate-fadeInUp">
            <XCircleIcon className="h-5 w-5 text-red-600 mt-0.5" />
            <pre className="whitespace-pre-line font-sans text-sm flex-1 font-medium">{error}</pre>
          </div>
        )}

        <ReadOnlyBanner message={roleBanner} />

        <form onSubmit={readOnly ? (e) => e.preventDefault() : handleSubmit} className="space-y-2">

          {/* ── 1 · Informations principales ── */}
          <StyledSection icon={BeakerIcon} title="Informations principales" iconBg="bg-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Type d'incident *</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-lg pointer-events-none">📊</span>
                  <select name="incident_type" value={formData.incident_type} onChange={handleChange}
                    required disabled={readOnly} className={`${inputCls} pl-12 appearance-none cursor-pointer`}>
                    {INCIDENT_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Site *</label>
                <div className="relative">
                  <MapPinIcon className="absolute left-4 top-3.5 h-5 w-5 text-red-500 pointer-events-none" />
                  <select name="site" value={formData.site} onChange={handleChange}
                    required disabled={readOnly} className={`${inputCls} pl-12 appearance-none cursor-pointer`}>
                    <option value="">Sélectionner un site</option>
                    {sites.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </StyledSection>

          {/* ── 2 · Données de l'incident (Evaluation) ── */}
          <StyledSection icon={ChartBarIcon} title="Évaluation et Gravité" iconBg="bg-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Niveau de sévérité *</label>
                <div className="grid grid-cols-2 gap-3">
                  {SEVERITY_OPTIONS.map(option => (
                    <label key={option.value} className={`
                        flex items-center justify-center gap-2 p-3 rounded-xl cursor-pointer border-2 transition-all text-sm font-bold
                        ${formData.severity === option.value ? `${option.badge} ${option.border} shadow-sm` : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-white'}
                      `}>
                      <input type="radio" name="severity" value={option.value} checked={formData.severity === option.value}
                        onChange={handleChange} disabled={readOnly} className="sr-only" />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Statut actuel *</label>
                <select name="status" value={formData.status} onChange={handleChange}
                  disabled={readOnly} className={inputCls}>
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.emoji} {o.label}</option>)}
                </select>
              </div>
            </div>
          </StyledSection>

          {/* ── 3 · Date et heure ── */}
          <StyledSection icon={CalendarIcon} title="Date et heure" iconBg="bg-purple-100/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Date de l'incident *</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange}
                  required disabled={readOnly} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Heure (optionnel)</label>
                <input type="time" name="time" value={formData.time} onChange={handleChange}
                  disabled={readOnly} className={inputCls} />
              </div>
            </div>
          </StyledSection>

          {/* ── 4 · Description ── */}
          <StyledSection icon={DocumentTextIcon} title="Description détaillée" iconBg="bg-slate-100">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description des faits *</label>
                <textarea name="description" value={formData.description} onChange={handleChange}
                  required rows={4} disabled={readOnly}
                  className={inputCls + ' resize-none'} placeholder="Détaillez l'incident..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Actions prises</label>
                <textarea name="actions_taken" value={formData.actions_taken} onChange={handleChange}
                  rows={3} disabled={readOnly}
                  className={inputCls + ' resize-none'} placeholder="Mesures immédiates..." />
              </div>
            </div>
          </StyledSection>

          {/* ── ACTIONS ── */}
          <div className="flex items-center justify-between pt-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <button
              type="button"
              onClick={() => navigate('/incidents')}
              className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-200 transition-all"
            >
              Annuler
            </button>

            {canSubmit && (
              <button
                type="submit"
                disabled={saving}
                className="px-10 py-3 rounded-2xl font-extrabold text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : isEdit ? "Mettre à jour" : "Enregistrer l'incident"}
              </button>
            )}
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeInDown { animation: fadeInDown 0.6s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'%3E%3C/path%3E%3C/svg%3E");
          background-position: right 1rem center;
          background-repeat: no-repeat;
          background-size: 1.25em;
        }
      `}</style>
    </div>
  );
}