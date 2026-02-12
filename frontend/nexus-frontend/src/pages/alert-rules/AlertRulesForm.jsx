import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  BoltIcon,
  BellAlertIcon,
  MapPinIcon,
  UsersIcon,
  CogIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import {
  InputField,
  SelectField,
  TextareaField,
  Switch,
  Button,
  Card,
  FormSection,
  Alert,
} from '../../components/ui';
import PageHeader from '../../components/ui/PageHeader';
import { LoadingSpinner } from '../../components/ui/UIComponents';

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
  { value: 'LOW', label: '🟢 Faible' },
  { value: 'MEDIUM', label: '🟡 Moyen' },
  { value: 'HIGH', label: '🟠 Élevé' },
  { value: 'CRITICAL', label: '🔴 Critique' },
];

const roleOptions = [
  { value: 'ADMIN', label: '👑 Administrateur' },
  { value: 'SITE_MANAGER', label: '🏗️ Responsable de site' },
  { value: 'SUPERVISOR', label: '👔 Gestionnaire de Site' },
  { value: 'OPERATOR', label: '👷 Technicien/Opérateur' },
  { value: 'ANALYST', label: '📊 Analyste' },
  { value: 'MMG', label: '🏛️ MMG' },
];

export default function AlertRulesForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [sites, setSites] = useState([]);
  const [_users, setUsers] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    alert_type: 'THRESHOLD_EXCEEDED',
    severity: 'MEDIUM',
    conditions: {},
    sites: [],
    notify_users: [],
    notify_roles: [],
    is_active: true,
  });

  // eslint-disable-next-line no-unused-vars
  const [success, setSuccess] = useState(false);

  // Condition builder state
  const [conditionField, setConditionField] = useState('');
  const [conditionOperator, setConditionOperator] = useState('>');
  const [conditionValue, setConditionValue] = useState('');

  useEffect(() => {
    fetchSites();
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/');
      setUsers(response.data.results || response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/alert-rules/${id}/`);
      setFormData({
        name: response.data.name || '',
        description: response.data.description || '',
        alert_type: response.data.alert_type || 'THRESHOLD_EXCEEDED',
        severity: response.data.severity || 'MEDIUM',
        conditions: response.data.conditions || {},
        sites: response.data.sites || [],
        notify_users: response.data.notify_users || [],
        notify_roles: response.data.notify_roles || [],
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

  const _handleMultiSelect = (e, field) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    setFormData((prev) => ({
      ...prev,
      [field]: values,
    }));
  };

  const handleRoleToggle = (role) => {
    setFormData((prev) => ({
      ...prev,
      notify_roles: prev.notify_roles.includes(role)
        ? prev.notify_roles.filter(r => r !== role)
        : [...prev.notify_roles, role],
    }));
  };

  const handleSiteToggle = (siteId) => {
    setFormData((prev) => ({
      ...prev,
      sites: prev.sites.includes(siteId)
        ? prev.sites.filter(s => s !== siteId)
        : [...prev.sites, siteId],
    }));
  };

  const addCondition = () => {
    if (conditionField && conditionValue) {
      setFormData((prev) => ({
        ...prev,
        conditions: {
          ...prev.conditions,
          [conditionField]: { operator: conditionOperator, value: conditionValue }
        }
      }));
      setConditionField('');
      setConditionValue('');
    }
  };

  const removeCondition = (key) => {
    const newConditions = { ...formData.conditions };
    delete newConditions[key];
    setFormData((prev) => ({ ...prev, conditions: newConditions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      const payload = {
        ...formData,
        sites: formData.sites.map(s => typeof s === 'object' ? s.id : s),
        notify_users: formData.notify_users.map(u => typeof u === 'object' ? u.id : u),
      };
      
      if (isEdit) {
        await api.put(`/alert-rules/${id}/`, payload);
      } else {
        await api.post('/alert-rules/', payload);
      }
      
      navigate('/alert-rules');
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
    return <LoadingSpinner text="Chargement de la règle..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <PageHeader
        title={isEdit ? 'Modifier la règle' : 'Nouvelle règle d\'alerte'}
        subtitle={isEdit ? 'Modifiez les paramètres de la règle' : 'Configurez les conditions de déclenchement automatique des alertes'}
        backLink="/alert-rules"
        icon={BoltIcon}
        iconColor="bg-indigo-500"
        breadcrumbs={[
          { label: 'Règles d\'alertes', link: '/alert-rules' },
          { label: isEdit ? 'Modifier' : 'Nouvelle' },
        ]}
      />

      {success && (
        <Alert type="success" title="Succès !">
          {isEdit ? 'Règle modifiée avec succès.' : 'Règle créée avec succès.'} Redirection...
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
            description="Identifiez et catégorisez la règle"
            icon={BellAlertIcon}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <InputField
                  label="Nom de la règle"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Alerte température critique"
                />
              </div>

              <SelectField
                label="Type d'alerte"
                name="alert_type"
                value={formData.alert_type}
                onChange={handleChange}
                options={alertTypeOptions}
                required
              />

              <SelectField
                label="Gravité"
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                options={severityOptions}
                required
              />

              <div className="md:col-span-2">
                <TextareaField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Description de la règle et quand elle se déclenche..."
                />
              </div>
            </div>
          </FormSection>
        </Card>

        {/* Conditions */}
        <Card>
          <FormSection
            title="Conditions de déclenchement"
            description="Définissez les critères qui déclenchent l'alerte"
            icon={CogIcon}
          >
            <div className="space-y-4">
              {/* Existing conditions */}
              {Object.keys(formData.conditions).length > 0 && (
                <div className="space-y-2">
                  {Object.entries(formData.conditions).map(([key, condition]) => (
                    <div key={key} className="flex items-center gap-3 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                      <span className="font-semibold text-indigo-700">{key}</span>
                      <span className="px-2 py-1 bg-white rounded text-slate-500 font-mono">{condition.operator}</span>
                      <span className="text-indigo-600 font-bold">{condition.value}</span>
                      <button
                        type="button"
                        onClick={() => removeCondition(key)}
                        className="ml-auto p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add condition */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
                <p className="text-base font-semibold text-slate-700 mb-3">➕ Ajouter une condition</p>
                <div className="flex gap-3 items-end flex-wrap">
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-sm font-medium text-slate-500 mb-1">Champ</label>
                    <input
                      type="text"
                      value={conditionField}
                      onChange={(e) => setConditionField(e.target.value)}
                      placeholder="temperature, humidity..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
                    />
                  </div>
                  <div className="w-20">
                    <label className="block text-sm font-medium text-slate-500 mb-1">Op.</label>
                    <select
                      value={conditionOperator}
                      onChange={(e) => setConditionOperator(e.target.value)}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-base"
                    >
                      <option value=">">&gt;</option>
                      <option value="<">&lt;</option>
                      <option value=">=">&gt;=</option>
                      <option value="<=">&lt;=</option>
                      <option value="==">=</option>
                      <option value="!=">≠</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <label className="block text-sm font-medium text-slate-500 mb-1">Valeur</label>
                    <input
                      type="text"
                      value={conditionValue}
                      onChange={(e) => setConditionValue(e.target.value)}
                      placeholder="50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-base"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addCondition}
                    disabled={!conditionField || !conditionValue}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </FormSection>
        </Card>

        {/* Sites concernés */}
        <Card>
          <FormSection
            title="Sites concernés"
            description="Laissez vide pour appliquer à tous les sites"
            icon={MapPinIcon}
          >
            <div className="bg-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-blue-700">
                  🏭 Sites ({formData.sites.length} sélectionné(s))
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sites.map((site) => (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => handleSiteToggle(site.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.sites.includes(site.id)
                        ? 'bg-indigo-600 text-white shadow-md ring-2 ring-blue-300'
                        : 'bg-white text-slate-600 hover:bg-blue-100 border border-slate-200/60'
                    }`}
                  >
                    {site.name}
                  </button>
                ))}
              </div>
            </div>
          </FormSection>
        </Card>

        {/* Notifications */}
        <Card>
          <FormSection
            title="Notifications"
            description="Qui doit être alerté ?"
            icon={UsersIcon}
          >
            <div className="space-y-6">
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <p className="text-sm font-semibold text-purple-700 mb-4">
                  👥 Rôles à notifier ({formData.notify_roles.length} sélectionné(s))
                </p>
                <div className="flex flex-wrap gap-2">
                  {roleOptions.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => handleRoleToggle(role.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.notify_roles.includes(role.value)
                          ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-300'
                          : 'bg-white text-slate-600 hover:bg-purple-100 border border-slate-200/60'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-medium text-slate-800">Règle active</p>
                  <p className="text-base text-slate-500">Génère des alertes automatiquement</p>
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
            onClick={() => navigate('/alert-rules')}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={saving}
            icon={CheckCircleIcon}
          >
            {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer la règle'}
          </Button>
        </div>
      </form>
    </div>
  );
}
