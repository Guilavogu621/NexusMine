import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CubeIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useFormPermissions from '../../hooks/useFormPermissions';
import ReadOnlyBanner from '../../components/ui/ReadOnlyBanner';

const mineralOptions = [
  { value: 'BAUXITE', label: 'Bauxite' },
  { value: 'IRON', label: 'Fer' },
  { value: 'GOLD', label: 'Or' },
  { value: 'DIAMOND', label: 'Diamant' },
  { value: 'MANGANESE', label: 'Manganèse' },
  { value: 'URANIUM', label: 'Uranium' },
  { value: 'OTHER', label: 'Autre' },
];

const movementOptions = [
  { value: 'INITIAL', label: 'Stock initial' },
  { value: 'EXTRACTION', label: 'Extraction' },
  { value: 'EXPEDITION', label: 'Expédition' },
  { value: 'TRANSFER_IN', label: 'Transfert entrant' },
  { value: 'TRANSFER_OUT', label: 'Transfert sortant' },
  { value: 'ADJUSTMENT', label: 'Ajustement' },
  { value: 'LOSS', label: 'Perte/Déchet' },
];

export default function StockForm() {
  const navigate = useNavigate();
  const { readOnly, canSubmit, roleBanner } = useFormPermissions('stock');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState([]);
  const [operations, setOperations] = useState([]);

  const [formData, setFormData] = useState({
    movement_code: '',
    movement_type: 'EXTRACTION',
    location: '',
    destination_location: '',
    mineral_type: 'BAUXITE',
    quantity: '',
    grade: '',
    date: new Date().toISOString().split('T')[0],
    operation: '',
    destination: '',
    transport_reference: '',
    notes: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [locRes, opRes] = await Promise.all([
          api.get('/stock-locations/'),
          api.get('/operations/?ordering=-date&page_size=50'),
        ]);
        setLocations(locRes.data.results || locRes.data);
        setOperations(opRes.data.results || opRes.data);
      } catch (err) {
        console.error('Erreur chargement:', err);
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
    setError(null);

    try {
      const payload = {
        ...formData,
        destination_location: formData.destination_location || null,
        operation: formData.operation || null,
        grade: formData.grade || null,
      };
      await api.post('/stock-movements/', payload);
      navigate('/stock');
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      setError('Impossible d\'enregistrer le mouvement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/stock"
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-slate-500" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <CubeIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Nouveau mouvement</h1>
            <p className="text-base text-slate-500">Enregistrer une entrée ou sortie de stock</p>
          </div>
        </div>
      </div>

      <ReadOnlyBanner message={roleBanner} />

      <form onSubmit={readOnly ? (e) => e.preventDefault() : handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-base">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-semibold text-slate-700">Code mouvement *</label>
            <input
              name="movement_code"
              value={formData.movement_code}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-xl border border-slate-200/60 px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-base font-semibold text-slate-700">Type *</label>
            <select
              name="movement_type"
              value={formData.movement_type}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200/60 px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500"
            >
              {movementOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-base font-semibold text-slate-700">Emplacement *</label>
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-xl border border-slate-200/60 px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Sélectionner</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.code} • {loc.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-base font-semibold text-slate-700">Destination (transfert)</label>
            <select
              name="destination_location"
              value={formData.destination_location}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200/60 px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Aucune</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.code} • {loc.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-base font-semibold text-slate-700">Minerai *</label>
            <select
              name="mineral_type"
              value={formData.mineral_type}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200/60 px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500"
            >
              {mineralOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-base font-semibold text-slate-700">Quantité (t) *</label>
            <input
              name="quantity"
              type="number"
              step="0.01"
              value={formData.quantity}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-xl border border-slate-200/60 px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-base font-semibold text-slate-700">Grade (%)</label>
            <input
              name="grade"
              type="number"
              step="0.01"
              value={formData.grade}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200/60 px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-base font-semibold text-slate-700">Date *</label>
            <input
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-xl border border-slate-200/60 px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-base font-semibold text-slate-700">Opération liée</label>
            <select
              name="operation"
              value={formData.operation}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200/60 px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Aucune</option>
              {operations.map((op) => (
                <option key={op.id} value={op.id}>{op.operation_code}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-base font-semibold text-slate-700">Destination (client/port)</label>
            <input
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200/60 px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-base font-semibold text-slate-700">Référence transport</label>
            <input
              name="transport_reference"
              value={formData.transport_reference}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200/60 px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-base font-semibold text-slate-700">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="mt-2 w-full rounded-xl border border-slate-200/60 px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="mt-6 flex items-center gap-3">
          {canSubmit && (
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          )}
          <Link to="/stock" className="text-base font-medium text-slate-500 hover:text-slate-600">{canSubmit ? 'Annuler' : '← Retour'}</Link>
        </div>
      </form>
    </div>
  );
}
