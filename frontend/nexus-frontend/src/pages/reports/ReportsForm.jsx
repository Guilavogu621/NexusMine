import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';

export default function ReportsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [sites, setSites] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    report_type: 'MONTHLY',
    status: 'DRAFT',
    site: '',
    period_start: '',
    period_end: '',
    summary: '',
    content: '',
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
      const response = await api.get(`/reports/${id}/`);
      setFormData({
        title: response.data.title || '',
        report_type: response.data.report_type || 'MONTHLY',
        status: response.data.status || 'DRAFT',
        site: response.data.site || '',
        period_start: response.data.period_start || '',
        period_end: response.data.period_end || '',
        summary: response.data.summary || '',
        content: response.data.content || '',
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
      };

      if (isEdit) {
        await api.put(`/reports/${id}/`, dataToSend);
      } else {
        await api.post('/reports/', dataToSend);
      }
      navigate('/reports');
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/reports"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Modifier le rapport' : 'Nouveau rapport'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEdit ? 'Modifiez les informations du rapport' : 'Créez un nouveau rapport'}
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
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Titre *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-600 sm:text-sm"
              placeholder="Titre du rapport"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="report_type" className="block text-sm font-medium text-gray-700">
                Type de rapport *
              </label>
              <select
                id="report_type"
                name="report_type"
                required
                value={formData.report_type}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-purple-600 sm:text-sm"
              >
                <option value="DAILY">Journalier</option>
                <option value="WEEKLY">Hebdomadaire</option>
                <option value="MONTHLY">Mensuel</option>
                <option value="QUARTERLY">Trimestriel</option>
                <option value="ANNUAL">Annuel</option>
                <option value="INCIDENT">Incident</option>
                <option value="ENVIRONMENTAL">Environnemental</option>
                <option value="CUSTOM">Personnalisé</option>
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
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-purple-600 sm:text-sm"
              >
                <option value="DRAFT">Brouillon</option>
                <option value="GENERATED">Généré</option>
                <option value="VALIDATED">Validé</option>
                <option value="PUBLISHED">Publié</option>
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
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-purple-600 sm:text-sm"
              >
                <option value="">Multi-sites</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="period_start" className="block text-sm font-medium text-gray-700">
                Début de période *
              </label>
              <input
                type="date"
                id="period_start"
                name="period_start"
                required
                value={formData.period_start}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-purple-600 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="period_end" className="block text-sm font-medium text-gray-700">
                Fin de période *
              </label>
              <input
                type="date"
                id="period_end"
                name="period_end"
                required
                value={formData.period_end}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-purple-600 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
              Résumé
            </label>
            <textarea
              id="summary"
              name="summary"
              rows={3}
              value={formData.summary}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-600 sm:text-sm"
              placeholder="Résumé du rapport..."
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Contenu
            </label>
            <textarea
              id="content"
              name="content"
              rows={10}
              value={formData.content}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border-0 py-2.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-600 sm:text-sm font-mono"
              placeholder="Contenu détaillé du rapport..."
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Link
            to="/reports"
            className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Enregistrement...' : (isEdit ? 'Mettre à jour' : 'Créer le rapport')}
          </button>
        </div>
      </form>
    </div>
  );
}
