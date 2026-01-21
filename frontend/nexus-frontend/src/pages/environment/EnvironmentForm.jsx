import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';

export default function EnvironmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [sites, setSites] = useState([]);
  
  const [formData, setFormData] = useState({
    data_type: 'OTHER',
    site: '',
    value: '',
    unit: '',
    measurement_date: '',
    measurement_time: '',
    location_details: '',
    notes: '',
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
      const response = await api.get(`/environmental-data/${id}/`);
      setFormData({
        data_type: response.data.data_type || 'OTHER',
        site: response.data.site || '',
        value: response.data.value || '',
        unit: response.data.unit || '',
        measurement_date: response.data.measurement_date || '',
        measurement_time: response.data.measurement_time || '',
        location_details: response.data.location_details || '',
        notes: response.data.notes || '',
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
        measurement_time: formData.measurement_time || null,
      };

      if (isEdit) {
        await api.put(`/environmental-data/${id}/`, dataToSend);
      } else {
        await api.post('/environmental-data/', dataToSend);
      }
      navigate('/environment');
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/environment"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Modifier la mesure' : 'Nouvelle mesure environnementale'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEdit ? 'Modifiez les informations' : 'Enregistrez une nouvelle mesure'}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="data_type" className="block text-sm font-medium text-gray-700">
                Type de mesure *
              </label>
              <select
                id="data_type"
                name="data_type"
                required
                value={formData.data_type}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600 sm:text-sm"
              >
                <option value="AIR_QUALITY">Qualité de l'air</option>
                <option value="WATER_QUALITY">Qualité de l'eau</option>
                <option value="NOISE_LEVEL">Niveau sonore</option>
                <option value="DUST_LEVEL">Niveau de poussière</option>
                <option value="PH_LEVEL">Niveau pH</option>
                <option value="TEMPERATURE">Température</option>
                <option value="HUMIDITY">Humidité</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
            <div>
              <label htmlFor="site" className="block text-sm font-medium text-gray-700">
                Site *
              </label>
              <select
                id="site"
                name="site"
                required
                value={formData.site}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600 sm:text-sm"
              >
                <option value="">Sélectionner un site</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="value" className="block text-sm font-medium text-gray-700">
                Valeur mesurée *
              </label>
              <input
                type="number"
                id="value"
                name="value"
                step="0.0001"
                required
                value={formData.value}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-green-600 sm:text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                Unité de mesure *
              </label>
              <input
                type="text"
                id="unit"
                name="unit"
                required
                value={formData.unit}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-green-600 sm:text-sm"
                placeholder="mg/L, dB, °C, %..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="measurement_date" className="block text-sm font-medium text-gray-700">
                Date de mesure *
              </label>
              <input
                type="date"
                id="measurement_date"
                name="measurement_date"
                required
                value={formData.measurement_date}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="measurement_time" className="block text-sm font-medium text-gray-700">
                Heure de mesure
              </label>
              <input
                type="time"
                id="measurement_time"
                name="measurement_time"
                value={formData.measurement_time}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-green-600 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="location_details" className="block text-sm font-medium text-gray-700">
              Emplacement précis
            </label>
            <input
              type="text"
              id="location_details"
              name="location_details"
              value={formData.location_details}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-green-600 sm:text-sm"
              placeholder="Zone d'extraction nord, point de mesure 3..."
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-green-600 sm:text-sm"
              placeholder="Observations, conditions météo..."
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Link
            to="/environment"
            className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Enregistrement...' : (isEdit ? 'Mettre à jour' : 'Enregistrer')}
          </button>
        </div>
      </form>
    </div>
  );
}
