import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  IdentificationIcon,
  BriefcaseIcon,
  CheckIcon,
  UserCircleIcon,
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
import { LoadingSpinner, Avatar } from '../../components/ui/UIComponents';
import useFormPermissions from '../../hooks/useFormPermissions';
import ReadOnlyBanner from '../../components/ui/ReadOnlyBanner';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Actif', color: 'success' },
  { value: 'ON_LEAVE', label: 'En congé', color: 'warning' },
  { value: 'INACTIVE', label: 'Inactif', color: 'default' },
  { value: 'TERMINATED', label: 'Terminé', color: 'danger' },
];

const POSITION_OPTIONS = [
  { value: 'OPERATOR', label: '👷 Opérateur' },
  { value: 'TECHNICIAN', label: '🔧 Technicien' },
  { value: 'ENGINEER', label: '👨‍💻 Ingénieur' },
  { value: 'SUPERVISOR', label: '👔 Superviseur' },
  { value: 'MANAGER', label: '💼 Manager' },
  { value: 'DRIVER', label: '🚛 Chauffeur' },
  { value: 'SECURITY', label: '🛡️ Agent de sécurité' },
  { value: 'OTHER', label: '📋 Autre' },
];

export default function PersonnelForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { readOnly, canSubmit, roleBanner } = useFormPermissions('personnel');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [sites, setSites] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    employee_id: '',
    first_name: '',
    last_name: '',
    position: '',
    phone: '',
    email: '',
    status: 'ACTIVE',
    site: '',
    hire_date: '',
  });

  useEffect(() => {
    fetchSites();
    if (isEdit) {
      fetchPerson();
    } else {
      generateEmployeeId();
    }
  }, [id]);

  const generateEmployeeId = () => {
    const id = `EMP-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    setFormData(prev => ({ ...prev, employee_id: id }));
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

  const fetchPerson = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/personnel/${id}/`);
      setFormData({
        employee_id: response.data.employee_id || '',
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        position: response.data.position || '',
        phone: response.data.phone || '',
        email: response.data.email || '',
        status: response.data.status || 'ACTIVE',
        site: response.data.site || '',
        hire_date: response.data.hire_date || '',
      });
      // Set existing photo preview
      if (response.data.photo_url) {
        setPhotoPreview(response.data.photo_url);
      }
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
        hire_date: formData.hire_date || null,
      };

      if (isEdit) {
        await api.put(`/personnel/${id}/`, dataToSend);
        // Upload photo if new file selected
        if (photoFile) {
          const photoData = new FormData();
          photoData.append('photo', photoFile);
          await api.post(`/personnel/${id}/upload-photo/`, photoData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      } else {
        const res = await api.post('/personnel/', dataToSend);
        // Upload photo for newly created personnel
        if (photoFile && res.data?.id) {
          const photoData = new FormData();
          photoData.append('photo', photoFile);
          await api.post(`/personnel/${res.data.id}/upload-photo/`, photoData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      }
      
      setSuccess(true);
      setTimeout(() => navigate('/personnel'), 1500);
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
      ACTIVE: 'bg-green-100 text-green-700',
      ON_LEAVE: 'bg-yellow-100 text-yellow-700',
      INACTIVE: 'bg-slate-100 text-slate-600',
      TERMINATED: 'bg-red-100 text-red-700',
    };
    return colors[status] || colors.INACTIVE;
  };

  if (loading) {
    return <LoadingSpinner text="Chargement des données..." />;
  }

  const fullName = `${formData.first_name} ${formData.last_name}`.trim();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <PageHeader
        title={isEdit ? 'Modifier l\'employé' : 'Nouvel employé'}
        subtitle={isEdit ? 'Modifiez les informations de l\'employé' : 'Ajoutez un nouveau membre du personnel'}
        backLink="/personnel"
        icon={UserIcon}
        iconColor="bg-amber-500"
        breadcrumbs={[
          { label: 'Personnel', link: '/personnel' },
          { label: isEdit ? 'Modifier' : 'Nouveau' },
        ]}
      />

      {success && (
        <Alert type="success" title="Succès !">
          {isEdit ? 'Employé modifié avec succès.' : 'Employé ajouté avec succès.'} Redirection...
        </Alert>
      )}

      {error && (
        <Alert type="error" title="Erreur" onClose={() => setError(null)}>
          <pre className="whitespace-pre-line font-sans">{error}</pre>
        </Alert>
      )}

      <ReadOnlyBanner message={roleBanner} />

      <form onSubmit={readOnly ? (e) => e.preventDefault() : handleSubmit} className="space-y-6">
        {/* Informations personnelles */}
        <Card>
          <FormSection
            title="Informations personnelles"
            description="Identité et coordonnées de l'employé"
          >
            <div className="flex flex-col md:flex-row gap-6 mt-4">
              {/* Avatar / Photo upload */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative group cursor-pointer" onClick={() => !readOnly && document.getElementById('personnel-photo-input')?.click()}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Photo" className="h-20 w-20 rounded-xl object-cover ring-2 ring-slate-200" />
                  ) : (
                    <Avatar name={fullName || 'Nouveau'} size="xl" status={formData.status === 'ACTIVE' ? 'online' : 'offline'} />
                  )}
                  {!readOnly && (
                    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium">📷 Photo</span>
                    </div>
                  )}
                </div>
                <input
                  id="personnel-photo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPhotoFile(file);
                      setPhotoPreview(URL.createObjectURL(file));
                    }
                  }}
                />
                <span className="text-sm text-slate-500">{readOnly ? 'Photo' : 'Cliquer pour changer'}</span>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Matricule"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleChange}
                  required
                  placeholder="EMP-2026-0001"
                  icon={IdentificationIcon}
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
                />

                <InputField
                  label="Prénom"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Mamadou"
                  icon={UserCircleIcon}
                />

                <InputField
                  label="Nom de famille"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Diallo"
                />
              </div>
            </div>
          </FormSection>
        </Card>

        {/* Poste et statut */}
        <Card>
          <FormSection
            title="Poste et statut"
            description="Fonction et état de l'employé"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <SelectField
                label="Poste / Fonction"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                options={POSITION_OPTIONS}
                placeholder="Sélectionner un poste"
                icon={BriefcaseIcon}
              />

              <div>
                <label className="block text-base font-semibold text-slate-700 mb-3">
                  Statut *
                </label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`
                        flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer
                        border-2 transition-all duration-200
                        ${formData.status === option.value 
                          ? getStatusColor(option.value) + ' border-current'
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
                      <span className="font-medium text-base">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </FormSection>
        </Card>

        {/* Contact */}
        <Card>
          <FormSection
            title="Coordonnées"
            description="Informations de contact"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <InputField
                label="Téléphone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ex: +224 621 00 00 00"
                icon={PhoneIcon}
                helper="Format international recommandé"
              />

              <InputField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Ex: m.diallo@nexusmine.com"
                icon={EnvelopeIcon}
              />
            </div>

            <div className="mt-6">
              <label className="flex items-center gap-1 text-base font-semibold text-slate-700 mb-2">
                <CalendarIcon className="h-4 w-4" />
                Date d'embauche
              </label>
              <input
                type="date"
                name="hire_date"
                value={formData.hire_date}
                onChange={handleChange}
                className="block w-full md:w-1/3 rounded-xl border-0 py-3 px-4 bg-slate-50 text-slate-800 ring-1 ring-inset ring-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-base hover:ring-gray-300"
              />
            </div>
          </FormSection>
        </Card>

        {/* Résumé */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-indigo-200">
          <div className="flex items-center gap-4">
            <Avatar name={fullName || 'Nouveau'} size="lg" status={formData.status === 'ACTIVE' ? 'online' : 'offline'} />
            <div className="flex-1">
              <h4 className="font-semibold text-slate-800">{fullName || 'Nouvel employé'}</h4>
              <p className="text-base text-slate-500">
                {POSITION_OPTIONS.find(p => p.value === formData.position)?.label || 'Poste non défini'}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="default">{formData.employee_id}</Badge>
                <Badge variant={formData.status === 'ACTIVE' ? 'success' : formData.status === 'ON_LEAVE' ? 'warning' : 'danger'}>
                  {STATUS_OPTIONS.find(s => s.value === formData.status)?.label}
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
            onClick={() => navigate('/personnel')}
          >
            {canSubmit ? 'Annuler' : '← Retour'}
          </Button>
          {canSubmit && (
            <Button
              type="submit"
              variant="success"
              loading={saving}
              icon={CheckIcon}
            >
              {isEdit ? 'Enregistrer les modifications' : 'Ajouter l\'employé'}
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
