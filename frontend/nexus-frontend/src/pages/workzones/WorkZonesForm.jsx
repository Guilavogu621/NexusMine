import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  MapIcon,
  MapPinIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  HashtagIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import {
  InputField,
  SelectField,
  TextareaField,
  Switch,
  Button,
  Card,
  FormSection,
  Alert,
} from '../../components/ui';
import PageHeader from '../../components/ui/PageHeader';
import { LoadingSpinner } from '../../components/ui/UIComponents';

export default function WorkZonesForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [sites, setSites] = useState([]);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    site: '',
    gps_latitude: '',
    gps_longitude: '',
    zone_geojson: '',
    description: '',
    is_active: true,
  });

  // eslint-disable-next-line no-unused-vars
  const [success, setSuccess] = useState(false);

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
      const response = await api.get(`/work-zones/${id}/`);
      setFormData({
        code: response.data.code || '',
        name: response.data.name || '',
        site: response.data.site || '',
        gps_latitude: response.data.gps_latitude ?? '',
        gps_longitude: response.data.gps_longitude ?? '',
        zone_geojson: response.data.zone_geojson ? JSON.stringify(response.data.zone_geojson, null, 2) : '',
        description: response.data.description || '',
        is_active: response.data.is_active ?? true,
      });
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
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
    
    try {
      setSaving(true);
      setError(null);
      
      let zoneGeojson = null;
      if (formData.zone_geojson.trim()) {
        try {
          zoneGeojson = JSON.parse(formData.zone_geojson);
        } catch {
          setError('Le format GeoJSON est invalide');
          setSaving(false);
          return;
        }
      }
      
      const payload = {
        ...formData,
        site: parseInt(formData.site),
        gps_latitude: formData.gps_latitude !== '' ? parseFloat(formData.gps_latitude) : null,
        gps_longitude: formData.gps_longitude !== '' ? parseFloat(formData.gps_longitude) : null,
        zone_geojson: zoneGeojson,
      };
      
      if (isEdit) {
        await api.put(`/work-zones/${id}/`, payload);
      } else {
        await api.post('/work-zones/', payload);
      }
      
      navigate('/workzones');
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      if (err.response?.data) {
        const errors = Object.entries(err.response.data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        setError(errors);
      } else {
        setError('Erreur lors de la sauvegarde');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Chargement de la zone..." />;
  }

  const siteOptions = sites.map(site => ({ value: site.id, label: site.name }));

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <PageHeader
        title={isEdit ? 'Modifier la zone' : 'Nouvelle zone de travail'}
        subtitle={isEdit ? 'Modifiez les paramètres de la zone' : 'Définissez une zone d\'opération au sein d\'un site minier'}
        backLink="/workzones"
        icon={MapIcon}
        iconColor="bg-indigo-500"
        breadcrumbs={[
          { label: 'Zones de travail', link: '/workzones' },
          { label: isEdit ? 'Modifier' : 'Nouvelle' },
        ]}
      />

      {success && (
        <Alert type="success" title="Succès !">
          {isEdit ? 'Zone modifiée avec succès.' : 'Zone créée avec succès.'} Redirection...
        </Alert>
      )}

      {error && (
        <Alert type="error" title="Erreur" onClose={() => setError(null)}>
          <pre className="whitespace-pre-line font-sans">{error}</pre>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identification */}
        <Card>
          <FormSection
            title="Identification"
            description="Informations de base de la zone"
            icon={HashtagIcon}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Code de la zone"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                placeholder="Ex: ZONE-A1, PIT-NORTH"
                icon={HashtagIcon}
                className="font-mono"
              />

              <SelectField
                label="Site minier"
                name="site"
                value={formData.site}
                onChange={handleChange}
                options={[{ value: '', label: 'Sélectionner un site' }, ...siteOptions]}
                required
                icon={MapPinIcon}
              />

              <div className="md:col-span-2">
                <InputField
                  label="Nom de la zone"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Carrière Nord, Zone d'extraction principale"
                  icon={DocumentTextIcon}
                />
              </div>

              <div className="md:col-span-2">
                <TextareaField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Description de la zone, activités principales..."
                />
              </div>
            </div>
          </FormSection>
        </Card>

        {/* Géolocalisation */}
        <Card>
          <FormSection
            title="Géolocalisation"
            description="Coordonnées GPS et délimitation de la zone"
            icon={GlobeAltIcon}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-indigo-50 rounded-xl p-4 border border-blue-100">
                <label className="block text-base font-semibold text-blue-700 mb-3">
                  📍 Latitude GPS (centroïde)
                </label>
                <input
                  type="number"
                  step="any"
                  name="gps_latitude"
                  value={formData.gps_latitude}
                  onChange={handleChange}
                  placeholder="Ex: 10.123456"
                  className="w-full px-4 py-3 text-base border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                />
                <p className="text-sm text-indigo-600 mt-2">Valeur entre -90 et 90</p>
              </div>

              <div className="bg-indigo-50 rounded-xl p-4 border border-blue-100">
                <label className="block text-base font-semibold text-blue-700 mb-3">
                  📍 Longitude GPS (centroïde)
                </label>
                <input
                  type="number"
                  step="any"
                  name="gps_longitude"
                  value={formData.gps_longitude}
                  onChange={handleChange}
                  placeholder="Ex: -12.654321"
                  className="w-full px-4 py-3 text-base border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                />
                <p className="text-sm text-indigo-600 mt-2">Valeur entre -180 et 180</p>
              </div>

              <div className="md:col-span-2">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
                  <label className="block text-base font-semibold text-slate-700 mb-3">
                    🗺️ Polygone de la zone (GeoJSON)
                  </label>
                  <textarea
                    name="zone_geojson"
                    value={formData.zone_geojson}
                    onChange={handleChange}
                    rows={6}
                    placeholder='{"type": "Polygon", "coordinates": [[[lng1, lat1], [lng2, lat2], [lng3, lat3], [lng1, lat1]]]}'
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-base bg-white"
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    Format GeoJSON pour définir les limites précises de la zone (optionnel)
                  </p>
                </div>
              </div>
            </div>
          </FormSection>
        </Card>

        {/* Statut */}
        <Card>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="font-medium text-slate-800">Zone active</p>
              <p className="text-base text-slate-500">Autoriser les opérations dans cette zone</p>
            </div>
            <Switch
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/workzones')}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={saving}
            icon={CheckCircleIcon}
          >
            {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer la zone'}
          </Button>
        </div>
      </form>
    </div>
  );
}
