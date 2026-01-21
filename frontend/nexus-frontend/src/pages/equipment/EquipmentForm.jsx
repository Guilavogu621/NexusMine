import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';

export default function EquipmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [sites, setSites] = useState([]);
  
  const [formData, setFormData] = useState({
    equipment_code: '',
    name: '',
    equipment_type: 'OTHER',
    status: 'OPERATIONAL',
    site: '',
    commissioning_date: '',
    manufacturer: '',
    model: '',
    serial_number: '',
  });

  useEffect(() => {
    fetchSites();
    if (isEdit) {
      fetchEquipment();
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

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/equipment/${id}/`);
      setFormData({
        equipment_code: response.data.equipment_code || '',
        name: response.data.name || '',
        equipment_type: response.data.equipment_type || 'OTHER',
        status: response.data.status || 'OPERATIONAL',
        site: response.data.site || '',
        commissioning_date: response.data.commissioning_date || '',
        manufacturer: response.data.manufacturer || '',
        model: response.data.model || '',
        serial_number: response.data.serial_number || '',
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
        commissioning_date: formData.commissioning_date || null,
      };

      if (isEdit) {
        await api.put(`/equipment/${id}/`, dataToSend);
      } else {
        await api.post('/equipment/', dataToSend);
      }
      navigate('/equipment');
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
          to="/equipment"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Modifier l\'équipement' : 'Nouvel équipement'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEdit ? 'Modifiez les informations' : 'Ajoutez un nouvel équipement'}
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
          {/* Code et Nom */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="equipment_code" className="block text-sm font-medium text-gray-700">
                Code équipement *
              </label>
              <input
                type="text"
                id="equipment_code"
                name="equipment_code"
                required
                value={formData.equipment_code}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                placeholder="EQP-001"
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nom / Désignation *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                placeholder="Camion benne CAT 777"
              />
            </div>
          </div>

          {/* Type et Site */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="equipment_type" className="block text-sm font-medium text-gray-700">
                Type d'équipement *
              </label>
              <select
                id="equipment_type"
                name="equipment_type"
                required
                value={formData.equipment_type}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              >
                <option value="TRUCK">Camion</option>
                <option value="EXCAVATOR">Pelle excavatrice</option>
                <option value="LOADER">Chargeuse</option>
                <option value="DRILL">Foreuse</option>
                <option value="CRUSHER">Concasseur</option>
                <option value="CONVEYOR">Convoyeur</option>
                <option value="PUMP">Pompe</option>
                <option value="GENERATOR">Générateur</option>
                <option value="OTHER">Autre</option>
              </select>
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

          {/* Fabricant et Modèle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700">
                Fabricant
              </label>
              <input
                type="text"
                id="manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                placeholder="Caterpillar"
              />
            </div>
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                Modèle
              </label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
                placeholder="777G"
              />
            </div>
          </div>

          {/* Numéro de série */}
          <div>
            <label htmlFor="serial_number" className="block text-sm font-medium text-gray-700">
              Numéro de série
            </label>
            <input
              type="text"
              id="serial_number"
              name="serial_number"
              value={formData.serial_number}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              placeholder="SN-123456789"
            />
          </div>

          {/* Statut et Date de mise en service */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                État *
              </label>
              <select
                id="status"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              >
                <option value="OPERATIONAL">Opérationnel</option>
                <option value="MAINTENANCE">En maintenance</option>
                <option value="BREAKDOWN">En panne</option>
                <option value="RETIRED">Hors service</option>
              </select>
            </div>
            <div>
              <label htmlFor="commissioning_date" className="block text-sm font-medium text-gray-700">
                Date de mise en service
              </label>
              <input
                type="date"
                id="commissioning_date"
                name="commissioning_date"
                value={formData.commissioning_date}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Link
            to="/equipment"
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
              isEdit ? 'Mettre à jour' : 'Créer l\'équipement'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
