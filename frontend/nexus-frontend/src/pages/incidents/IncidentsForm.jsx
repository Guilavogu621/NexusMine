import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';

export default function IncidentsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [sites, setSites] = useState([]);
  
  const [formData, setFormData] = useState({
    incident_code: '',
    incident_type: 'OTHER',
    site: '',
    date: '',
    time: '',
    severity: 'LOW',
    status: 'REPORTED',
    description: '',
    actions_taken: '',
  });

  useEffect(() => {
    fetchSites();
    if (isEdit) {
      fetchIncident();
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

  const fetchIncident = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/incidents/${id}/`);
      setFormData({
        incident_code: response.data.incident_code || '',
        incident_type: response.data.incident_type || 'OTHER',
        site: response.data.site || '',
        date: response.data.date || '',
        time: response.data.time || '',
        severity: response.data.severity || 'LOW',
        status: response.data.status || 'REPORTED',
        description: response.data.description || '',
        actions_taken: response.data.actions_taken || '',
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
        time: formData.time || null,
      };

      if (isEdit) {
        await api.put(`/incidents/${id}/`, dataToSend);
      } else {
        await api.post('/incidents/', dataToSend);
      }
      navigate('/incidents');
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
          to="/incidents"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Modifier l\'incident' : 'Déclarer un incident'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEdit ? 'Modifiez les informations' : 'Enregistrez un nouvel incident'}
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
          {/* Code et Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="incident_code" className="block text-sm font-medium text-gray-700">
                Code incident *
              </label>
              <input
                type="text"
                id="incident_code"
                name="incident_code"
                required
                value={formData.incident_code}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                placeholder="INC-2025-001"
              />
            </div>
            <div>
              <label htmlFor="incident_type" className="block text-sm font-medium text-gray-700">
                Type d'incident *
              </label>
              <select
                id="incident_type"
                name="incident_type"
                required
                value={formData.incident_type}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              >
                <option value="ACCIDENT">Accident corporel</option>
                <option value="EQUIPMENT_FAILURE">Panne équipement</option>
                <option value="ENVIRONMENTAL">Incident environnemental</option>
                <option value="SECURITY">Incident de sécurité</option>
                <option value="LANDSLIDE">Glissement de terrain</option>
                <option value="FIRE">Incendie</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
          </div>

          {/* Site */}
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
              className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
            >
              <option value="">Sélectionner un site</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </div>

          {/* Date, Heure et Gravité */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                Heure
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
                Gravité *
              </label>
              <select
                id="severity"
                name="severity"
                required
                value={formData.severity}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              >
                <option value="LOW">Faible</option>
                <option value="MEDIUM">Moyen</option>
                <option value="HIGH">Élevé</option>
                <option value="CRITICAL">Critique</option>
              </select>
            </div>
          </div>

          {/* Statut */}
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
              <option value="REPORTED">Déclaré</option>
              <option value="INVESTIGATING">En investigation</option>
              <option value="RESOLVED">Résolu</option>
              <option value="CLOSED">Clôturé</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description détaillée *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              placeholder="Décrivez l'incident en détail..."
            />
          </div>

          {/* Actions prises */}
          <div>
            <label htmlFor="actions_taken" className="block text-sm font-medium text-gray-700">
              Actions prises
            </label>
            <textarea
              id="actions_taken"
              name="actions_taken"
              rows={3}
              value={formData.actions_taken}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              placeholder="Quelles actions ont été prises..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Link
            to="/incidents"
            className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              isEdit ? 'Mettre à jour' : 'Déclarer l\'incident'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
