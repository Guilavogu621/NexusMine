import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CubeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  MapPinIcon,
  ScaleIcon,
  ClipboardDocumentListIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useFormPermissions from '../../hooks/useFormPermissions';
import ReadOnlyBanner from '../../components/ui/ReadOnlyBanner';
import SearchableSelect from '../../components/ui/SearchableSelect';

const mineralOptions = [
  { value: 'BAUXITE', label: 'Bauxite', emoji: '🪨' },
  { value: 'IRON', label: 'Fer', emoji: '⛓️' },
  { value: 'GOLD', label: 'Or', emoji: '💰' },
  { value: 'DIAMOND', label: 'Diamant', emoji: '💎' },
  { value: 'MANGANESE', label: 'Manganèse', emoji: '🔋' },
  { value: 'URANIUM', label: 'Uranium', emoji: '☢️' },
  { value: 'OTHER', label: 'Autre', emoji: '📦' },
];

const movementOptions = [
  { value: 'INITIAL', label: 'Stock initial', icon: '📦', color: 'indigo', desc: 'Mise en place du stock de départ' },
  { value: 'EXTRACTION', label: 'Extraction', icon: '⛏️', color: 'emerald', desc: 'Entrée suite à une extraction minière' },
  { value: 'EXPEDITION', label: 'Expédition', icon: '🚚', color: 'orange', desc: 'Sortie pour livraison client/port' },
  { value: 'TRANSFER_IN', label: 'Transfert entrant', icon: '📥', color: 'sky', desc: 'Réception depuis un autre site' },
  { value: 'TRANSFER_OUT', label: 'Transfert sortant', icon: '📤', color: 'violet', desc: 'Envoi vers un autre emplacement interne' },
  { value: 'ADJUSTMENT', label: 'Ajustement', icon: '⚙️', color: 'slate', desc: 'Correction manuelle d\'inventaire' },
  { value: 'LOSS', label: 'Perte/Déchet', icon: '⚠️', color: 'red', desc: 'Soustraction pour dégradation ou perte' },
];

const colorMap = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', accent: 'bg-indigo-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', accent: 'bg-emerald-600' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100', accent: 'bg-orange-600' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-100', accent: 'bg-sky-600' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-100', accent: 'bg-violet-600' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-100', accent: 'bg-slate-600' },
  red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', accent: 'bg-red-600' },
};

export default function StockForm() {
  const navigate = useNavigate();
  const { readOnly, canSubmit, roleBanner } = useFormPermissions('stock');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState([]);
  const [operations, setOperations] = useState([]);

  const [formData, setFormData] = useState({
    movement_code: `MOV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
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
    if (readOnly) return;
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
      setError('Impossible d\'enregistrer le mouvement. Vérifiez les champs obligatoires.');
    } finally {
      setSaving(false);
    }
  };

  const selectedMovement = movementOptions.find(m => m.value === formData.movement_type);
  const style = selectedMovement ? colorMap[selectedMovement.color] : colorMap.indigo;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative z-10 space-y-8 pb-12 px-4 sm:px-6 lg:px-8 pt-8 max-w-4xl mx-auto animate-fadeIn">

        {/* ── HEADER PREMIUM ── */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 shadow-2xl animate-fadeInDown">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="stockFormGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
              <rect width="100" height="100" fill="url(#stockFormGrid)" />
            </svg>
          </div>

          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500"></div>

          <div className="relative p-8 px-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-start gap-6">
                <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-xl ring-1 ring-white/30">
                  <CubeIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => navigate('/stock')}
                      className="text-blue-100 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 font-outfit"
                    >
                      <ArrowLeftIcon className="h-3.5 w-3.5" />
                      Inventaire
                    </button>
                    <span className="text-blue-200/50 text-xs">/</span>
                    <span className="text-white text-xs font-bold uppercase tracking-widest font-outfit">Nouveau mouvement</span>
                  </div>
                  <h1 className="text-3xl font-bold text-white tracking-tight font-outfit">
                    Nouveau Mouvement
                  </h1>
                </div>
              </div>

              <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest ${style.bg} ${style.text} border border-white/20 self-start sm:self-auto shadow-lg`}>
                <span className="text-base">{selectedMovement?.icon}</span>
                {selectedMovement?.label}
              </div>
            </div>
          </div>
        </div>

        {roleBanner && <ReadOnlyBanner message={roleBanner} />}

        <form onSubmit={handleSubmit} className="space-y-6 animate-slideUp">

          {/* Card 1: Configuration du Flux */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className={`p-2.5 rounded-xl ${style.accent} text-white`}>
                  <ClipboardDocumentListIcon className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Configuration du flux</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">ID Mouvement</label>
                  <input
                    name="movement_code"
                    value={formData.movement_code}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nature du mouvement</label>
                  <select
                    name="movement_type"
                    value={formData.movement_type}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                  >
                    {movementOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Date d'enregistrement</label>
                  <input
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Opération source</label>
                  <select
                    name="operation"
                    value={formData.operation}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-700 appearance-none"
                  >
                    <option value="">Aucune opération liée</option>
                    {operations.map((op) => (
                      <option key={op.id} value={op.id}>{op.operation_code}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={`mt-8 p-4 rounded-2xl border-2 border-dashed ${style.border} ${style.bg} flex items-center gap-4`}>
                <span className="text-2xl">{selectedMovement?.icon}</span>
                <p className={`text-sm font-semibold ${style.text}`}>{selectedMovement?.desc}</p>
              </div>
            </div>
          </div>

          {/* Card 2: Détails du Minerai & Localisation */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 rounded-xl bg-emerald-600 text-white">
                  <ScaleIcon className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Détails de charge</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Minerai</label>
                  <div className="grid grid-cols-2 gap-2">
                    {mineralOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, mineral_type: opt.value }))}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all font-bold text-sm ${formData.mineral_type === opt.value
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-100 hover:border-slate-200 text-slate-500'
                          }`}
                      >
                        <span>{opt.emoji}</span> {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Quantité (Tonnes)</label>
                    <div className="relative">
                      <input
                        name="quantity"
                        type="number"
                        step="0.01"
                        value={formData.quantity}
                        onChange={handleChange}
                        required
                        placeholder="0.00"
                        className="w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all font-black text-xl text-slate-800"
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-300">T</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Teneur / Grade (%)</label>
                    <div className="relative">
                      <input
                        name="grade"
                        type="number"
                        step="0.01"
                        value={formData.grade}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700"
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-300">%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 pt-10 border-t border-slate-50">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Emplacement Source</label>
                  <SearchableSelect
                    options={locations}
                    value={formData.location}
                    onChange={(val) => setFormData(prev => ({ ...prev, location: val }))}
                    placeholder="Tapez pour chercher une zone source..."
                    required={true}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Emplacement Cible (Optionnel)</label>
                  <SearchableSelect
                    options={locations}
                    value={formData.destination_location}
                    onChange={(val) => setFormData(prev => ({ ...prev, destination_location: val }))}
                    placeholder="Tapez pour chercher une zone cible..."
                    required={false}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Logistique & Notes */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 rounded-xl bg-orange-600 text-white">
                  <TruckIcon className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Suivi logistique</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Client / Destination finale</label>
                  <input
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    placeholder="ex: Port de San Pedro / Client Final"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Ref. Transport (BL/Truck ID)</label>
                  <input
                    name="transport_reference"
                    value={formData.transport_reference}
                    onChange={handleChange}
                    placeholder="ex: TRUCK-8890-AB"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700"
                  />
                </div>
              </div>

              <div className="mt-8 space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Observations supplémentaires</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 resize-none"
                  placeholder="Notes sur la qualité, conditions météo, incidents..."
                />
              </div>
            </div>
          </div>

          {/* Erreur et Actions */}
          {error && (
            <div className="p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 animate-shake">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              <p className="text-sm font-bold text-red-700">{error}</p>
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center gap-4 pt-4">
            {canSubmit && (
              <button
                type="submit"
                disabled={saving || readOnly}
                className="w-full md:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-2xl shadow-slate-900/30 hover:bg-black hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
              >
                {saving ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                ) : (
                  <>
                    <CheckCircleIcon className="h-6 w-6" />
                    Valider le mouvement
                  </>
                )}
              </button>
            )}

            <Link
              to="/stock"
              className="w-full md:w-auto px-10 py-5 bg-white text-slate-500 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all text-center"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }

        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-shake { animation: shake 0.3s ease-in-out; }

        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </div>
  );
}