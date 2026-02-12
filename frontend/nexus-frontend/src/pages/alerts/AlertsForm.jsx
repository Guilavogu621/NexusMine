import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  BellAlertIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import {
  InputField,
  SelectField,
  TextareaField,
  Button,
  Card,
  FormSection,
  Alert,
} from '../../components/ui';
import PageHeader from '../../components/ui/PageHeader';
import { LoadingSpinner } from '../../components/ui/UIComponents';
import useFormPermissions from '../../hooks/useFormPermissions';
import ReadOnlyBanner from '../../components/ui/ReadOnlyBanner';

const alertTypeOptions = [
  { value: 'THRESHOLD_EXCEEDED', label: '📊 Seuil dépassé' },
  { value: 'SAFETY', label: '🦺 Sécurité' },
  { value: 'MAINTENANCE', label: '🔧 Maintenance' },
  { value: 'ENVIRONMENTAL', label: '🌿 Environnement' },
  { value: 'PRODUCTION', label: '⚙️ Production' },
  { value: 'INCIDENT', label: '⚠️ Incident' },
  { value: 'EQUIPMENT', label: '🚜 Équipement' },
  { value: 'STOCK', label: '📦 Stock' },
  { value: 'SYSTEM', label: '💻 Système' },
];

const severityOptions = [
  { value: 'LOW', label: '🟢 Basse' },
  { value: 'MEDIUM', label: '🟡 Moyenne' },
  { value: 'HIGH', label: '🟠 Haute' },
  { value: 'CRITICAL', label: '🔴 Critique' },
];

const statusOptions = [
  { value: 'NEW', label: '🆕 Nouvelle' },
  { value: 'READ', label: '👁️ Lue' },
  { value: 'IN_PROGRESS', label: '🔄 En cours' },
  { value: 'RESOLVED', label: '✅ Résolue' },
  { value: 'ARCHIVED', label: '📁 Archivée' },
];

export default function AlertsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { readOnly, canSubmit, roleBanner } = useFormPermissions('alerts');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [sites, setSites] = useState([]);
  
  const [formData, setFormData] = useState({
    alert_type: 'SYSTEM',
    severity: 'MEDIUM',
    status: 'NEW',
    title: '',
    message: '',
    site: '',
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
      const response = await api.get(`/alerts/${id}/`);
      setFormData({
        alert_type: response.data.alert_type || 'SYSTEM',
        severity: response.data.severity || 'MEDIUM',
        status: response.data.status || 'NEW',
        title: response.data.title || '',
        message: response.data.message || '',
        site: response.data.site || '',
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
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const dataToSend = {
        ...formData,
        site: formData.site || null,
      };

      if (isEdit) {
        await api.put(`/alerts/${id}/`, dataToSend);
      } else {
        await api.post('/alerts/', dataToSend);
      }
      setSuccess(true);
      setTimeout(() => navigate('/alerts'), 1500);
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
    return <LoadingSpinner text="Chargement de l'alerte..." />;
  }

  const siteOptions = [
    { value: '', label: '🌍 Tous les sites' },
    ...sites.map(site => ({ value: site.id, label: site.name }))
  ];

  // Get severity color for visual feedback
  const getSeverityColor = () => {
    const colors = {
      LOW: 'from-green-500 to-emerald-600',
      MEDIUM: 'from-yellow-500 to-amber-600',
      HIGH: 'from-orange-500 to-red-500',
      CRITICAL: 'from-red-600 to-rose-700',
    };
    return colors[formData.severity] || colors.MEDIUM;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <PageHeader
        title={isEdit ? 'Modifier l\'alerte' : 'Nouvelle alerte'}
        subtitle={isEdit ? 'Modifiez les informations de l\'alerte' : 'Créez une alerte manuelle pour signaler un événement'}
        backLink="/alerts"
        icon={BellAlertIcon}
        iconColor="bg-orange-500"
        breadcrumbs={[
          { label: 'Alertes', link: '/alerts' },
          { label: isEdit ? 'Modifier' : 'Nouvelle' },
        ]}
      />

      {success && (
        <Alert type="success" title="Succès !">
          {isEdit ? 'Alerte modifiée avec succès.' : 'Alerte créée avec succès.'} Redirection...
        </Alert>
      )}

      {error && (
        <Alert type="error" title="Erreur" onClose={() => setError(null)}>
          <pre className="whitespace-pre-line font-sans">{error}</pre>
        </Alert>
      )}

      <ReadOnlyBanner message={roleBanner} />

      <form onSubmit={readOnly ? (e) => e.preventDefault() : handleSubmit} className="space-y-6">
        {/* Severity indicator */}
        <div className={`bg-gradient-to-r ${getSeverityColor()} rounded-xl p-4 text-white`}>
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="h-8 w-8" />
            <div>
              <p className="font-semibold">Niveau de gravité : {severityOptions.find(s => s.value === formData.severity)?.label}</p>
              <p className="text-base opacity-90">L'alerte sera affichée avec cette priorité</p>
            </div>
          </div>
        </div>

        {/* Informations générales */}
        <Card>
          <FormSection
            title="Contenu de l'alerte"
            description="Titre et message de l'alerte"
            icon={DocumentTextIcon}
          >
            <div className="space-y-6">
              <InputField
                label="Titre de l'alerte"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Ex: Température critique détectée sur le site A"
                icon={BellAlertIcon}
              />

              <TextareaField
                label="Message détaillé"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Décrivez l'alerte en détail : contexte, mesures prises, actions requises..."
              />
            </div>
          </FormSection>
        </Card>

        {/* Classification */}
        <Card>
          <FormSection
            title="Classification"
            description="Type et gravité de l'alerte"
            icon={FlagIcon}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Type d'alerte"
                name="alert_type"
                value={formData.alert_type}
                onChange={handleChange}
                options={alertTypeOptions}
                required
              />

              <div>
                <label className="block text-base font-semibold text-slate-700 mb-2">
                  Gravité *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {severityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, severity: option.value }))}
                      className={`p-3 rounded-xl text-base font-medium transition-all ${
                        formData.severity === option.value
                          ? option.value === 'LOW' ? 'bg-green-500 text-white ring-2 ring-green-300'
                          : option.value === 'MEDIUM' ? 'bg-yellow-500 text-white ring-2 ring-yellow-300'
                          : option.value === 'HIGH' ? 'bg-orange-500 text-white ring-2 ring-orange-300'
                          : 'bg-red-600 text-white ring-2 ring-red-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-gray-200 border border-slate-200/60'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <SelectField
                label="Site concerné"
                name="site"
                value={formData.site}
                onChange={handleChange}
                options={siteOptions}
                icon={MapPinIcon}
              />

              <SelectField
                label="Statut"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={statusOptions}
                required
              />
            </div>
          </FormSection>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/alerts')}
          >
            {canSubmit ? 'Annuler' : '← Retour'}
          </Button>
          {canSubmit && (
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              icon={CheckCircleIcon}
            >
              {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer l\'alerte'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
