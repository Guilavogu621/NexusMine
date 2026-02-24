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
  ClockIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
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
import useAuthStore from '../../stores/authStore';

const REPORT_TYPES = [
  { value: 'DAILY', label: '📅 Rapport journalier' },
  { value: 'WEEKLY', label: '📆 Rapport hebdomadaire' },
  { value: 'MONTHLY', label: '📊 Rapport mensuel' },
  { value: 'QUARTERLY', label: '📈 Rapport trimestriel' },
  { value: 'ANNUAL', label: '📋 Rapport annuel' },
  { value: 'INCIDENT', label: '⚠️ Rapport d\'incident' },
  { value: 'AUDIT', label: '🔍 Rapport d\'audit' },
];

const STATUS_CONFIG = {
  DRAFT: { label: 'Brouillon', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: '📝', badge: 'default' },
  PENDING_APPROVAL: { label: 'En attente d\'approbation', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: '⏳', badge: 'warning' },
  GENERATED: { label: 'Généré', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: '✨', badge: 'info' },
  VALIDATED: { label: 'Validé', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '✅', badge: 'success' },
  PUBLISHED: { label: 'Publié', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: '📢', badge: 'success' },
};

export default function ReportsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { readOnly, canSubmit, roleBanner } = useFormPermissions('reports');
  const user = useAuthStore((s) => s.user);
  const isTechnicien = user?.role === 'TECHNICIEN';
  const isMMG = user?.role === 'MMG';

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

  // Check if approval is pending
  const isApprovalPending = formData.status === 'PENDING_APPROVAL';

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const sitesRes = await api.get('/sites/');
        const sitesData = sitesRes.data.results || sitesRes.data;
        setSites(sitesData.map(s => ({ value: s.id, label: s.name })));

        if (isEdit) {
          const reportRes = await api.get(`/reports/${id}/`);
          setFormData(reportRes.data);
        }
      } catch (err) {
        setError('Erreur lors du chargement des données.');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e, forceStatus = null) => {
    if (e) e.preventDefault();
    setSaving(true);

    try {
      // Pour TECHNICIEN: seul PENDING_APPROVAL ou DRAFT sont autorisés
      let finalStatus = forceStatus || formData.status;
      if (isTechnicien && !['DRAFT', 'PENDING_APPROVAL'].includes(finalStatus)) {
        finalStatus = 'DRAFT';
      }

      const payload = {
        ...formData,
        status: finalStatus
      };

      if (isEdit) {
        await api.put(`/reports/${id}/`, payload);
      } else {
        await api.post('/reports/', payload);
      }

      setSuccess(true);
      setTimeout(() => navigate('/reports'), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      setSaving(true);
      // Générer un PDF via le backend
      const response = await api.get(`/reports/${id}/generate_pdf/`, {
        responseType: 'blob'
      });

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${formData.title || 'rapport'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError('Erreur lors de l\'export du rapport.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Initialisation du rapport..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20 space-y-8 animate-fadeIn">
      <PageHeader
        title={isEdit ? 'Édition de Rapport' : 'Nouveau Rapport Technique'}
        subtitle="Gestion documentaire et suivi de conformité"
        backLink="/reports"
        icon={DocumentTextIcon}
        iconColor="bg-indigo-600"
      />

      {success && <Alert type="success">Action effectuée avec succès. Redirection...</Alert>}
      {error && <Alert type="error" title="Oups !">{error}</Alert>}
      <ReadOnlyBanner message={roleBanner} />

      {isApprovalPending && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 flex gap-4 items-start shadow-sm">
          <div className="p-3 bg-amber-100 rounded-xl flex-shrink-0">
            <ExclamationTriangleIcon className="h-6 w-6 text-amber-700" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-900 mb-1">En attente d'approbation</h3>
            <p className="text-sm text-amber-800">
              Ce rapport a été soumis pour approbation par le gestionnaire du site. Vous ne pouvez pas le modifier tant qu'il n'a pas été approuvé.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Colonne Principale : Formulaire */}
        <div className="lg:col-span-2 space-y-6">
          <form id="report-form" onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                  <PencilSquareIcon className="h-5 w-5" />
                  <h3 className="font-bold uppercase tracking-wider text-sm">Identification</h3>
                </div>

                <InputField
                  label="Titre du document"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={readOnly || isApprovalPending}
                  placeholder="Ex: Rapport de forage Q1 2026"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="Type de rapport"
                    name="report_type"
                    value={formData.report_type}
                    onChange={handleChange}
                    disabled={readOnly || isApprovalPending}
                    options={REPORT_TYPES}
                  />
                  <SelectField
                    label="Site d'exploitation"
                    name="site"
                    value={formData.site}
                    onChange={handleChange}
                    disabled={readOnly || isApprovalPending}
                    options={sites}
                    placeholder="Tous les sites"
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center gap-2 text-indigo-600 mb-6">
                  <CalendarIcon className="h-5 w-5" />
                  <h3 className="font-bold uppercase tracking-wider text-sm">Période de validité</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Début de période"
                    name="period_start"
                    type="date"
                    value={formData.period_start}
                    onChange={handleChange}
                    disabled={readOnly || isApprovalPending}
                    required
                  />
                  <InputField
                    label="Fin de période"
                    name="period_end"
                    type="date"
                    value={formData.period_end}
                    onChange={handleChange}
                    disabled={readOnly || isApprovalPending}
                    required
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6 space-y-6">
                <TextareaField
                  label="Résumé exécutif"
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  disabled={readOnly || isApprovalPending}
                  rows={3}
                  placeholder="Points clés pour la direction..."
                />
                <TextareaField
                  label="Corps du rapport"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  disabled={readOnly || isApprovalPending}
                  required
                  rows={12}
                  placeholder="Détails techniques, analyses et observations..."
                />
              </div>
            </Card>
          </form>
        </div>

        {/* Colonne Latérale : Statut & Info */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Statut actuel</h3>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                    // TECHNICIEN ne peut utiliser que DRAFT et PENDING_APPROVAL
                    if (isTechnicien && !['DRAFT', 'PENDING_APPROVAL'].includes(key)) {
                      return null;
                    }
                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={isApprovalPending || readOnly}
                        onClick={() => !isApprovalPending && !readOnly && setFormData(p => ({ ...p, status: key }))}
                        className={`
                          flex items-center gap-3 p-3 rounded-xl border-2 transition-all
                          ${isApprovalPending || readOnly ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                          ${formData.status === key
                            ? `${cfg.color} border-current ring-2 ring-offset-2 ring-indigo-500/20`
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}
                        `}
                      >
                        <span className="text-xl">{cfg.icon}</span>
                        <span className="font-bold text-sm">{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Récapitulatif</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Dernière modif.</span>
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <ClockIcon className="h-3 w-3" /> Aujourd'hui
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Mots</span>
                    <span className="font-bold text-slate-700">
                      {formData.content.split(/\s+/).filter(Boolean).length}
                    </span>
                  </div>
                </div>
              </div>

              {isMMG && isEdit && (
                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-500 font-medium mb-3">Audit et conformité</p>
                  <Button
                    fullWidth
                    variant="primary"
                    size="lg"
                    loading={saving}
                    icon={ArrowDownTrayIcon}
                    onClick={handleExport}
                  >
                    Télécharger PDF
                  </Button>
                  <Button
                    fullWidth
                    variant="secondary"
                    loading={saving}
                    onClick={() => navigate('/reports')}
                  >
                    Retour
                  </Button>
                </div>
              )}

              {canSubmit && !isApprovalPending && !isMMG && (
                <div className="space-y-3 pt-6">
                  {isTechnicien ? (
                    <>
                      <Button
                        fullWidth
                        variant="primary"
                        size="lg"
                        loading={saving}
                        icon={PaperAirplaneIcon}
                        onClick={() => handleSubmit(null, 'PENDING_APPROVAL')}
                      >
                        Soumettre pour approbation
                      </Button>
                      <Button
                        fullWidth
                        variant="secondary"
                        loading={saving}
                        icon={CheckIcon}
                        onClick={() => handleSubmit(null, 'DRAFT')}
                      >
                        Sauvegarder brouillon
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        fullWidth
                        variant="primary"
                        size="lg"
                        loading={saving}
                        icon={CheckIcon}
                        onClick={() => handleSubmit()}
                      >
                        Enregistrer
                      </Button>
                      <Button
                        fullWidth
                        variant="secondary"
                        loading={saving}
                        onClick={() => navigate('/reports')}
                      >
                        Annuler
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}