import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  ShieldExclamationIcon,
  CheckIcon,
  TagIcon,
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
  Badge,
} from '../../components/ui';
import PageHeader from '../../components/ui/PageHeader';
import { LoadingSpinner } from '../../components/ui/UIComponents';
import useFormPermissions from '../../hooks/useFormPermissions';
import ReadOnlyBanner from '../../components/ui/ReadOnlyBanner';

const INCIDENT_TYPES = [
  { value: 'SAFETY', label: '🛡️ Sécurité' },
  { value: 'EQUIPMENT', label: '🔧 Équipement' },
  { value: 'ENVIRONMENTAL', label: '🌿 Environnement' },
  { value: 'OPERATIONAL', label: '⚙️ Opérationnel' },
  { value: 'OTHER', label: '📋 Autre' },
];

const SEVERITY_OPTIONS = [
  { value: 'LOW', label: 'Faible', color: 'success' },
  { value: 'MEDIUM', label: 'Moyen', color: 'warning' },
  { value: 'HIGH', label: 'Élevé', color: 'danger' },
  { value: 'CRITICAL', label: 'Critique', color: 'danger' },
];

const STATUS_OPTIONS = [
  { value: 'REPORTED', label: 'Signalé' },
  { value: 'INVESTIGATING', label: 'En investigation' },
  { value: 'IN_PROGRESS', label: 'En cours de résolution' },
  { value: 'RESOLVED', label: 'Résolu' },
  { value: 'CLOSED', label: 'Clôturé' },
];

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
    if (isEdit) {
      fetchIncident();
    } else {
      // Générer un code automatique
      generateIncidentCode();
    }
  }, [id]);

  const generateIncidentCode = () => {
    const date = new Date();
    const code = `INC-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    setFormData(prev => ({ ...prev, incident_code: code }));
  };

  const fetchSites = async () => {
    try {
      const response = await api.get('/sites/');
      const sitesData = response.data.results || response.data;
      setSites(sitesData.map(site => ({ value: site.id, label: site.name })));
    } catch (error) {
      console.error('Erreur lors du chargement des sites:', error);
    }
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
        time: formData.time || null,
      };

      if (isEdit) {
        await api.put(`/incidents/${id}/`, dataToSend);
      } else {
        await api.post('/incidents/', dataToSend);
      }
      
      setSuccess(true);
      setTimeout(() => navigate('/incidents'), 1500);
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

  const getSeverityColor = (severity) => {
    const colors = {
      LOW: 'bg-green-100 text-green-700 border-green-200',
      MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
      CRITICAL: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[severity] || colors.LOW;
  };

  if (loading) {
    return <LoadingSpinner text="Chargement de l'incident..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <PageHeader
        title={isEdit ? 'Modifier l\'incident' : 'Déclarer un incident'}
        subtitle={isEdit ? 'Modifiez les informations de l\'incident' : 'Enregistrez un nouvel incident'}
        backLink="/incidents"
        icon={ExclamationTriangleIcon}
        iconColor="bg-red-500"
        breadcrumbs={[
          { label: 'Incidents', link: '/incidents' },
          { label: isEdit ? 'Modifier' : 'Nouveau' },
        ]}
      />

      {success && (
        <Alert type="success" title="Succès !">
          {isEdit ? 'Incident modifié avec succès.' : 'Incident déclaré avec succès.'} Redirection...
        </Alert>
      )}

      {error && (
        <Alert type="error" title="Erreur" onClose={() => setError(null)}>
          <pre className="whitespace-pre-line font-sans">{error}</pre>
        </Alert>
      )}

      <ReadOnlyBanner message={roleBanner} />

      <form onSubmit={readOnly ? (e) => e.preventDefault() : handleSubmit} className="space-y-6">
        {/* Identification */}
        <Card>
          <FormSection
            title="Identification de l'incident"
            description="Code et classification de l'incident"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <InputField
                label="Code incident"
                name="incident_code"
                value={formData.incident_code}
                onChange={handleChange}
                required
                placeholder="INC-20260201-001"
                icon={TagIcon}
              />

              <SelectField
                label="Type d'incident"
                name="incident_type"
                value={formData.incident_type}
                onChange={handleChange}
                required
                options={INCIDENT_TYPES}
              />

              <SelectField
                label="Site concerné"
                name="site"
                value={formData.site}
                onChange={handleChange}
                required
                options={sites}
                placeholder="Sélectionner un site"
                icon={MapPinIcon}
              />
            </div>
          </FormSection>
        </Card>

        {/* Date et heure */}
        <Card>
          <FormSection
            title="Date et heure"
            description="Moment de l'incident"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="flex items-center gap-1 text-base font-semibold text-slate-700 mb-2">
                  <CalendarIcon className="h-4 w-4" />
                  Date de l'incident *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-xl border-0 py-3 px-4 bg-slate-50 text-slate-800 ring-1 ring-inset ring-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-base hover:ring-gray-300"
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-base font-semibold text-slate-700 mb-2">
                  <ClockIcon className="h-4 w-4" />
                  Heure (optionnel)
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="block w-full rounded-xl border-0 py-3 px-4 bg-slate-50 text-slate-800 ring-1 ring-inset ring-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-base hover:ring-gray-300"
                />
              </div>
            </div>
          </FormSection>
        </Card>

        {/* Sévérité et Statut */}
        <Card>
          <FormSection
            title="Évaluation"
            description="Niveau de gravité et état de traitement"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Sévérité avec badges visuels */}
              <div>
                <label className="block text-base font-semibold text-slate-700 mb-3">
                  Niveau de sévérité *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {SEVERITY_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`
                        flex items-center justify-center gap-2 p-3 rounded-xl cursor-pointer
                        border-2 transition-all duration-200
                        ${formData.severity === option.value 
                          ? getSeverityColor(option.value) + ' border-current'
                          : 'bg-slate-50 border-slate-200/60 hover:border-gray-300'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="severity"
                        value={option.value}
                        checked={formData.severity === option.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <ShieldExclamationIcon className="h-5 w-5" />
                      <span className="font-medium text-base">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <SelectField
                label="Statut"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                options={STATUS_OPTIONS}
              />
            </div>
          </FormSection>
        </Card>

        {/* Description */}
        <Card>
          <FormSection
            title="Description détaillée"
            description="Décrivez l'incident en détail"
          >
            <div className="space-y-4 mt-4">
              <TextareaField
                label="Description de l'incident"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Décrivez ce qui s'est passé, les circonstances, les personnes impliquées..."
                rows={5}
              />

              <TextareaField
                label="Actions prises"
                name="actions_taken"
                value={formData.actions_taken}
                onChange={handleChange}
                placeholder="Décrivez les mesures prises ou à prendre pour résoudre l'incident..."
                rows={4}
              />
            </div>
          </FormSection>
        </Card>

        {/* Résumé avant soumission */}
        <Card className="bg-slate-50 border-slate-200/60">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${getSeverityColor(formData.severity)}`}>
              <ExclamationTriangleIcon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-slate-800">Résumé de l'incident</h4>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="default">{formData.incident_code || 'Code à générer'}</Badge>
                <Badge variant={formData.severity === 'CRITICAL' || formData.severity === 'HIGH' ? 'danger' : formData.severity === 'MEDIUM' ? 'warning' : 'success'}>
                  Sévérité: {SEVERITY_OPTIONS.find(s => s.value === formData.severity)?.label}
                </Badge>
                <Badge variant="primary">
                  {INCIDENT_TYPES.find(t => t.value === formData.incident_type)?.label}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/incidents')}
          >
            {canSubmit ? 'Annuler' : '← Retour'}
          </Button>
          {canSubmit && (
            <Button
              type="submit"
              variant={formData.severity === 'CRITICAL' || formData.severity === 'HIGH' ? 'danger' : 'primary'}
              loading={saving}
              icon={CheckIcon}
            >
              {isEdit ? 'Enregistrer les modifications' : 'Déclarer l\'incident'}
            </Button>
          )}
        </div>
      </form>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        form > div {
          animation: fadeIn 0.4s ease-out forwards;
        }
        form > div:nth-child(1) { animation-delay: 0.05s; opacity: 0; }
        form > div:nth-child(2) { animation-delay: 0.1s; opacity: 0; }
        form > div:nth-child(3) { animation-delay: 0.15s; opacity: 0; }
        form > div:nth-child(4) { animation-delay: 0.2s; opacity: 0; }
        form > div:nth-child(5) { animation-delay: 0.25s; opacity: 0; }
      `}</style>
    </div>
  );
}
