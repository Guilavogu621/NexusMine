import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, MapPinIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

export default function UsersForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [availableSites, setAvailableSites] = useState([]);
  
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'OPERATOR',
    is_active: true,
    password: '',
    password_confirm: '',
    assigned_sites: [],
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
      setAvailableSites(response.data.results || response.data);
    } catch (err) {
      console.error('Erreur chargement sites:', err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${id}/`);
      setFormData({
        email: response.data.email || '',
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        role: response.data.role || 'OPERATOR',
        is_active: response.data.is_active ?? true,
        password: '',
        password_confirm: '',
        assigned_sites: response.data.assigned_sites || [],
      });
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setError('Impossible de charger les données');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!isEdit && !formData.password) {
      setError('Le mot de passe est requis pour un nouvel utilisateur');
      return;
    }

    if (formData.password && formData.password !== formData.password_confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setSaving(true);

    try {
      const dataToSend = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        is_active: formData.is_active,
        assigned_sites: formData.assigned_sites,
      };

      // Only include password if provided
      if (formData.password) {
        dataToSend.password = formData.password;
        dataToSend.password_confirm = formData.password_confirm;
      }

      // ADMIN n'a pas besoin de sites assignés
      if (formData.role === 'ADMIN') {
        dataToSend.assigned_sites = [];
      }

      if (isEdit) {
        await api.put(`/users/${id}/`, dataToSend);
      } else {
        await api.post('/users/', dataToSend);
      }
      navigate('/users');
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

  if (!isAdmin()) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Accès refusé. Réservé aux administrateurs.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/users"
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            {isEdit ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </h1>
          <p className="mt-1 text-base text-slate-500">
            {isEdit ? 'Modifiez les informations' : 'Créez un nouveau compte utilisateur'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-base whitespace-pre-line">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-base font-semibold text-slate-600">
                Prénom *
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                required
                value={formData.first_name}
                onChange={handleChange}
                className="mt-2 block w-full rounded-xl border-0 py-3 px-3 text-slate-800 ring-1 ring-inset ring-gray-300 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 text-base"
                placeholder="Prénom"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-base font-semibold text-slate-600">
                Nom *
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                required
                value={formData.last_name}
                onChange={handleChange}
                className="mt-2 block w-full rounded-xl border-0 py-3 px-3 text-slate-800 ring-1 ring-inset ring-gray-300 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 text-base"
                placeholder="Nom"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-base font-semibold text-slate-600">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-2 block w-full rounded-xl border-0 py-3 px-3 text-slate-800 ring-1 ring-inset ring-gray-300 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 text-base"
              placeholder="email@exemple.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="role" className="block text-base font-semibold text-slate-600">
                Rôle *
              </label>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="mt-2 block w-full rounded-xl border-0 py-3 px-3 text-slate-800 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-500 text-base"
              >
                <option value="ADMIN">Administrateur de la plateforme</option>
                <option value="SITE_MANAGER">Responsable de site minier</option>
                <option value="SUPERVISOR">Gestionnaire de Site</option>
                <option value="OPERATOR">Technicien/Opérateur</option>
                <option value="ANALYST">Analyste</option>
                <option value="MMG">Autorité (MMG)</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-3 mt-8">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-base font-semibold text-slate-600">Compte actif</span>
              </label>
            </div>
          </div>

          {/* Sites assignés — visible uniquement si le rôle N'EST PAS ADMIN */}
          {formData.role !== 'ADMIN' && (
            <div className="border-t border-slate-200/60 pt-6">
              <div className="flex items-center gap-2 mb-1">
                <MapPinIcon className="h-4 w-4 text-slate-500" />
                <h3 className="text-base font-semibold text-slate-800">Sites assignés</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                L'utilisateur ne verra que les données des sites sélectionnés ci-dessous.
                {formData.assigned_sites.length === 0 && (
                  <span className="text-amber-600 font-medium"> ⚠ Aucun site = aucun accès aux données.</span>
                )}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1">
                {availableSites.map((site) => (
                  <label
                    key={site.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150 ${
                      formData.assigned_sites.includes(site.id)
                        ? 'border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.assigned_sites.includes(site.id)}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          assigned_sites: e.target.checked
                            ? [...prev.assigned_sites, site.id]
                            : prev.assigned_sites.filter((s) => s !== site.id),
                        }));
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-slate-700 truncate">{site.name}</p>
                      {site.code && (
                        <p className="text-sm text-slate-400">{site.code}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              {availableSites.length === 0 && (
                <p className="text-base text-slate-400 italic">Aucun site disponible. Créez d'abord un site minier.</p>
              )}
            </div>
          )}

          <div className="border-t border-slate-200/60 pt-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4">
              {isEdit ? 'Modifier le mot de passe (optionnel)' : 'Mot de passe'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-base font-semibold text-slate-600">
                  Mot de passe {!isEdit && '*'}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required={!isEdit}
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-xl border-0 py-3 px-3 text-slate-800 ring-1 ring-inset ring-gray-300 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 text-base"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label htmlFor="password_confirm" className="block text-base font-semibold text-slate-600">
                  Confirmer {!isEdit && '*'}
                </label>
                <input
                  type="password"
                  id="password_confirm"
                  name="password_confirm"
                  required={!isEdit}
                  value={formData.password_confirm}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-xl border-0 py-3 px-3 text-slate-800 ring-1 ring-inset ring-gray-300 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 text-base"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Link
            to="/users"
            className="px-4 py-3 text-base font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Enregistrement...' : (isEdit ? 'Mettre à jour' : 'Créer l\'utilisateur')}
          </button>
        </div>
      </form>
    </div>
  );
}
