import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
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
  
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'OPERATOR',
    is_active: true,
    password: '',
    password_confirm: '',
  });

  useEffect(() => {
    if (isEdit) {
      fetchData();
    }
  }, [id]);

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
      };

      // Only include password if provided
      if (formData.password) {
        dataToSend.password = formData.password;
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/users"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEdit ? 'Modifiez les informations' : 'Créez un nouveau compte utilisateur'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm whitespace-pre-line">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                Prénom *
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                required
                value={formData.first_name}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 sm:text-sm"
                placeholder="Prénom"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                Nom *
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                required
                value={formData.last_name}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 sm:text-sm"
                placeholder="Nom"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 sm:text-sm"
              placeholder="email@exemple.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Rôle *
              </label>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-gray-900 sm:text-sm"
              >
                <option value="ADMIN">Administrateur</option>
                <option value="SUPERVISOR">Superviseur</option>
                <option value="OPERATOR">Opérateur</option>
                <option value="ANALYST">Analyste</option>
                <option value="REGULATOR">Régulateur</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-3 mt-8">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <span className="text-sm font-medium text-gray-700">Compte actif</span>
              </label>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              {isEdit ? 'Modifier le mot de passe (optionnel)' : 'Mot de passe'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe {!isEdit && '*'}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required={!isEdit}
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700">
                  Confirmer {!isEdit && '*'}
                </label>
                <input
                  type="password"
                  id="password_confirm"
                  name="password_confirm"
                  required={!isEdit}
                  value={formData.password_confirm}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Link
            to="/users"
            className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Enregistrement...' : (isEdit ? 'Mettre à jour' : 'Créer l\'utilisateur')}
          </button>
        </div>
      </form>
    </div>
  );
}
