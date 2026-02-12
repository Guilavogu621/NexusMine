import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  BeakerIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useFormPermissions from '../../hooks/useFormPermissions';
import ReadOnlyBanner from '../../components/ui/ReadOnlyBanner';

export default function EnvironmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { readOnly, canSubmit, roleBanner } = useFormPermissions('environment');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [sites, setSites] = useState([]);
  
  const [formData, setFormData] = useState({
    data_type: 'OTHER',
    site: '',
    value: '',
    unit: '',
    measurement_date: '',
    measurement_time: '',
    location_details: '',
    notes: '',
  });

  // Emojis et couleurs par type
  const typeConfig = {
    AIR_QUALITY: { emoji: '🌬️', label: 'Qualité de l\'air', color: 'sky' },
    WATER_QUALITY: { emoji: '💧', label: 'Qualité de l\'eau', color: 'blue' },
    NOISE_LEVEL: { emoji: '🔊', label: 'Niveau sonore', color: 'purple' },
    DUST_LEVEL: { emoji: '🌫️', label: 'Niveau de poussière', color: 'amber' },
    PH_LEVEL: { emoji: '⚗️', label: 'Niveau pH', color: 'pink' },
    TEMPERATURE: { emoji: '🌡️', label: 'Température', color: 'red' },
    HUMIDITY: { emoji: '💦', label: 'Humidité', color: 'cyan' },
    OTHER: { emoji: '📊', label: 'Autre', color: 'gray' },
  };

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
      const response = await api.get(`/environmental-data/${id}/`);
      setFormData({
        data_type: response.data.data_type || 'OTHER',
        site: response.data.site || '',
        value: response.data.value || '',
        unit: response.data.unit || '',
        measurement_date: response.data.measurement_date || '',
        measurement_time: response.data.measurement_time || '',
        location_details: response.data.location_details || '',
        notes: response.data.notes || '',
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
    setError(null);
    setSaving(true);

    try {
      const dataToSend = {
        ...formData,
        measurement_time: formData.measurement_time || null,
      };

      if (isEdit) {
        await api.put(`/environmental-data/${id}/`, dataToSend);
      } else {
        await api.post('/environmental-data/', dataToSend);
      }
      navigate('/environment');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      if (error.response?.data) {
        const errors = Object.entries(error.response.data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        setError(errors);
      } else {
        setError('Une erreur est survenue');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-500 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  const currentType = typeConfig[formData.data_type] || typeConfig.OTHER;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Premium */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-600 shadow-2xl mb-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-20"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative px-8 py-10">
            <div className="flex items-center gap-6">
              <Link
                to="/environment"
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 group"
              >
                <ArrowLeftIcon className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
              </Link>
              
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-5xl">{isEdit ? currentType.emoji : '🌿'}</span>
                  <div>
                    <h1 className="text-2xl font-semibold text-white">
                      {isEdit ? 'Modifier la mesure' : 'Nouvelle mesure environnementale'}
                    </h1>
                    <p className="text-emerald-100 mt-1">
                      {isEdit ? `Modification de la mesure ${currentType.label}` : 'Enregistrez une nouvelle donnée environnementale'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Type Preview Badge */}
              {formData.data_type && (
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <span className="text-2xl">{currentType.emoji}</span>
                  <span className="text-white font-medium">{currentType.label}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-5 shadow-sm animate-shake">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-100 rounded-xl">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800">Erreur de validation</h3>
                <p className="text-red-600 text-base whitespace-pre-line mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <ReadOnlyBanner message={roleBanner} />

        <form onSubmit={readOnly ? (e) => e.preventDefault() : handleSubmit} className="space-y-6">
          
          {/* Section: Type et Site */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <BeakerIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-base font-semibold text-slate-800">Informations principales</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="data_type" className="block text-base font-semibold text-slate-700 mb-2">
                    Type de mesure <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="data_type"
                    name="data_type"
                    required
                    value={formData.data_type}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-0 py-3.5 px-4 text-slate-800 bg-slate-50 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 text-base font-medium"
                  >
                    {Object.entries(typeConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.emoji} {config.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="site" className="block text-base font-semibold text-slate-700 mb-2">
                    Site <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="site"
                    name="site"
                    required
                    value={formData.site}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-0 py-3.5 px-4 text-slate-800 bg-slate-50 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 text-base font-medium"
                  >
                    <option value="">📍 Sélectionner un site</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>🏭 {site.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Valeur */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <span className="text-lg">📊</span>
                </div>
                <h2 className="text-base font-semibold text-slate-800">Données de mesure</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="value" className="block text-base font-semibold text-slate-700 mb-2">
                    Valeur mesurée <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="value"
                      name="value"
                      step="0.0001"
                      required
                      value={formData.value}
                      onChange={handleChange}
                      className="block w-full rounded-xl border-0 py-3.5 px-4 text-slate-800 bg-slate-50 ring-1 ring-inset ring-gray-200 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 text-base font-medium"
                      placeholder="Ex: 45.5"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="unit" className="block text-base font-semibold text-slate-700 mb-2">
                    Unité de mesure <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="unit"
                    name="unit"
                    required
                    value={formData.unit}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-0 py-3.5 px-4 text-slate-800 bg-slate-50 ring-1 ring-inset ring-gray-200 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 text-base font-medium"
                    placeholder="mg/L, dB, °C, %..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Date et Heure */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <CalendarDaysIcon className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-base font-semibold text-slate-800">Date et heure</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="measurement_date" className="block text-base font-semibold text-slate-700 mb-2">
                    Date de mesure <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="measurement_date"
                    name="measurement_date"
                    required
                    value={formData.measurement_date}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-0 py-3.5 px-4 text-slate-800 bg-slate-50 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 text-base font-medium"
                  />
                </div>
                
                <div>
                  <label htmlFor="measurement_time" className="block text-base font-semibold text-slate-700 mb-2">
                    Heure de mesure
                  </label>
                  <input
                    type="time"
                    id="measurement_time"
                    name="measurement_time"
                    value={formData.measurement_time}
                    onChange={handleChange}
                    className="block w-full rounded-xl border-0 py-3.5 px-4 text-slate-800 bg-slate-50 ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 text-base font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Localisation */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <MapPinIcon className="h-5 w-5 text-amber-600" />
                </div>
                <h2 className="text-base font-semibold text-slate-800">Localisation</h2>
              </div>
            </div>
            
            <div className="p-6">
              <label htmlFor="location_details" className="block text-base font-semibold text-slate-700 mb-2">
                Emplacement précis
              </label>
              <input
                type="text"
                id="location_details"
                name="location_details"
                value={formData.location_details}
                onChange={handleChange}
                className="block w-full rounded-xl border-0 py-3.5 px-4 text-slate-800 bg-slate-50 ring-1 ring-inset ring-gray-200 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 text-base"
                placeholder="Zone d'extraction nord, point de mesure 3..."
              />
            </div>
          </div>

          {/* Section: Notes */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-200 rounded-xl">
                  <DocumentTextIcon className="h-5 w-5 text-slate-500" />
                </div>
                <h2 className="text-base font-semibold text-slate-800">Notes additionnelles</h2>
              </div>
            </div>
            
            <div className="p-6">
              <label htmlFor="notes" className="block text-base font-semibold text-slate-700 mb-2">
                Observations
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                className="block w-full rounded-xl border-0 py-3.5 px-4 text-slate-800 bg-slate-50 ring-1 ring-inset ring-gray-200 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all duration-200 text-base resize-none"
                placeholder="Conditions météo, observations particulières, contexte de la mesure..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <Link
              to="/environment"
              className="inline-flex items-center gap-2 px-6 py-3 text-slate-500 hover:text-slate-800 font-medium transition-colors rounded-xl hover:bg-slate-100"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              {canSubmit ? 'Annuler' : 'Retour'}
            </Link>
            
            {canSubmit && (
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-sm"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5" />
                    {isEdit ? 'Mettre à jour' : 'Enregistrer la mesure'}
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
