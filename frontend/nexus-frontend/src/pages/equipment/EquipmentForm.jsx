import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  WrenchScrewdriverIcon,
  CogIcon,
  MapPinIcon,
  CalendarIcon,
  BuildingStorefrontIcon,
  HashtagIcon,
  CheckIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import {
  InputField,
  SelectField,
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

const EQUIPMENT_TYPES = [
  { value: 'EXCAVATOR', label: '🏗️ Pelle excavatrice' },
  { value: 'TRUCK', label: '🚛 Camion' },
  { value: 'LOADER', label: '🚜 Chargeuse' },
  { value: 'DRILL', label: '🔩 Foreuse' },
  { value: 'CRUSHER', label: '⚙️ Concasseur' },
  { value: 'CONVEYOR', label: '🛤️ Convoyeur' },
  { value: 'PUMP', label: '💧 Pompe' },
  { value: 'GENERATOR', label: '⚡ Générateur' },
  { value: 'OTHER', label: '📦 Autre' },
];

const STATUS_OPTIONS = [
  { value: 'OPERATIONAL', label: 'Opérationnel', color: 'success' },
  { value: 'MAINTENANCE', label: 'En maintenance', color: 'warning' },
  { value: 'BREAKDOWN', label: 'En panne', color: 'danger' },
  { value: 'RETIRED', label: 'Hors service', color: 'default' },
];

export default function EquipmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { readOnly, canSubmit, roleBanner } = useFormPermissions('equipment');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [sites, setSites] = useState([]);
  
  const [formData, setFormData] = useState({
    equipment_code: '',
    name: '',
    equipment_type: 'OTHER',
    status: 'OPERATIONAL',
    site: '',
    commissioning_date: '',
    manufacturer: '',
    model: '',
    serial_number: '',
  });

  useEffect(() => {
    fetchSites();
    if (isEdit) {
      fetchEquipment();
    } else {
      generateEquipmentCode();
    }
  }, [id]);

  const generateEquipmentCode = () => {
    const code = `EQP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    setFormData(prev => ({ ...prev, equipment_code: code }));
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

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/equipment/${id}/`);
      setFormData({
        equipment_code: response.data.equipment_code || '',
        name: response.data.name || '',
        equipment_type: response.data.equipment_type || 'OTHER',
        status: response.data.status || 'OPERATIONAL',
        site: response.data.site || '',
        commissioning_date: response.data.commissioning_date || '',
        manufacturer: response.data.manufacturer || '',
        model: response.data.model || '',
        serial_number: response.data.serial_number || '',
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
        commissioning_date: formData.commissioning_date || null,
      };

      if (isEdit) {
        await api.put(`/equipment/${id}/`, dataToSend);
      } else {
        await api.post('/equipment/', dataToSend);
      }
      
      setSuccess(true);
      setTimeout(() => navigate('/equipment'), 1500);
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
      OPERATIONAL: 'bg-green-100 text-green-700 border-green-200',
      MAINTENANCE: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      BREAKDOWN: 'bg-orange-100 text-orange-700 border-orange-200',
      RETIRED: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || colors.RETIRED;
  };

  if (loading) {
    return <LoadingSpinner text="Chargement de l'équipement..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <PageHeader
        title={isEdit ? 'Modifier l\'équipement' : 'Nouvel équipement'}
        subtitle={isEdit ? 'Modifiez les informations de l\'équipement' : 'Ajoutez un nouvel équipement au parc'}
        backLink="/equipment"
        icon={WrenchScrewdriverIcon}
        iconColor="bg-amber-500"
        breadcrumbs={[
          { label: 'Équipements', link: '/equipment' },
          { label: isEdit ? 'Modifier' : 'Nouveau' },
        ]}
      />

      {success && (
        <Alert type="success" title="Succès !">
          {isEdit ? 'Équipement modifié avec succès.' : 'Équipement ajouté avec succès.'} Redirection...
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
            title="Identification"
            description="Informations de base de l'équipement"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <InputField
                label="Code équipement"
                name="equipment_code"
                value={formData.equipment_code}
                onChange={handleChange}
                required
                placeholder="EQP-0001"
                icon={HashtagIcon}
                disabled={readOnly}
              />

              <InputField
                label="Nom de l'équipement"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ex: Excavatrice Caterpillar 390F"
                icon={CubeIcon}
                disabled={readOnly}
              />

              <SelectField
                label="Type d'équipement"
                name="equipment_type"
                value={formData.equipment_type}
                onChange={handleChange}
                required
                options={EQUIPMENT_TYPES}
                disabled={readOnly}
              />

              <SelectField
                label="Site d'affectation"
                name="site"
                value={formData.site}
                onChange={handleChange}
                required
                options={sites}
                placeholder="Sélectionner un site"
                icon={MapPinIcon}
                disabled={readOnly}
              />
            </div>
          </FormSection>
        </Card>

        {/* Statut */}
        <Card>
          <FormSection
            title="État de l'équipement"
            description="Statut opérationnel actuel"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {STATUS_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`
                    flex items-center justify-center gap-2 p-4 rounded-xl cursor-pointer
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
                  <div>
                    <CogIcon className={`h-6 w-6 mx-auto mb-1 ${formData.status === option.value ? '' : 'text-slate-400'}`} />
                    <span className="font-medium text-base">{option.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </FormSection>
        </Card>

        {/* Détails techniques */}
        <Card>
          <FormSection
            title="Détails techniques"
            description="Informations du fabricant et modèle"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <InputField
                label="Fabricant"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                placeholder="Ex: Caterpillar"
                icon={BuildingStorefrontIcon}
              />

              <InputField
                label="Modèle"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Ex: 390F L"
              />

              <InputField
                label="Numéro de série"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                placeholder="Ex: CAT0390FL12345"
              />
            </div>

            <div className="mt-6">
              <label className="flex items-center gap-1 text-base font-semibold text-slate-700 mb-2">
                <CalendarIcon className="h-4 w-4" />
                Date de mise en service
              </label>
              <input
                type="date"
                name="commissioning_date"
                value={formData.commissioning_date}
                onChange={handleChange}
                className="block w-full md:w-1/3 rounded-xl border-0 py-3 px-4 bg-slate-50 text-slate-800 ring-1 ring-inset ring-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-base hover:ring-gray-300"
              />
            </div>
          </FormSection>
        </Card>

        {/* Résumé */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${getStatusColor(formData.status)}`}>
              <WrenchScrewdriverIcon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-slate-800">{formData.name || 'Nouvel équipement'}</h4>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="default">{formData.equipment_code}</Badge>
                <Badge variant={formData.status === 'OPERATIONAL' ? 'success' : formData.status === 'MAINTENANCE' ? 'warning' : 'danger'}>
                  {STATUS_OPTIONS.find(s => s.value === formData.status)?.label}
                </Badge>
                <Badge variant="purple">
                  {EQUIPMENT_TYPES.find(t => t.value === formData.equipment_type)?.label}
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
            onClick={() => navigate('/equipment')}
          >
            {canSubmit ? 'Annuler' : '← Retour'}
          </Button>
          {canSubmit && (
            <Button
              type="submit"
              variant="warning"
              loading={saving}
              icon={CheckIcon}
            >
              {isEdit ? 'Enregistrer les modifications' : 'Ajouter l\'équipement'}
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
      `}</style>
    </div>
  );
}
