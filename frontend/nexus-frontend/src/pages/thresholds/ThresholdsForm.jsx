import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  AdjustmentsHorizontalIcon,
  BeakerIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import {
  InputField,
  SelectField,
  TextareaField,
  Switch,
  NumberField,
  Button,
  Card,
  FormSection,
  Alert,
} from '../../components/ui';
import PageHeader from '../../components/ui/PageHeader';
import { LoadingSpinner } from '../../components/ui/UIComponents';

const dataTypeOptions = [
  { value: 'AIR_QUALITY', label: '🌬️ Qualité de l\'air' },
  { value: 'WATER_QUALITY', label: '💧 Qualité de l\'eau' },
  { value: 'NOISE_LEVEL', label: '🔊 Niveau sonore' },
  { value: 'DUST_LEVEL', label: '💨 Niveau de poussière' },
  { value: 'PH_LEVEL', label: '⚗️ Niveau pH' },
  { value: 'TEMPERATURE', label: '🌡️ Température' },
  { value: 'HUMIDITY', label: '💦 Humidité' },
  { value: 'CO2_LEVEL', label: '☁️ Niveau CO2' },
  { value: 'PARTICULATE_MATTER', label: '🔬 Particules fines' },
  { value: 'OTHER', label: '📊 Autre' },
];

const thresholdTypeOptions = [
  { value: 'REGULATORY', label: '📋 Réglementaire' },
  { value: 'INTERNAL', label: '🏢 Interne' },
  { value: 'WARNING', label: '⚠️ Avertissement' },
];

export default function ThresholdsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [sites, setSites] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    data_type: 'AIR_QUALITY',
    threshold_type: 'INTERNAL',
    site: '',
    min_value: '',
    max_value: '',
    warning_min: '',
    warning_max: '',
    unit: '',
    regulatory_reference: '',
    description: '',
    is_active: true,
  });

  // eslint-disable-next-line no-unused-vars
  const [success, setSuccess] = useState(false);

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
      const response = await api.get(`/environmental-thresholds/${id}/`);
      setFormData({
        name: response.data.name || '',
        data_type: response.data.data_type || 'AIR_QUALITY',
        threshold_type: response.data.threshold_type || 'INTERNAL',
        site: response.data.site || '',
        min_value: response.data.min_value ?? '',
        max_value: response.data.max_value ?? '',
        warning_min: response.data.warning_min ?? '',
        warning_max: response.data.warning_max ?? '',
        unit: response.data.unit || '',
        regulatory_reference: response.data.regulatory_reference || '',
        description: response.data.description || '',
        is_active: response.data.is_active ?? true,
      });
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      const payload = {
        ...formData,
        site: formData.site || null,
        min_value: formData.min_value !== '' ? parseFloat(formData.min_value) : null,
        max_value: formData.max_value !== '' ? parseFloat(formData.max_value) : null,
        warning_min: formData.warning_min !== '' ? parseFloat(formData.warning_min) : null,
        warning_max: formData.warning_max !== '' ? parseFloat(formData.warning_max) : null,
      };
      
      if (isEdit) {
        await api.put(`/environmental-thresholds/${id}/`, payload);
      } else {
        await api.post('/environmental-thresholds/', payload);
      }
      
      navigate('/thresholds');
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      if (err.response?.data) {
        const errors = Object.entries(err.response.data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        setError(errors);
      } else {
        setError('Erreur lors de la sauvegarde');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Chargement du seuil..." />;
  }

  const siteOptions = [
    { value: '', label: '🌍 Tous les sites (global)' },
    ...sites.map(site => ({ value: site.id, label: site.name }))
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <PageHeader
        title={isEdit ? 'Modifier le seuil' : 'Nouveau seuil environnemental'}
        subtitle={isEdit ? 'Modifiez les paramètres du seuil' : 'Configurez les limites d\'alerte pour les mesures environnementales'}
        backLink="/thresholds"
        icon={AdjustmentsHorizontalIcon}
        iconColor="bg-teal-500"
        breadcrumbs={[
          { label: 'Seuils Environnementaux', link: '/thresholds' },
          { label: isEdit ? 'Modifier' : 'Nouveau' },
        ]}
      />

      {success && (
        <Alert type="success" title="Succès !">
          {isEdit ? 'Seuil modifié avec succès.' : 'Seuil créé avec succès.'} Redirection...
        </Alert>
      )}

      {error && (
        <Alert type="error" title="Erreur" onClose={() => setError(null)}>
          <pre className="whitespace-pre-line font-sans">{error}</pre>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <Card>
          <FormSection
            title="Informations générales"
            description="Identifiez le type de mesure et le contexte"
            icon={BeakerIcon}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <InputField
                  label="Nom du seuil"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Limite PM2.5 réglementaire"
                  icon={DocumentTextIcon}
                />
              </div>

              <SelectField
                label="Type de mesure"
                name="data_type"
                value={formData.data_type}
                onChange={handleChange}
                options={dataTypeOptions}
                required
              />

              <SelectField
                label="Type de seuil"
                name="threshold_type"
                value={formData.threshold_type}
                onChange={handleChange}
                options={thresholdTypeOptions}
                required
              />

              <SelectField
                label="Site concerné"
                name="site"
                value={formData.site}
                onChange={handleChange}
                options={siteOptions}
                icon={MapPinIcon}
                helper="Laisser vide pour appliquer à tous les sites"
              />

              <InputField
                label="Unité de mesure"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                placeholder="Ex: µg/m³, dB, °C, pH"
              />
            </div>
          </FormSection>
        </Card>

        {/* Valeurs seuils critiques */}
        <Card>
          <FormSection
            title="Seuils critiques"
            description="Valeurs déclenchant une alerte rouge"
            icon={ExclamationTriangleIcon}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <label className="block text-base font-semibold text-red-700 mb-3">
                  ⬇️ Valeur minimale acceptable
                </label>
                <input
                  type="number"
                  step="any"
                  name="min_value"
                  value={formData.min_value}
                  onChange={handleChange}
                  placeholder="Laisser vide si non applicable"
                  className="w-full px-4 py-3 text-base border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                />
                <p className="text-sm text-red-600 mt-2">Valeur en dessous → Alerte critique</p>
              </div>

              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <label className="block text-base font-semibold text-red-700 mb-3">
                  ⬆️ Valeur maximale acceptable
                </label>
                <input
                  type="number"
                  step="any"
                  name="max_value"
                  value={formData.max_value}
                  onChange={handleChange}
                  placeholder="Laisser vide si non applicable"
                  className="w-full px-4 py-3 text-base border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                />
                <p className="text-sm text-red-600 mt-2">Valeur au-dessus → Alerte critique</p>
              </div>
            </div>
          </FormSection>
        </Card>

        {/* Seuils d'avertissement */}
        <Card>
          <FormSection
            title="Seuils d'avertissement"
            description="Pré-alertes avant d'atteindre les limites critiques"
            icon={CheckCircleIcon}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <label className="block text-base font-semibold text-amber-700 mb-3">
                  ⚠️ Avertissement minimum
                </label>
                <input
                  type="number"
                  step="any"
                  name="warning_min"
                  value={formData.warning_min}
                  onChange={handleChange}
                  placeholder="Pré-alerte avant limite min"
                  className="w-full px-4 py-3 text-base border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                />
                <p className="text-sm text-amber-600 mt-2">Alerte préventive</p>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <label className="block text-base font-semibold text-amber-700 mb-3">
                  ⚠️ Avertissement maximum
                </label>
                <input
                  type="number"
                  step="any"
                  name="warning_max"
                  value={formData.warning_max}
                  onChange={handleChange}
                  placeholder="Pré-alerte avant limite max"
                  className="w-full px-4 py-3 text-base border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                />
                <p className="text-sm text-amber-600 mt-2">Alerte préventive</p>
              </div>
            </div>
          </FormSection>
        </Card>

        {/* Informations complémentaires */}
        <Card>
          <FormSection
            title="Informations complémentaires"
            description="Références réglementaires et notes"
            icon={DocumentTextIcon}
          >
            <div className="space-y-6">
              <InputField
                label="Référence réglementaire"
                name="regulatory_reference"
                value={formData.regulatory_reference}
                onChange={handleChange}
                placeholder="Ex: Directive UE 2008/50/CE, Norme ISO 14001"
                helper="Texte de loi ou norme applicable"
              />

              <TextareaField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Description du seuil et contexte d'application..."
              />

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-medium text-slate-800">Seuil actif</p>
                  <p className="text-base text-slate-500">Activer pour déclencher des alertes automatiques</p>
                </div>
                <Switch
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
              </div>
            </div>
          </FormSection>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/thresholds')}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={saving}
            icon={CheckCircleIcon}
          >
            {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer le seuil'}
          </Button>
        </div>
      </form>
    </div>
  );
}
