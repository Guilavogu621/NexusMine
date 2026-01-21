import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';

export default function OperationsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [sites, setSites] = useState([]);
  
  const [formData, setFormData] = useState({
    operation_code: '',
    operation_type: 'EXTRACTION',
    site: '',
    date: '',
    start_time: '',
    end_time: '',
    status: 'PLANNED',
    description: '',
    quantity_extracted: '',
  });

  useEffect(() => {
    fetchSites();
    if (isEdit) {
      fetchOperation();
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

  const fetchOperation = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/operations/${id}/`);
      setFormData({
        operation_code: response.data.operation_code || '',
        operation_type: response.data.operation_type || 'EXTRACTION',
        site: response.data.site || '',
        date: response.data.date || '',
        start_time: response.data.start_time || '',
        end_time: response.data.end_time || '',
        status: response.data.status || 'PLANNED',
        description: response.data.description || '',
        quantity_extracted: response.data.quantity_extracted || '',
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
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        quantity_extracted: formData.quantity_extracted || null,
      };

      if (isEdit) {
        await api.put(`/operations/${id}/`, dataToSend);
      } else {
        await api.post('/operations/', dataToSend);
      }
      navigate('/operations');
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
          to="/operations"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Modifier l\'opération' : 'Nouvelle opération'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEdit ? 'Modifiez les informations' : 'Ajoutez une nouvelle opération minière'}
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
              <label htmlFor="operation_code" className="block text-sm font-medium text-gray-700">
                Code opération *
              </label>
              <input
                type="text"
                id="operation_code"
                name="operation_code"
                required
                value={formData.operation_code}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                placeholder="OP-2025-001"
              />
            </div>
            <div>
              <label htmlFor="operation_type" className="block text-sm font-medium text-gray-700">
                Type d'opération *
              </label>
              <select
                id="operation_type"
                name="operation_type"
                required
                value={formData.operation_type}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              >
                <option value="EXTRACTION">Extraction</option>
                <option value="DRILLING">Forage</option>
                <option value="BLASTING">Dynamitage</option>
                <option value="TRANSPORT">Transport</option>
                <option value="PROCESSING">Traitement</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="INSPECTION">Inspection</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
          </div>

          {/* Site et Statut */}
          <div className="grid grid-cols-2 gap-4">
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
                <option value="PLANNED">Planifiée</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="COMPLETED">Terminée</option>
                <option value="CANCELLED">Annulée</option>
              </select>
            </div>
          </div>

          {/* Date et Heures */}
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
              <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
                Heure début
              </label>
              <input
                type="time"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
                Heure fin
              </label>
              <input
                type="time"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              />
            </div>
          </div>

          {/* Quantité extraite */}
          <div>
            <label htmlFor="quantity_extracted" className="block text-sm font-medium text-gray-700">
              Quantité extraite (tonnes)
            </label>
            <input
              type="number"
              id="quantity_extracted"
              name="quantity_extracted"
              step="0.01"
              min="0"
              value={formData.quantity_extracted}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              placeholder="0.00"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              placeholder="Détails de l'opération..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Link
            to="/operations"
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
              isEdit ? 'Mettre à jour' : 'Créer l\'opération'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
