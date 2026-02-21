import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  WrenchScrewdriverIcon,
  CogIcon,
  MapPinIcon,
  CalendarIcon,
  BuildingStorefrontIcon,
  HashtagIcon,
  CheckIcon,
  CubeIcon,
  InformationCircleIcon,
  IdentificationIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import {
  InputField,
  SelectField,
  Button,
  Alert,
  Badge,
} from '../../components/ui';
import PageHeader from '../../components/ui/PageHeader';
import { LoadingSpinner } from '../../components/ui/UIComponents';
import useFormPermissions from '../../hooks/useFormPermissions';
import ReadOnlyBanner from '../../components/ui/ReadOnlyBanner';

/* ---------------- CONFIG ---------------- */

const EQUIPMENT_TYPES = [
  { value: 'EXCAVATOR', label: '🏗️ Pelle excavatrice' },
  { value: 'TRUCK', label: '🚛 Camion' },
  { value: 'LOADER', label: '🚜 Chargeuse' },
  { value: 'DRILL', label: '🔩 Foreuse' },
  { value: 'CRUSHER', label: '⚙️ Concasseur' },
  { value: 'CONVEYOR', label: '🛤️ Convoyeur' },
  { value: 'PUMP', label: '💧 Pompe' },
  { value: 'GENERATOR', label: '⚡ Générateur' },
  { value: 'OTHER', label: '📦 Autre' },
];

const STATUS_OPTIONS = [
  { value: 'OPERATIONAL', label: 'Opérationnel', color: 'emerald' },
  { value: 'MAINTENANCE', label: 'Maintenance', color: 'amber' },
  { value: 'BREAKDOWN', label: 'En panne', color: 'orange' },
  { value: 'RETIRED', label: 'Hors service', color: 'red' },
];

/* ---------------- STYLED COMPONENTS ---------------- */

const FormCardSection = ({ icon: Icon, title, description, children, delay }) => (
  <div 
    className="bg-[#f0f9ff] rounded-[32px] overflow-hidden mb-8 border border-blue-50 shadow-sm animate-fadeIn"
    style={{ animationDelay: `${delay}s`, opacity: 0, animationFillMode: 'forwards' }}
  >
    <div className="px-8 py-5 flex items-center gap-4">
      <div className="p-2.5 bg-blue-100 rounded-2xl shadow-inner">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
      <div>
        <h2 className="font-black text-slate-800 text-lg tracking-tight">{title}</h2>
        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest leading-none mt-1">{description}</p>
      </div>
    </div>
    <div className="bg-white m-1.5 rounded-[26px] p-8 shadow-sm space-y-6">
      {children}
    </div>
  </div>
);

/* ---------------- MAIN COMPONENT ---------------- */

export default function EquipmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { readOnly, canSubmit, roleBanner } = useFormPermissions('equipment');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
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
    if (isEdit) fetchEquipment();
    else generateEquipmentCode();
  }, [id]);

  const generateEquipmentCode = () => {
    const code = `EQP-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData(prev => ({ ...prev, equipment_code: code }));
  };

  const fetchSites = async () => {
    try {
      const response = await api.get('/sites/');
      const sitesData = response.data.results || response.data;
      setSites(sitesData.map(site => ({ value: site.id, label: site.name })));
    } catch (error) { console.error(error); }
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
    } catch (error) { setError('Impossible de charger les données'); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const dataToSend = { ...formData, commissioning_date: formData.commissioning_date || null };
      if (isEdit) await api.put(`/equipment/${id}/`, dataToSend);
      else await api.post('/equipment/', dataToSend);
      setSuccess(true);
      setTimeout(() => navigate('/equipment'), 1500);
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Une erreur est survenue');
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner text="Chargement..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      
      {/* ── HEADER PREMIUM AZURE ── */}
      <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-r from-blue-600 to-indigo-700 shadow-xl mb-10 animate-fadeInDown">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <div className="relative p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 text-center md:text-left">
            <div className="p-4 bg-white/20 backdrop-blur-md rounded-[28px] shadow-lg">
              <WrenchScrewdriverIcon className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                {isEdit ? 'Édition Matériel' : 'Nouvel Équipement'}
              </h1>
              <p className="text-blue-100 font-medium opacity-90">
                {isEdit ? `Modification de ${formData.equipment_code}` : 'Enregistrement d\'un nouvel actif au parc'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="white" className="!bg-white/10 !text-white border-0 px-4 py-2">
              ID: {formData.equipment_code || 'Auto-généré'}
            </Badge>
          </div>
        </div>
      </div>

      <ReadOnlyBanner message={roleBanner} />

      {success && <Alert type="success" title="Enregistré !" className="mb-6 animate-bounce" />}
      {error && <Alert type="error" title="Erreur" onClose={() => setError(null)} className="mb-6">{error}</Alert>}

      <form onSubmit={readOnly ? (e) => e.preventDefault() : handleSubmit} className="space-y-4">
        
        {/* SECTION 1: IDENTIFICATION */}
        <FormCardSection 
          icon={IdentificationIcon} 
          title="Identification" 
          description="Renseignements administratifs"
          delay={0.1}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputField
              label="Code Equipement"
              name="equipment_code"
              value={formData.equipment_code}
              onChange={handleChange}
              required
              icon={HashtagIcon}
              disabled={readOnly}
            />
            <InputField
              label="Désignation"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Ex: Excavatrice Cat 390"
              icon={CubeIcon}
              disabled={readOnly}
            />
            <SelectField
              label="Catégorie de matériel"
              name="equipment_type"
              value={formData.equipment_type}
              onChange={handleChange}
              required
              options={EQUIPMENT_TYPES}
              disabled={readOnly}
            />
            <SelectField
              label="Site d'affectation"
              name="site"
              value={formData.site}
              onChange={handleChange}
              required
              options={sites}
              icon={MapPinIcon}
              disabled={readOnly}
            />
          </div>
        </FormCardSection>

        {/* SECTION 2: STATUT OPÉRATIONNEL */}
        <FormCardSection 
          icon={BeakerIcon} 
          title="État de Disponibilité" 
          description="Statut opérationnel en temps réel"
          delay={0.2}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATUS_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`
                  relative flex flex-col items-center p-6 rounded-[24px] cursor-pointer border-2 transition-all duration-300
                  ${formData.status === opt.value 
                    ? `bg-${opt.color}-50 border-${opt.color}-500 shadow-md scale-105` 
                    : 'bg-slate-50 border-slate-100 opacity-60 hover:opacity-100 hover:border-slate-300'}
                `}
              >
                <input
                  type="radio"
                  name="status"
                  value={opt.value}
                  checked={formData.status === opt.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <CogIcon className={`h-8 w-8 mb-2 ${formData.status === opt.value ? `text-${opt.color}-600` : 'text-slate-400'}`} />
                <span className={`text-sm font-black uppercase tracking-tight ${formData.status === opt.value ? `text-${opt.color}-700` : 'text-slate-500'}`}>
                  {opt.label}
                </span>
                {formData.status === opt.value && (
                   <div className={`absolute top-2 right-2 h-4 w-4 bg-${opt.color}-500 rounded-full flex items-center justify-center`}>
                      <CheckIcon className="h-3 w-3 text-white stroke-[4px]" />
                   </div>
                )}
              </label>
            ))}
          </div>
        </FormCardSection>

        {/* SECTION 3: FICHE TECHNIQUE */}
        <FormCardSection 
          icon={InformationCircleIcon} 
          title="Fiche Technique" 
          description="Informations constructeur"
          delay={0.3}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <InputField label="Fabricant" name="manufacturer" value={formData.manufacturer} onChange={handleChange} icon={BuildingStorefrontIcon} disabled={readOnly} />
            <InputField label="Modèle" name="model" value={formData.model} onChange={handleChange} disabled={readOnly} />
            <InputField label="Numéro de Série" name="serial_number" value={formData.serial_number} onChange={handleChange} disabled={readOnly} />
          </div>

          <div className="mt-8 pt-8 border-t border-slate-50 flex flex-col md:flex-row items-end gap-6">
            <div className="w-full md:w-1/3">
              <label className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest mb-3">
                <CalendarIcon className="h-4 w-4" /> Date de mise en service
              </label>
              <input
                type="date"
                name="commissioning_date"
                value={formData.commissioning_date}
                onChange={handleChange}
                disabled={readOnly}
                className="w-full rounded-[18px] border-0 py-4 px-5 bg-slate-50 text-slate-800 font-bold ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-600 transition-all outline-none"
              />
            </div>
            <div className="flex-1 bg-blue-50/50 rounded-[22px] p-5 flex items-center gap-4 border border-blue-100">
               <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">💡</div>
               <p className="text-xs text-blue-800 font-bold leading-relaxed italic opacity-80">
                 Ces informations permettent de calculer automatiquement le cycle de vie et les périodes de révision majeure du matériel.
               </p>
            </div>
          </div>
        </FormCardSection>

        {/* ACTIONS */}
        <div className="flex items-center justify-between gap-4 pt-10 animate-fadeInUp">
          <Button type="button" variant="ghost" onClick={() => navigate('/equipment')} className="!rounded-2xl font-black text-slate-400 hover:text-slate-600">
            {canSubmit ? 'Annuler' : '← Retour au parc'}
          </Button>
          
          {canSubmit && (
            <Button
              type="submit"
              loading={saving}
              className="!bg-gradient-to-r from-blue-600 to-blue-800 !text-white !rounded-[22px] !px-10 !py-4 font-black shadow-xl hover:shadow-blue-500/20 hover:scale-105 transition-all flex items-center gap-3"
            >
              <CheckIcon className="h-6 w-6" />
              {isEdit ? 'Mettre à jour l\'actif' : 'Enregistrer le matériel'}
            </Button>
          )}
        </div>
      </form>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }
        .animate-fadeInDown { animation: fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}