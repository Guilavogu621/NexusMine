import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';

export default function PersonnelForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [sites, setSites] = useState([]);
  
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
      } else {
        await api.post('/personnel/', dataToSend);
      }
      navigate('/personnel');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/personnel"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Modifier l\'employé' : 'Nouvel employé'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEdit ? 'Modifiez les informations' : 'Ajoutez un nouvel employé'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm whitespace-pre-line">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Matricule et Site */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700">
                Matricule *
              </label>
              <input
                type="text"
                id="employee_id"
                name="employee_id"
                required
                value={formData.employee_id}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                placeholder="EMP-001"
              />
            </div>
            <div>
              <label htmlFor="site" className="block text-sm font-medium text-gray-700">
                Site d'affectation *
              </label>
              <select
                id="site"
                name="site"
                required
                value={formData.site}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              >
                <option value="">Sélectionner un site</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Nom et Prénom */}
          <div className="grid grid-cols-2 gap-4">
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
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                placeholder="Diallo"
              />
            </div>
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
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                placeholder="Mamadou"
              />
            </div>
          </div>

          {/* Poste */}
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">
              Fonction / Poste *
            </label>
            <input
              type="text"
              id="position"
              name="position"
              required
              value={formData.position}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              placeholder="Opérateur minier"
            />
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                placeholder="+224 620 00 00 00"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                placeholder="email@exemple.com"
              />
            </div>
          </div>

          {/* Statut et Date d'embauche */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Statut *
              </label>
              <select
                id="status"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              >
                <option value="ACTIVE">Actif</option>
                <option value="ON_LEAVE">En congé</option>
                <option value="INACTIVE">Inactif</option>
                <option value="TERMINATED">Licencié</option>
              </select>
            </div>
            <div>
              <label htmlFor="hire_date" className="block text-sm font-medium text-gray-700">
                Date d'embauche
              </label>
              <input
                type="date"
                id="hire_date"
                name="hire_date"
                value={formData.hire_date}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Link
            to="/personnel"
            className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Enregistrement...
              </>
            ) : (
              isEdit ? 'Mettre à jour' : 'Créer l\'employé'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
