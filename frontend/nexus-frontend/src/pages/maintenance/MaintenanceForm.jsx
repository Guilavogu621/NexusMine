import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import DateRangeInput from '../../components/ui/DateRangeInput';

const typeOptions = [
  { value: 'PREVENTIVE', label: 'Préventive' },
  { value: 'CORRECTIVE', label: 'Corrective' },
  { value: 'INSPECTION', label: 'Inspection' },
  { value: 'OVERHAUL', label: 'Révision générale' },
  { value: 'REPAIR', label: 'Réparation' },
];

const statusOptions = [
  { value: 'SCHEDULED', label: 'Planifiée' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'COMPLETED', label: 'Terminée' },
  { value: 'CANCELLED', label: 'Annulée' },
];

export default function MaintenanceForm() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [equipment, setEquipment] = useState([]);

  const [formData, setFormData] = useState({
    maintenance_code: '',
    maintenance_type: 'PREVENTIVE',
    status: 'SCHEDULED',
    equipment: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    start_date: '',
    end_date: '',
    description: '',
    findings: '',
    actions_taken: '',
    parts_replaced: '',
    cost: '',
    hours_at_maintenance: '',
  });

  const [dateRangeValid, setDateRangeValid] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/equipment/?page_size=200');
        setEquipment(response.data.results || response.data);
      } catch (err) {
        console.error('Erreur chargement équipements:', err);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    // Validation finale des dates
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (start >= end) {
        setError('La date de fin doit être après la date de début.');
        setSaving(false);
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        cost: formData.cost || null,
        hours_at_maintenance: formData.hours_at_maintenance || null,
      };
      await api.post('/maintenance/', payload);
      navigate('/maintenance');
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      setError(err.response?.data?.detail || r) {
      console.error('Erreur sauvegarde:', err);
      setError('Impossible d\'enregistrer la maintenance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/maintenance" className="p-2 rounded-lg hover:bg-slate-100">
          <ArrowLeftIcon className="h-5 w-5 text-slate-500" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 rounded-xl">
            <WrenchScrewdriverIcon className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Nouvelle maintenance</h1>
            <p className="text-base text-slate-500">Planifier ou enregistrer une intervention</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-base">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-semibold text-slate-700">Code *</label>
            <input
              name="maintenance_code"
              value={formData.maintenance_code}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-xl border border-slate-200/60 px-3 py-3 text-base focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-base font-semibold text-slate-700">Équipement *</label>
            <select
              name="equipment"
              value={formData.equipment}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-xl border border-slate-200/60 px-3 py-3 text-base focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Sélectionner</option>
              {equipment.map((eq) => (
                <option key={eq.id} value={eq.id}>{eq.equipment_code} • {eq.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-base font-semibold text-slate-700">Type *</label>
            <select
              name="maintenance_type"
              value={formData.maintenance_type}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200/60 px-3 py-3 text-base focus:ring-2 focus:ring-amber-500"
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-base font-semibold text-slate-700">Statut *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200/60 px-3 py-3 text-base focus:ring-2 focus:ring-amber-500"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-base font-semibold text-slate-700">Date prévue *</label>
            <input
              type="date"
              name="scheduled_date"
              value={formData.scheduled_date}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-xl border border-slate-200/60 px-3 py-3 text-base focus:ring-2 focus:ring-amber-500"
        </div>

        {/* Plage de dates avec validation */}
        <div className="mt-6 border-t border-slate-200/60 pt-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Dates d'intervention</h3>
          <DateRangeInput
            startValue={formData.start_date}
            endValue={formData.end_date}
            onStartChange={(value) => setFormData({ ...formData, start_date: value })}
            onEndChange={(value) => setFormData({ ...formData, end_date: value })}
            startLabel="Date/heure de début"
            endLabel="Date/heure de fin"
            startName="start_date"
            endName="end_date"
            type="datetime-local"
            showDuration={true}
            onValidationChange={(validation) => setDateRangeValid(validation.isValid)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div>
            <label className="block text-base font-semibold text-slate-700">Coût (GNF)</label>
            <input
              type="number"
              step="0.01"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200/60 px-3 py-3 text-base focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 
            <label className="block text-base font-semibold text-slate-700">Coût (GNF)</label>
            <input
              type="number"
              step="0.01"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200/60 px-3 py-3 text-base focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-base font-semibold text-slate-700">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            required
            className="mt-2 w-full rounded-xl border border-slate-200/60 px-3 py-3 text-base focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-base font-semibold text-slate-700">Constatations</label>
            <textarea
              name="findings"
              value={formData.findings}
              onChange={handleChange}
              rows={3}
              className="mt-2 w-full rounded-xl border border-slate-200/60 px-3 py-3 text-base focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-base font-semibold text-slate-700">Actions réalisées</label>
            <textarea
              name="actions_taken"
              value={formData.actions_taken}
              onChange={handleChange}
              rows={3}
              className="mt-2 w-full rounded-xl border border-slate-200/60 px-3 py-3 text-base focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-base font-semibold text-slate-700">Pièces remplacées</label>
            <textarea
              name="parts_replaced"
              value={formData.parts_replaced}
              onChange={handleChange}
              rows={2}
              className="mt-2 w-full rounded-xl border border-slate-200/60 px-3 py-3 text-base focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-base font-semibold text-slate-700">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="mt-2 w-full rounded-xl border border-slate-200/60 px-3 py-3 text-base focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-base font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <Link to="/maintenance" className="text-base font-medium text-slate-500 hover:text-slate-600">Annuler</Link>
        </div>
      </form>
    </div>
  );
}
