import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  MapPinIcon,
  BuildingOffice2Icon,
  GlobeAltIcon,
  DocumentTextIcon,
  CheckIcon,
  UsersIcon,
  UserPlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';
import {
  InputField,
  SelectField,
  TextareaField,
  Button,
  Card,
  FormSection,
  Separator,
  Alert,
} from '../../components/ui';
import PageHeader from '../../components/ui/PageHeader';
import { LoadingSpinner } from '../../components/ui/UIComponents';

const SITE_TYPES = [
  { value: 'OPEN_PIT', label: 'Ciel ouvert' },
  { value: 'UNDERGROUND', label: 'Souterrain' },
  { value: 'ALLUVIAL', label: 'Alluvionnaire' },
  { value: 'MIXED', label: 'Mixte' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'En exploitation' },
  { value: 'SUSPENDED', label: 'Suspendu' },
  { value: 'CLOSED', label: 'Fermé' },
  { value: 'EXPLORATION', label: 'En exploration' },
];

export default function SiteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { isAdmin } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // User assignment state (ADMIN only, edit mode only)
  const [allUsers, setAllUsers] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    location: '',
    latitude: '',
    longitude: '',
    site_type: 'OPEN_PIT',
    status: 'ACTIVE',
    description: '',
    commissioning_date: '',
  });

  useEffect(() => {
    if (isEdit) {
      fetchSite();
      if (isAdmin()) {
        fetchAssignedUsers();
        fetchAllUsers();
      }
    }
  }, [id]);

  const fetchSite = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/sites/${id}/`);
      setFormData({
        code: response.data.code || '',
        name: response.data.name || '',
        location: response.data.location || '',
        latitude: response.data.latitude || '',
        longitude: response.data.longitude || '',
        site_type: response.data.site_type || 'OPEN_PIT',
        status: response.data.status || 'ACTIVE',
        description: response.data.description || '',
        commissioning_date: response.data.commissioning_date || '',
      });
    } catch (error) {
      console.error('Erreur lors du chargement du site:', error);
      setError('Impossible de charger les données du site');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const fetchAllUsers = async () => {
    try {
      const response = await api.get('/users/');
      setAllUsers(response.data.results || response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    }
  };

  const fetchAssignedUsers = async () => {
    try {
      const response = await api.get(`/sites/${id}/assigned-users/`);
      setAssignedUsers(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs assignés:', error);
    }
  };

  const handleAssignUser = async () => {
    if (!selectedUserId) return;
    setAssignLoading(true);
    try {
      const response = await api.post(`/sites/${id}/assign-users/`, {
        user_ids: [parseInt(selectedUserId)],
      });
      setAssignedUsers(response.data);
      setSelectedUserId('');
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
      alert(error.response?.data?.detail || 'Erreur lors de l\'assignation');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!window.confirm('Retirer cet utilisateur du site ?')) return;
    try {
      await api.post(`/sites/${id}/remove-user/`, { user_id: userId });
      setAssignedUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      console.error('Erreur lors du retrait:', error);
      alert(error.response?.data?.detail || 'Erreur lors du retrait');
    }
  };

  const roleLabels = {
    ADMIN: 'Administrateur',
    SITE_MANAGER: 'Responsable de site',
    SUPERVISOR: 'Gestionnaire',
    OPERATOR: 'Opérateur',
    ANALYST: 'Analyste',
    MMG: 'MMG',
  };

  // Utilisateurs non-encore assignés (pour le dropdown)
  const assignedIds = assignedUsers.map((u) => u.id);
  const availableUsers = allUsers.filter((u) => !assignedIds.includes(u.id) && u.role !== 'ADMIN');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const dataToSend = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      if (isEdit) {
        await api.put(`/sites/${id}/`, dataToSend);
      } else {
        await api.post('/sites/', dataToSend);
      }

      setSuccess(true);
      setTimeout(() => navigate('/sites'), 1500);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      if (error.response?.data) {
        const errors = Object.entries(error.response.data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        setError(errors);
      } else {
        setError('Une erreur est survenue lors de la sauvegarde');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Chargement du site..." />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-slate-50 via-blue-50/20 to-slate-100 pb-12">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-8">
        {/* ── HEADER PREMIUM ── */}
        <div className="group relative overflow-hidden rounded-[40px] bg-linear-to-br from-indigo-600 via-blue-600 to-indigo-700 shadow-2xl animate-fadeInDown">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="formGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
              <rect width="100" height="100" fill="url(#formGrid)" />
            </svg>
          </div>

          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-700"></div>

          <div className="relative p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
              <Link
                to="/sites"
                className="group inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/10 backdrop-blur-md text-white rounded-2xl hover:bg-white hover:text-indigo-600 transition-all duration-300 shadow-lg border border-white/20"
              >
                <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-bold uppercase tracking-widest font-outfit">Retour</span>
              </Link>
            </div>

            <div className="flex items-center gap-6">
              <div className="p-4 bg-white/20 backdrop-blur-md rounded-3xl shadow-xl ring-1 ring-white/30 group-hover:scale-110 transition-transform duration-500">
                <MapPinIcon className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight font-outfit">
                  {isEdit ? 'Modifier le Site' : 'Nouveau Site'}
                </h1>
                <p className="mt-2 text-blue-100 font-medium opacity-90">
                  {isEdit ? `Modification des paramètres de ${formData.name || 'Site'}` : 'Configuration d\'un nouveau périmètre d\'exploitation'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {success && (
          <div className="animate-fadeInUp">
            <Alert type="success" title="Succès !">
              {isEdit ? 'Site modifié avec succès.' : 'Site créé avec succès.'} Redirection...
            </Alert>
          </div>
        )}

        {error && (
          <Alert type="error" title="Erreur" onClose={() => setError(null)}>
            <pre className="whitespace-pre-line font-sans">{error}</pre>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations principales */}
          <Card>
            <FormSection
              title="Informations générales"
              description="Détails principaux du site minier"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <InputField
                  label="Code du site"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  placeholder="Ex: SM-001"
                  icon={BuildingOffice2Icon}
                  helper="Identifiant unique du site (ex: SM-001, SIGUIRI-01)"
                />

                <InputField
                  label="Nom du site"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Mine de Siguiri"
                  icon={BuildingOffice2Icon}
                />

                <InputField
                  label="Localisation"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Siguiri, Région de Kankan"
                  icon={MapPinIcon}
                  className="md:col-span-2"
                />

                <SelectField
                  label="Type de site"
                  name="site_type"
                  value={formData.site_type}
                  onChange={handleChange}
                  required
                  options={SITE_TYPES}
                />

                <SelectField
                  label="Statut"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  options={STATUS_OPTIONS}
                />

                <InputField
                  label="Date de mise en service"
                  name="commissioning_date"
                  type="date"
                  value={formData.commissioning_date}
                  onChange={handleChange}
                  icon={DocumentTextIcon}
                />
              </div>
            </FormSection>
          </Card>

          {/* Coordonnées GPS */}
          <Card>
            <FormSection
              title="Coordonnées géographiques"
              description="Position GPS du site (optionnel)"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <InputField
                  label="Latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="Ex: 11.4185"
                  icon={GlobeAltIcon}
                  helper="Format décimal (ex: 11.4185)"
                />

                <InputField
                  label="Longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="Ex: -9.1795"
                  icon={GlobeAltIcon}
                  helper="Format décimal (ex: -9.1795)"
                />
              </div>

              {/* Mini carte preview */}
              {formData.latitude && formData.longitude && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                  <div className="flex items-center gap-2 text-base text-slate-500">
                    <MapPinIcon className="h-4 w-4" />
                    <span>Position: {formData.latitude}, {formData.longitude}</span>
                  </div>
                </div>
              )}
            </FormSection>
          </Card>

          {/* Description */}
          <Card>
            <FormSection
              title="Description"
              description="Informations complémentaires sur le site"
            >
              <div className="mt-4">
                <TextareaField
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Décrivez le site, ses caractéristiques, les ressources exploitées..."
                  rows={5}
                />
              </div>
            </FormSection>
          </Card>

          {/* Assignation d'utilisateurs (ADMIN uniquement, mode édition) */}
          {isEdit && isAdmin() && (
            <Card>
              <FormSection
                title="Acteurs assignés au site"
                description="Assignez les gestionnaires, opérateurs et responsables qui auront accès à ce site"
              >
                <div className="mt-4 space-y-4">
                  {/* Ajouter un utilisateur */}
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Ajouter un utilisateur
                      </label>
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full rounded-xl border-0 py-3 px-4 bg-slate-50 text-slate-800 ring-1 ring-inset ring-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                      >
                        <option value="">Sélectionner un utilisateur...</option>
                        {availableUsers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.first_name} {user.last_name} — {roleLabels[user.role] || user.role}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleAssignUser}
                      disabled={!selectedUserId || assignLoading}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <UserPlusIcon className="h-5 w-5" />
                      {assignLoading ? 'Ajout...' : 'Assigner'}
                    </button>
                  </div>

                  {/* Liste des utilisateurs assignés */}
                  {assignedUsers.length > 0 ? (
                    <div className="border border-slate-200/60 rounded-xl overflow-hidden">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-slate-50/80">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500">Utilisateur</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500">Rôle</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-500">Email</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-slate-500">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {assignedUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <span className="text-sm font-bold text-indigo-600">
                                      {user.first_name?.[0]}{user.last_name?.[0]}
                                    </span>
                                  </div>
                                  <span className="font-medium text-slate-800">
                                    {user.first_name} {user.last_name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                                  {roleLabels[user.role] || user.role}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-500">{user.email}</td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveUser(user.id)}
                                  className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Retirer du site"
                                >
                                  <XMarkIcon className="h-5 w-5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                      <UsersIcon className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">Aucun utilisateur assigné à ce site</p>
                      <p className="text-xs text-slate-400 mt-1">Utilisez le formulaire ci-dessus pour assigner des acteurs</p>
                    </div>
                  )}
                </div>
              </FormSection>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/sites')}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              icon={CheckIcon}
            >
              {isEdit ? 'Enregistrer les modifications' : 'Créer le site'}
            </Button>
          </div>
        </form>

        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInDown { animation: fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fadeInUp { 
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          animation-fill-mode: both;
        }
        
        /* Premium Card Styling */
        .premium-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 32px;
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .premium-card:hover {
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.08);
          border-color: rgba(99, 102, 241, 0.3);
        }
      `}</style>
      </div>
    </div>
  );
}
