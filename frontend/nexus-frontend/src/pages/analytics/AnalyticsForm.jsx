import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  ChartBarIcon, 
  MapPinIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  ShieldExclamationIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useFormPermissions from '../../hooks/useFormPermissions';
import ReadOnlyBanner from '../../components/ui/ReadOnlyBanner';

const typeLabels = {
  PRODUCTION: 'Production',
  EFFICIENCY: 'Efficacité',
  SAFETY: 'Sécurité',
  ENVIRONMENTAL: 'Environnement',
  EQUIPMENT: 'Équipement',
  FINANCIAL: 'Financier',
};

const typeEmojis = {
  PRODUCTION: '⚙️',
  EFFICIENCY: '⚡',
  SAFETY: '🛡️',
  ENVIRONMENTAL: '🌿',
  EQUIPMENT: '🧰',
  FINANCIAL: '💰',
};

export default function AnalyticsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { readOnly, canSubmit, roleBanner } = useFormPermissions('analytics');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [sites, setSites] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    indicator_type: 'PRODUCTION',
    site: '',
    calculated_value: '',
    target_value: '',
    unit: '',
    threshold_warning: '',
    threshold_critical: '',
    description: '',
  });

  useEffect(() => {
    fetchSites();
    if (isEdit) {
      fetchData();
    }
  }, [id]);

  const fetchSites = async () => {
    try {
      const response = await api.get('/sites/');
      setSites(response.data.results || response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des sites:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/indicators/${id}/`);
      setFormData({
        name: response.data.name || '',
        indicator_type: response.data.indicator_type || 'PRODUCTION',
        site: response.data.site || '',
        calculated_value: response.data.calculated_value || '',
        target_value: response.data.target_value || '',
        unit: response.data.unit || '',
        threshold_warning: response.data.threshold_warning || '',
        threshold_critical: response.data.threshold_critical || '',
        description: response.data.description || '',
      });
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (readOnly) return;
    
    setError(null);
    setSaving(true);

    try {
      const dataToSend = {
        ...formData,
        site: formData.site || null,
        calculated_value: formData.calculated_value ? parseFloat(formData.calculated_value) : null,
        target_value: formData.target_value ? parseFloat(formData.target_value) : null,
        threshold_warning: formData.threshold_warning ? parseFloat(formData.threshold_warning) : null,
        threshold_critical: formData.threshold_critical ? parseFloat(formData.threshold_critical) : null,
      };

      if (isEdit) {
        await api.put(`/indicators/${id}/`, dataToSend);
      } else {
        await api.post('/indicators/', dataToSend);
      }
      navigate('/analytics');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      if (error.response?.data) {
        const errors = Object.entries(error.response.data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        setError(errors);
      } else {
        setError('Une erreur est survenue lors de l\'enregistrement.');
      }
    } finally {
      setSaving(false);
    }
  };

  const inputClasses = `w-full rounded-2xl py-4 px-5 bg-white border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-semibold text-slate-800 shadow-sm disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-100 relative pb-12">
      {/* Background decoration */}
      <div className="fixed inset-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_75%,rgba(99,102,241,0.05),transparent_50%)]"></div>
      </div>

      <div className="relative max-w-5xl mx-auto pt-8 px-4 sm:px-6">
        
        {/* Header Premium */}
        <div className="group relative bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 rounded-3xl shadow-2xl overflow-hidden mb-8 animate-fadeInDown">
          <div className="absolute inset-0 opacity-10">
             <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="analyticsGrid" width="8" height="8" patternUnits="userSpaceOnUse">
                  <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#analyticsGrid)" />
            </svg>
          </div>
          
          <div className="relative px-8 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Link to="/analytics" className="p-3 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/30 transition-all shadow-lg">
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight font-outfit">
                  {isEdit ? 'Édition de l\'indicateur' : 'Nouvel Indicateur'}
                </h1>
                <p className="text-indigo-100 font-medium opacity-90 mt-1">
                  {isEdit ? 'Configuration des paramètres du KPI' : 'Créez un nouveau marqueur de performance'}
                </p>
              </div>
            </div>
            
            <div className={`hidden md:flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 shadow-xl`}>
              <span className="text-2xl">{typeEmojis[formData.indicator_type] || '📊'}</span>
              <div className="text-left">
                <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Catégorie</p>
                <p className="text-sm font-bold text-white uppercase">{typeLabels[formData.indicator_type] || 'Inconnu'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Read Only Banner */}
        {roleBanner && (
          <div className="mb-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <ReadOnlyBanner message={roleBanner} />
          </div>
        )}

        {loading ? (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-20 shadow-xl flex flex-col items-center justify-center">
             <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
             </div>
             <p className="mt-6 text-slate-500 font-bold animate-pulse">Chargement de l'indicateur...</p>
          </div>
        ) : (
          <form onSubmit={readOnly ? (e) => e.preventDefault() : handleSubmit} className="space-y-6">
            {error && (
              <div className="animate-fadeInUp bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-2xl shadow-lg flex items-start gap-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                <p className="font-bold whitespace-pre-line">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Colonne Principale : Définition & Description */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-xl animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-indigo-100 rounded-lg shadow-sm">
                      <ChartBarIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 font-outfit">Identité visuelle & Classification</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Nom de l'indicateur (KPI) *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        disabled={readOnly}
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ex: Taux de disponibilité des pelles..."
                        className={inputClasses}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Type d'indicateur *</label>
                        <select
                          name="indicator_type"
                          required
                          disabled={readOnly}
                          value={formData.indicator_type}
                          onChange={handleChange}
                          className={`${inputClasses} appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.5em] bg-[right_1rem_center] bg-no-repeat`}
                        >
                          {Object.entries(typeLabels).map(([val, label]) => (
                            <option key={val} value={val}>{typeEmojis[val]} {label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Site rattaché</label>
                        <select
                          name="site"
                          disabled={readOnly}
                          value={formData.site}
                          onChange={handleChange}
                          className={`${inputClasses} appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.5em] bg-[right_1rem_center] bg-no-repeat`}
                        >
                          <option value="">📍 Applicatif global (Tous les sites)</option>
                          {sites.map((site) => (
                            <option key={site.id} value={site.id}>📍 {site.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-xl animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-slate-100 rounded-lg shadow-sm">
                      <DocumentTextIcon className="h-6 w-6 text-slate-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 font-outfit">Contexte & Description</h2>
                  </div>
                  <div className="space-y-2">
                    <textarea
                      name="description"
                      rows={4}
                      disabled={readOnly}
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Détaillez la méthode de calcul, la source des données ou le contexte de cet indicateur..."
                      className={`${inputClasses} resize-none font-medium`}
                    />
                  </div>
                </div>
              </div>

              {/* Colonne Secondaire : Chiffres & Seuils */}
              <div className="space-y-6">
                
                {/* Block Métriques */}
                <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-xl animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-100 rounded-lg shadow-sm">
                      <PresentationChartLineIcon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 font-outfit">Métriques</h2>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Unité de mesure *</label>
                      <input
                        type="text"
                        name="unit"
                        required
                        disabled={readOnly}
                        value={formData.unit}
                        onChange={handleChange}
                        placeholder="Ex: %, tonnes, heures..."
                        className={inputClasses}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Valeur Actuelle</label>
                      <input
                        type="number"
                        name="calculated_value"
                        step="0.01"
                        disabled={readOnly}
                        value={formData.calculated_value}
                        onChange={handleChange}
                        placeholder="0.00"
                        className={`${inputClasses} text-2xl font-bold text-slate-900`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Objectif Cible</label>
                      <input
                        type="number"
                        name="target_value"
                        step="0.01"
                        disabled={readOnly}
                        value={formData.target_value}
                        onChange={handleChange}
                        placeholder="0.00"
                        className={`${inputClasses} text-xl text-emerald-600 font-bold border-emerald-200 bg-emerald-50/30 focus:border-emerald-500`}
                      />
                    </div>
                  </div>
                </div>

                {/* Block Seuils */}
                <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-xl animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-100 rounded-lg shadow-sm">
                      <ShieldExclamationIcon className="h-6 w-6 text-orange-600" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 font-outfit">Alertes & Seuils</h2>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-orange-400 uppercase tracking-widest ml-1">Seuil d'Avertissement (Warning)</label>
                      <input
                        type="number"
                        name="threshold_warning"
                        step="0.01"
                        disabled={readOnly}
                        value={formData.threshold_warning}
                        onChange={handleChange}
                        placeholder="0.00"
                        className={`${inputClasses} border-orange-200 focus:border-orange-500 focus:ring-orange-500/10`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-red-400 uppercase tracking-widest ml-1">Seuil Critique</label>
                      <input
                        type="number"
                        name="threshold_critical"
                        step="0.01"
                        disabled={readOnly}
                        value={formData.threshold_critical}
                        onChange={handleChange}
                        placeholder="0.00"
                        className={`${inputClasses} border-red-200 focus:border-red-500 focus:ring-red-500/10`}
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Barre d'actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-8 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
              <Link
                to="/analytics"
                className="w-full sm:w-auto px-8 py-4 text-slate-500 font-bold hover:text-slate-800 transition-colors"
              >
                {canSubmit ? 'Annuler' : '← Retour aux indicateurs'}
              </Link>
              
              {canSubmit && (
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-2xl font-bold shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {saving ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <CheckCircleIcon className="h-6 w-6" />
                  )}
                  {isEdit ? 'Mettre à jour l\'indicateur' : 'Créer l\'indicateur'}
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInDown { animation: fadeInDown 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-fill-mode: both; }

        /* Disable arrow spinners on number inputs for a cleaner look */
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}