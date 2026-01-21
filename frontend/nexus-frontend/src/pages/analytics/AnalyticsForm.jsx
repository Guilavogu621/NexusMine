import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';

export default function AnalyticsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [sites, setSites] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    indicator_type: 'PRODUCTION',
    site: '',
    calculated_value: '',
    target_value: '',
    unit: '',
    threshold_warning: '',
    threshold_critical: '',
    description: '',
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
      setSites(response.data.results || response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des sites:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/indicators/${id}/`);
      setFormData({
        name: response.data.name || '',
        indicator_type: response.data.indicator_type || 'PRODUCTION',
        site: response.data.site || '',
        calculated_value: response.data.calculated_value || '',
        target_value: response.data.target_value || '',
        unit: response.data.unit || '',
        threshold_warning: response.data.threshold_warning || '',
        threshold_critical: response.data.threshold_critical || '',
        description: response.data.description || '',
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
        site: formData.site || null,
        calculated_value: formData.calculated_value ? parseFloat(formData.calculated_value) : null,
        target_value: formData.target_value ? parseFloat(formData.target_value) : null,
        threshold_warning: formData.threshold_warning ? parseFloat(formData.threshold_warning) : null,
        threshold_critical: formData.threshold_critical ? parseFloat(formData.threshold_critical) : null,
      };

      if (isEdit) {
        await api.put(`/indicators/${id}/`, dataToSend);
      } else {
        await api.post('/indicators/', dataToSend);
      }
      navigate('/analytics');
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/analytics"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Modifier l\'indicateur' : 'Nouvel indicateur'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEdit ? 'Modifiez les informations de l\'indicateur' : 'Créez un nouvel indicateur de performance'}
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
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nom de l'indicateur *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
              placeholder="Ex: Taux de production journalier"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="indicator_type" className="block text-sm font-medium text-gray-700">
                Type d'indicateur *
              </label>
              <select
                id="indicator_type"
                name="indicator_type"
                required
                value={formData.indicator_type}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
              >
                <option value="PRODUCTION">Production</option>
                <option value="EFFICIENCY">Efficacité</option>
                <option value="SAFETY">Sécurité</option>
                <option value="ENVIRONMENTAL">Environnement</option>
                <option value="EQUIPMENT">Équipement</option>
                <option value="FINANCIAL">Financier</option>
              </select>
            </div>
            <div>
              <label htmlFor="site" className="block text-sm font-medium text-gray-700">
                Site concerné
              </label>
              <select
                id="site"
                name="site"
                value={formData.site}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
              >
                <option value="">Tous les sites</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="calculated_value" className="block text-sm font-medium text-gray-700">
                Valeur actuelle
              </label>
              <input
                type="number"
                id="calculated_value"
                name="calculated_value"
                step="0.01"
                value={formData.calculated_value}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label htmlFor="target_value" className="block text-sm font-medium text-gray-700">
                Objectif
              </label>
              <input
                type="number"
                id="target_value"
                name="target_value"
                step="0.01"
                value={formData.target_value}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                Unité *
              </label>
              <input
                type="text"
                id="unit"
                name="unit"
                required
                value={formData.unit}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                placeholder="Ex: tonnes, %, heures"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="threshold_warning" className="block text-sm font-medium text-gray-700">
                Seuil d'alerte (warning)
              </label>
              <input
                type="number"
                id="threshold_warning"
                name="threshold_warning"
                step="0.01"
                value={formData.threshold_warning}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                placeholder="Seuil d'avertissement"
              />
            </div>
            <div>
              <label htmlFor="threshold_critical" className="block text-sm font-medium text-gray-700">
                Seuil critique
              </label>
              <input
                type="number"
                id="threshold_critical"
                name="threshold_critical"
                step="0.01"
                value={formData.threshold_critical}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                placeholder="Seuil critique"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
              placeholder="Description de l'indicateur..."
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Link
            to="/analytics"
            className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Enregistrement...' : (isEdit ? 'Mettre à jour' : 'Créer l\'indicateur')}
          </button>
        </div>
      </form>
    </div>
  );
}
