import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  DocumentTextIcon,
  MapPinIcon,
  CalendarIcon,
  DocumentDuplicateIcon,
  PencilSquareIcon,
  CheckIcon,
  PaperAirplaneIcon,
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

const REPORT_TYPES = [
  { value: 'DAILY', label: '📅 Rapport journalier' },
  { value: 'WEEKLY', label: '📆 Rapport hebdomadaire' },
  { value: 'MONTHLY', label: '📊 Rapport mensuel' },
  { value: 'QUARTERLY', label: '📈 Rapport trimestriel' },
  { value: 'ANNUAL', label: '📋 Rapport annuel' },
  { value: 'INCIDENT', label: '⚠️ Rapport d\'incident' },
  { value: 'AUDIT', label: '🔍 Rapport d\'audit' },
];

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Brouillon', color: 'default', icon: '📝' },
  { value: 'PENDING', label: 'En attente', color: 'warning', icon: '⏳' },
  { value: 'APPROVED', label: 'Approuvé', color: 'success', icon: '✅' },
  { value: 'REJECTED', label: 'Rejeté', color: 'danger', icon: '❌' },
];

export default function ReportsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { readOnly, canSubmit, roleBanner } = useFormPermissions('reports');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [sites, setSites] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    report_type: 'MONTHLY',
    status: 'DRAFT',
    site: '',
    period_start: '',
    period_end: '',
    summary: '',
    content: '',
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
      const sitesData = response.data.results || response.data;
      setSites(sitesData.map(site => ({ value: site.id, label: site.name })));
    } catch (error) {
      console.error('Erreur lors du chargement des sites:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reports/${id}/`);
      setFormData({
        title: response.data.title || '',
        report_type: response.data.report_type || 'MONTHLY',
        status: response.data.status || 'DRAFT',
        site: response.data.site || '',
        period_start: response.data.period_start || '',
        period_end: response.data.period_end || '',
        summary: response.data.summary || '',
        content: response.data.content || '',
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

  const handleSubmit = async (e, submitForApproval = false) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const dataToSend = {
        ...formData,
        site: formData.site || null,
        status: submitForApproval ? 'PENDING' : formData.status,
      };

      if (isEdit) {
        await api.put(`/reports/${id}/`, dataToSend);
      } else {
        await api.post('/reports/', dataToSend);
      }
      
      setSuccess(true);
      setTimeout(() => navigate('/reports'), 1500);
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

  const getStatusColor = (status) => {
    const colors = {
      DRAFT: 'bg-slate-100 text-slate-600 border-slate-200/60',
      PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      APPROVED: 'bg-green-100 text-green-700 border-green-200',
      REJECTED: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || colors.DRAFT;
  };

  if (loading) {
    return <LoadingSpinner text="Chargement du rapport..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <PageHeader
        title={isEdit ? 'Modifier le rapport' : 'Nouveau rapport'}
        subtitle={isEdit ? 'Modifiez le contenu du rapport' : 'Créez un nouveau rapport'}
        backLink="/reports"
        icon={DocumentTextIcon}
        iconColor="bg-purple-500"
        breadcrumbs={[
          { label: 'Rapports', link: '/reports' },
          { label: isEdit ? 'Modifier' : 'Nouveau' },
        ]}
      />

      {success && (
        <Alert type="success" title="Succès !">
          {isEdit ? 'Rapport modifié avec succès.' : 'Rapport créé avec succès.'} Redirection...
        </Alert>
      )}

      {error && (
        <Alert type="error" title="Erreur" onClose={() => setError(null)}>
          <pre className="whitespace-pre-line font-sans">{error}</pre>
        </Alert>
      )}

      <ReadOnlyBanner message={roleBanner} />

      <form onSubmit={readOnly ? (e) => e.preventDefault() : handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <Card>
          <FormSection
            title="Informations du rapport"
            description="Titre et classification"
          >
            <div className="grid grid-cols-1 gap-6 mt-4">
              <InputField
                label="Titre du rapport"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Ex: Rapport mensuel de production - Janvier 2026"
                icon={PencilSquareIcon}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField
                  label="Type de rapport"
                  name="report_type"
                  value={formData.report_type}
                  onChange={handleChange}
                  required
                  options={REPORT_TYPES}
                  icon={DocumentDuplicateIcon}
                />

                <SelectField
                  label="Site concerné"
                  name="site"
                  value={formData.site}
                  onChange={handleChange}
                  options={sites}
                  placeholder="Tous les sites"
                  icon={MapPinIcon}
                />
              </div>
            </div>
          </FormSection>
        </Card>

        {/* Période */}
        <Card>
          <FormSection
            title="Période du rapport"
            description="Dates de début et de fin"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="flex items-center gap-1 text-base font-semibold text-slate-700 mb-2">
                  <CalendarIcon className="h-4 w-4" />
                  Date de début *
                </label>
                <input
                  type="date"
                  name="period_start"
                  value={formData.period_start}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-xl border-0 py-3 px-4 bg-slate-50 text-base text-slate-800 ring-1 ring-inset ring-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200 hover:ring-gray-300"
                />
              </div>

              <div>
                <label className="flex items-center gap-1 text-base font-semibold text-slate-700 mb-2">
                  <CalendarIcon className="h-4 w-4" />
                  Date de fin *
                </label>
                <input
                  type="date"
                  name="period_end"
                  value={formData.period_end}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-xl border-0 py-3 px-4 bg-slate-50 text-base text-slate-800 ring-1 ring-inset ring-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200 hover:ring-gray-300"
                />
              </div>
            </div>

            {/* Visualisation de la période */}
            {formData.period_start && formData.period_end && (
              <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-sm text-purple-600 font-medium">DÉBUT</p>
                    <p className="text-lg font-bold text-purple-900">
                      {new Date(formData.period_start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="h-0.5 bg-purple-300 relative">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-purple-600 font-medium">FIN</p>
                    <p className="text-lg font-bold text-purple-900">
                      {new Date(formData.period_end).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </FormSection>
        </Card>

        {/* Statut */}
        <Card>
          <FormSection
            title="Statut du rapport"
            description="État actuel du document"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {STATUS_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer
                    border-2 transition-all duration-200 text-center
                    ${formData.status === option.value 
                      ? getStatusColor(option.value) + ' border-current shadow-sm'
                      : 'bg-slate-50 border-slate-200/60 hover:border-gray-300'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={formData.status === option.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="text-2xl">{option.icon}</span>
                  <span className="font-medium text-base">{option.label}</span>
                </label>
              ))}
            </div>
          </FormSection>
        </Card>

        {/* Contenu */}
        <Card>
          <FormSection
            title="Contenu du rapport"
            description="Résumé et détails"
          >
            <div className="space-y-4 mt-4">
              <TextareaField
                label="Résumé exécutif"
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                placeholder="Résumé des points clés du rapport..."
                rows={3}
              />

              <TextareaField
                label="Contenu détaillé"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                placeholder="Rédigez le contenu complet du rapport ici..."
                rows={10}
              />
            </div>
          </FormSection>
        </Card>

        {/* Résumé */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${getStatusColor(formData.status)}`}>
              <DocumentTextIcon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-slate-800">{formData.title || 'Nouveau rapport'}</h4>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="purple">
                  {REPORT_TYPES.find(t => t.value === formData.report_type)?.label}
                </Badge>
                <Badge variant={
                  formData.status === 'APPROVED' ? 'success' : 
                  formData.status === 'PENDING' ? 'warning' : 
                  formData.status === 'REJECTED' ? 'danger' : 'default'
                }>
                  {STATUS_OPTIONS.find(s => s.value === formData.status)?.label}
                </Badge>
                {formData.period_start && formData.period_end && (
                  <Badge variant="default">
                    {new Date(formData.period_start).toLocaleDateString('fr-FR')} - {new Date(formData.period_end).toLocaleDateString('fr-FR')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/reports')}
          >
            {canSubmit ? 'Annuler' : '← Retour'}
          </Button>
          
          {canSubmit && (
            <div className="flex gap-3">
              <Button
                type="submit"
                variant="secondary"
                loading={saving}
                icon={CheckIcon}
              >
                Enregistrer comme brouillon
              </Button>
              <Button
                type="button"
                variant="primary"
                loading={saving}
                icon={PaperAirplaneIcon}
                onClick={(e) => handleSubmit(e, true)}
              >
                Soumettre pour approbation
              </Button>
            </div>
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
