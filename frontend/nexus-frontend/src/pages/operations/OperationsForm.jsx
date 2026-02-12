import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  CogIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  CubeIcon,
  PlayIcon,
  CheckIcon,
  HashtagIcon,
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
import { LoadingSpinner, ProgressBar } from '../../components/ui/UIComponents';
import useFormPermissions from '../../hooks/useFormPermissions';
import ReadOnlyBanner from '../../components/ui/ReadOnlyBanner';

/* ---------------- CONSTANTES ---------------- */

const OPERATION_TYPES = [
  { value: 'EXTRACTION', label: '⛏️ Extraction' },
  { value: 'PROCESSING', label: '⚙️ Traitement' },
  { value: 'TRANSPORT', label: '🚛 Transport' },
  { value: 'DRILLING', label: '🔩 Forage' },
  { value: 'BLASTING', label: '💥 Dynamitage' },
  { value: 'LOADING', label: '🏗️ Chargement' },
  { value: 'MAINTENANCE', label: '🔧 Maintenance' },
  { value: 'OTHER', label: '📋 Autre' },
];

const STATUS_OPTIONS = [
  { value: 'PLANNED', label: 'Planifié', icon: '📅' },
  { value: 'IN_PROGRESS', label: 'En cours', icon: '🔄' },
  { value: 'COMPLETED', label: 'Terminé', icon: '✅' },
  { value: 'CANCELLED', label: 'Annulé', icon: '❌' },
];

/* ---------------- COMPOSANT ---------------- */

export default function OperationsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { readOnly, canSubmit, roleBanner } = useFormPermissions('operations');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [sites, setSites] = useState([]);

  const [formData, setFormData] = useState({
    operation_code: '',
    operation_type: 'EXTRACTION',
    site: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '',
    end_time: '',
    status: 'PLANNED',
    description: '',
    quantity_extracted: '',
  });

  useEffect(() => {
    fetchSites();
    isEdit ? fetchOperation() : generateOperationCode();
  }, [id]);

  const generateOperationCode = () => {
    const d = new Date();
    const code = `OP-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`;
    setFormData(p => ({ ...p, operation_code: code }));
  };

  const fetchSites = async () => {
    const res = await api.get('/sites/');
    const data = res.data.results || res.data;
    setSites(data.map(s => ({ value: s.id, label: s.name })));
  };

  const fetchOperation = async () => {
    setLoading(true);
    const res = await api.get(`/operations/${id}/`);
    setFormData({
      operation_code: res.data.operation_code || '',
      operation_type: res.data.operation_type || 'EXTRACTION',
      site: res.data.site || '',
      date: res.data.date || '',
      start_time: res.data.start_time || '',
      end_time: res.data.end_time || '',
      status: res.data.status || 'PLANNED',
      description: res.data.description || '',
      quantity_extracted: res.data.quantity_extracted || '',
    });
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    setError(null);
  };

  const getStatusClasses = (active) =>
    active
      ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg'
      : 'bg-white border-slate-200 hover:border-slate-300';

  if (loading) return <LoadingSpinner text="Chargement..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">

      <PageHeader
        title={isEdit ? "Modifier l'opération" : 'Nouvelle opération'}
        subtitle="Gestion des opérations minières"
        backLink="/operations"
        icon={CogIcon}
        iconColor="bg-indigo-600"
      />

      {error && (
        <Alert type="error" title="Erreur" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <ReadOnlyBanner message={roleBanner} />

      <form className="space-y-6">

        {/* IDENTIFICATION */}
        <Card className="bg-white border border-slate-200/60 shadow-sm">
          <FormSection title="Identification" description="Données générales">
            <div className="grid md:grid-cols-3 gap-6 mt-4">
              <InputField label="Code" name="operation_code" value={formData.operation_code} onChange={handleChange} icon={HashtagIcon} disabled={readOnly} />
              <SelectField label="Type" name="operation_type" value={formData.operation_type} onChange={handleChange} options={OPERATION_TYPES} disabled={readOnly} />
              <SelectField label="Site" name="site" value={formData.site} onChange={handleChange} options={sites} icon={MapPinIcon} disabled={readOnly} />
            </div>
          </FormSection>
        </Card>

        {/* PLANIFICATION */}
        <Card className="bg-white border border-slate-200/60 shadow-sm">
          <FormSection title="Planification" description="Date et horaires">
            <div className="grid md:grid-cols-3 gap-6 mt-4">
              <input type="date" name="date" value={formData.date} onChange={handleChange} disabled={readOnly}
                className="w-full rounded-xl bg-white text-slate-800 ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-500 p-3 disabled:opacity-50"/>
              <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} disabled={readOnly}
                className="w-full rounded-xl bg-white text-slate-800 ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-500 p-3 disabled:opacity-50"/>
              <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} disabled={readOnly}
                className="w-full rounded-xl bg-white text-slate-800 ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-500 p-3 disabled:opacity-50"/>
            </div>
          </FormSection>
        </Card>

        {/* STATUT */}
        <Card className="bg-white border border-slate-200/60 shadow-sm">
          <FormSection title="Statut">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {STATUS_OPTIONS.map(s => (
                <label key={s.value}
                  className={`p-4 rounded-xl border text-center ${readOnly ? 'cursor-default opacity-70' : 'cursor-pointer'} transition-all ${getStatusClasses(formData.status === s.value)}`}>
                  <input type="radio" className="sr-only" name="status" value={s.value} onChange={handleChange} disabled={readOnly}/>
                  <div className="text-2xl">{s.icon}</div>
                  <div className="font-medium">{s.label}</div>
                </label>
              ))}
            </div>
            <div className="mt-6">
              <ProgressBar value={formData.status === 'COMPLETED' ? 100 : formData.status === 'IN_PROGRESS' ? 50 : 10} />
            </div>
          </FormSection>
        </Card>

        {/* PRODUCTION */}
        <Card className="bg-white border border-slate-200/60 shadow-sm">
          <FormSection title="Production">
            <InputField label="Quantité (t)" name="quantity_extracted" value={formData.quantity_extracted} onChange={handleChange} icon={CubeIcon} disabled={readOnly}/>
            <TextareaField label="Description" name="description" value={formData.description} onChange={handleChange} disabled={readOnly}/>
          </FormSection>
        </Card>

        {/* ACTIONS */}
        {canSubmit && (
          <div className="flex justify-end gap-4">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-800" onClick={() => navigate('/operations')}>
              Annuler
            </Button>
            <Button variant="primary" icon={isEdit ? CheckIcon : PlayIcon}
              className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
              {isEdit ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        )}
        {!canSubmit && (
          <div className="flex justify-end">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-800" onClick={() => navigate('/operations')}>
              ← Retour
            </Button>
          </div>
        )}

      </form>
    </div>
  );
}
