import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import {
  InputField,
  SelectField,
  TextareaField,
  DateField,
  Button,
  Card,
  FormSection,
  Alert,
} from '../../components/ui';
import PageHeader from '../../components/ui/PageHeader';
import { LoadingSpinner } from '../../components/ui/UIComponents';

const shiftTypeOptions = [
  { value: 'DAY', label: '☀️ Jour (6h-18h)' },
  { value: 'NIGHT', label: '🌙 Nuit (18h-6h)' },
  { value: 'MORNING', label: '🌅 Matin (6h-14h)' },
  { value: 'AFTERNOON', label: '🌤️ Après-midi (14h-22h)' },
  { value: 'EVENING', label: '🌆 Soir (22h-6h)' },
];

export default function ShiftsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [sites, setSites] = useState([]);
  const [workZones, setWorkZones] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [equipment, setEquipment] = useState([]);
  
  const [formData, setFormData] = useState({
    site: '',
    date: new Date().toISOString().split('T')[0],
    shift_type: 'DAY',
    supervisor: '',
    work_zone: '',
    personnel_assigned: [],
    equipment_assigned: [],
    target_production: '',
    actual_production: '',
    notes: '',
  });

  // eslint-disable-next-line no-unused-vars
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSites();
    fetchPersonnel();
    fetchEquipment();
    if (isEdit) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    if (formData.site) {
      fetchWorkZones(formData.site);
    }
  }, [formData.site]);

  const fetchSites = async () => {
    try {
      const response = await api.get('/sites/');
      setSites(response.data.results || response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des sites:', error);
    }
  };

  const fetchWorkZones = async (siteId) => {
    try {
      const response = await api.get(`/work-zones/?site=${siteId}`);
      setWorkZones(response.data.results || response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des zones:', error);
    }
  };

  const fetchPersonnel = async () => {
    try {
      const response = await api.get('/personnel/');
      setPersonnel(response.data.results || response.data);
    } catch (error) {
      console.error('Erreur lors du chargement du personnel:', error);
    }
  };

  const fetchEquipment = async () => {
    try {
      const response = await api.get('/equipment/');
      setEquipment(response.data.results || response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des équipements:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/shifts/${id}/`);
      setFormData({
        site: response.data.site || '',
        date: response.data.date || new Date().toISOString().split('T')[0],
        shift_type: response.data.shift_type || 'DAY',
        supervisor: response.data.supervisor || '',
        work_zone: response.data.work_zone || '',
        personnel_assigned: response.data.personnel_assigned || [],
        equipment_assigned: response.data.equipment_assigned || [],
        target_production: response.data.target_production ?? '',
        actual_production: response.data.actual_production ?? '',
        notes: response.data.notes || '',
      });
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePersonnelToggle = (personnelId) => {
    setFormData((prev) => ({
      ...prev,
      personnel_assigned: prev.personnel_assigned.includes(personnelId)
        ? prev.personnel_assigned.filter(p => p !== personnelId)
        : [...prev.personnel_assigned, personnelId],
    }));
  };

  const handleEquipmentToggle = (equipmentId) => {
    setFormData((prev) => ({
      ...prev,
      equipment_assigned: prev.equipment_assigned.includes(equipmentId)
        ? prev.equipment_assigned.filter(e => e !== equipmentId)
        : [...prev.equipment_assigned, equipmentId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      const payload = {
        ...formData,
        site: parseInt(formData.site),
        supervisor: formData.supervisor ? parseInt(formData.supervisor) : null,
        work_zone: formData.work_zone ? parseInt(formData.work_zone) : null,
        target_production: formData.target_production !== '' ? parseFloat(formData.target_production) : null,
        actual_production: formData.actual_production !== '' ? parseFloat(formData.actual_production) : null,
      };
      
      if (isEdit) {
        await api.put(`/shifts/${id}/`, payload);
      } else {
        await api.post('/shifts/', payload);
      }
      
      navigate('/shifts');
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
    return <LoadingSpinner text="Chargement de la rotation..." />;
  }

  const siteOptions = sites.map(site => ({ value: site.id, label: site.name }));
  const zoneOptions = workZones.map(zone => ({ value: zone.id, label: `${zone.code} - ${zone.name}` }));
  const supervisorOptions = personnel
    .filter(p => p.position?.toLowerCase().includes('superv') || p.position?.toLowerCase().includes('chef'))
    .map(p => ({ value: p.id, label: `${p.first_name} ${p.last_name} - ${p.position}` }));

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <PageHeader
        title={isEdit ? 'Modifier la rotation' : 'Nouvelle rotation'}
        subtitle={isEdit ? 'Modifiez les paramètres du shift' : 'Planifiez un poste de travail pour une équipe'}
        backLink="/shifts"
        icon={ClockIcon}
        iconColor="bg-amber-500"
        breadcrumbs={[
          { label: 'Rotations', link: '/shifts' },
          { label: isEdit ? 'Modifier' : 'Nouvelle' },
        ]}
      />

      {success && (
        <Alert type="success" title="Succès !">
          {isEdit ? 'Rotation modifiée avec succès.' : 'Rotation créée avec succès.'} Redirection...
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
            title="Planification"
            description="Date, site et type de rotation"
            icon={CalendarIcon}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Site minier"
                name="site"
                value={formData.site}
                onChange={handleChange}
                options={[{ value: '', label: 'Sélectionner un site' }, ...siteOptions]}
                required
                icon={MapPinIcon}
              />

              <SelectField
                label="Zone de travail"
                name="work_zone"
                value={formData.work_zone}
                onChange={handleChange}
                options={[{ value: '', label: 'Sélectionner une zone (optionnel)' }, ...zoneOptions]}
              />

              <InputField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
                icon={CalendarIcon}
              />

              <SelectField
                label="Type de rotation"
                name="shift_type"
                value={formData.shift_type}
                onChange={handleChange}
                options={shiftTypeOptions}
                required
              />

              <div className="md:col-span-2">
                <SelectField
                  label="Superviseur"
                  name="supervisor"
                  value={formData.supervisor}
                  onChange={handleChange}
                  options={[{ value: '', label: 'Sélectionner un superviseur' }, ...supervisorOptions]}
                  icon={UsersIcon}
                />
              </div>
            </div>
          </FormSection>
        </Card>

        {/* Personnel */}
        <Card>
          <FormSection
            title="Personnel assigné"
            description="Sélectionnez les membres de l'équipe"
            icon={UsersIcon}
          >
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-semibold text-amber-700">
                  👷 Équipe ({formData.personnel_assigned.length} sélectionné(s))
                </span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {personnel.slice(0, 30).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePersonnelToggle(p.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.personnel_assigned.includes(p.id)
                        ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-300'
                        : 'bg-white text-slate-600 hover:bg-amber-100 border border-slate-200/60'
                    }`}
                  >
                    {p.first_name} {p.last_name}
                  </button>
                ))}
              </div>
            </div>
          </FormSection>
        </Card>

        {/* Équipements */}
        <Card>
          <FormSection
            title="Équipements assignés"
            description="Sélectionnez le matériel utilisé"
            icon={WrenchScrewdriverIcon}
          >
            <div className="bg-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-semibold text-blue-700">
                  🚜 Équipements ({formData.equipment_assigned.length} sélectionné(s))
                </span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {equipment.slice(0, 30).map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => handleEquipmentToggle(e.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.equipment_assigned.includes(e.id)
                        ? 'bg-indigo-600 text-white shadow-md ring-2 ring-blue-300'
                        : 'bg-white text-slate-600 hover:bg-blue-100 border border-slate-200/60'
                    }`}
                  >
                    {e.equipment_code || e.name}
                  </button>
                ))}
              </div>
            </div>
          </FormSection>
        </Card>

        {/* Production */}
        <Card>
          <FormSection
            title="Objectifs de production"
            description="Cibles et réalisations"
            icon={ChartBarIcon}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <label className="block text-base font-semibold text-green-700 mb-3">
                  🎯 Production cible (tonnes)
                </label>
                <input
                  type="number"
                  step="any"
                  name="target_production"
                  value={formData.target_production}
                  onChange={handleChange}
                  placeholder="Ex: 500"
                  className="w-full px-4 py-3 text-base border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                />
              </div>

              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <label className="block text-base font-semibold text-purple-700 mb-3">
                  📊 Production réelle (tonnes)
                </label>
                <input
                  type="number"
                  step="any"
                  name="actual_production"
                  value={formData.actual_production}
                  onChange={handleChange}
                  placeholder="À remplir après le shift"
                  className="w-full px-4 py-3 text-base border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                />
              </div>
            </div>
          </FormSection>
        </Card>

        {/* Notes */}
        <Card>
          <FormSection
            title="Notes et observations"
            description="Consignes particulières ou remarques"
            icon={DocumentTextIcon}
          >
            <TextareaField
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Observations, consignes particulières, conditions météo..."
            />
          </FormSection>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/shifts')}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={saving}
            icon={CheckCircleIcon}
          >
            {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer la rotation'}
          </Button>
        </div>
      </form>
    </div>
  );
}
