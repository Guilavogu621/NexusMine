import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  IdentificationIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  UserCircleIcon,
  ArrowLeftIcon,
  XCircleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import { Avatar } from '../../components/ui/UIComponents';
import useFormPermissions from '../../hooks/useFormPermissions';
import ReadOnlyBanner from '../../components/ui/ReadOnlyBanner';

const STATUS_OPTIONS = [
  { value: 'ACTIVE',     label: 'Actif',     emoji: '🟢', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700', ring: 'ring-emerald-600/20' },
  { value: 'ON_LEAVE',   label: 'En congé',  emoji: '🟡', dot: 'bg-amber-500',   badge: 'bg-amber-100 text-amber-700',     ring: 'ring-amber-600/20'   },
  { value: 'INACTIVE',   label: 'Inactif',   emoji: '⚪', dot: 'bg-gray-400',    badge: 'bg-slate-100 text-slate-600',     ring: 'ring-gray-600/20'    },
  { value: 'TERMINATED', label: 'Terminé',   emoji: '🔴', dot: 'bg-red-500',     badge: 'bg-red-100 text-red-700',         ring: 'ring-red-600/20'     },
];

const POSITION_OPTIONS = [
  { value: 'OPERATOR',   label: '👷 Opérateur'         },
  { value: 'TECHNICIAN', label: '🔧 Technicien'         },
  { value: 'ENGINEER',   label: '👨‍💻 Ingénieur'          },
  { value: 'SITE_MANAGER', label: '👔 Gestionnaire de site' },
  { value: 'MANAGER',    label: '💼 Manager'            },
  { value: 'DRIVER',     label: '🚛 Chauffeur'          },
  { value: 'SECURITY',   label: '🛡️ Agent de sécurité'  },
  { value: 'OTHER',      label: '📋 Autre'              },
];

const avatarColors = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-emerald-500 to-emerald-600',
  'from-amber-500 to-amber-600',
  'from-pink-500 to-pink-600',
  'from-cyan-500 to-cyan-600',
  'from-indigo-500 to-indigo-600',
  'from-rose-500 to-rose-600',
];

const inputCls = 'block w-full rounded-xl border-0 py-3 px-4 bg-slate-50 text-slate-800 ring-1 ring-inset ring-gray-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200 hover:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium';

const SectionCard = ({ children, delay = '0s' }) => (
  <div
    className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-lg hover:shadow-xl hover:border-white/40 transition-all duration-500 overflow-hidden animate-fadeInUp"
    style={{ animationDelay: delay }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
    <div className="relative z-10">{children}</div>
  </div>
);

const SectionHeader = ({ icon: Icon, iconBg, iconColor, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/60">
    <div className={`p-2 ${iconBg} rounded-lg`}>
      <Icon className={`h-5 w-5 ${iconColor}`} />
    </div>
    <div>
      <h2 className="font-bold text-slate-900 text-lg">{title}</h2>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </div>
  </div>
);

export default function PersonnelForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { readOnly, canSubmit, roleBanner } = useFormPermissions('personnel');

  const [loading, setLoading]         = useState(false);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState(null);
  const [success, setSuccess]         = useState(false);
  const [sites, setSites]             = useState([]);
  const [photoFile, setPhotoFile]     = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    employee_id: '',
    first_name:  '',
    last_name:   '',
    position:    '',
    phone:       '',
    email:       '',
    status:      'ACTIVE',
    site:        '',
    hire_date:   '',
  });

  useEffect(() => {
    fetchSites();
    if (isEdit) { fetchPerson(); } else { generateEmployeeId(); }
  }, [id]);

  const generateEmployeeId = () => {
    const eid = `EMP-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    setFormData(prev => ({ ...prev, employee_id: eid }));
  };

  const fetchSites = async () => {
    try {
      const response = await api.get('/sites/');
      const sitesData = response.data.results || response.data;
      setSites(sitesData.map(site => ({ value: site.id, label: site.name })));
    } catch (err) { console.error(err); }
  };

  const fetchPerson = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/personnel/${id}/`);
      setFormData({
        employee_id: response.data.employee_id || '',
        first_name:  response.data.first_name  || '',
        last_name:   response.data.last_name   || '',
        position:    response.data.position    || '',
        phone:       response.data.phone       || '',
        email:       response.data.email       || '',
        status:      response.data.status      || 'ACTIVE',
        site:        response.data.site        || '',
        hire_date:   response.data.hire_date   || '',
      });
      if (response.data.photo_url) setPhotoPreview(response.data.photo_url);
    } catch (err) {
      setError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const dataToSend = { ...formData, hire_date: formData.hire_date || null };
      if (isEdit) {
        await api.put(`/personnel/${id}/`, dataToSend);
        if (photoFile) {
          const fd = new FormData();
          fd.append('photo', photoFile);
          await api.post(`/personnel/${id}/upload-photo/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
      } else {
        const res = await api.post('/personnel/', dataToSend);
        if (photoFile && res.data?.id) {
          const fd = new FormData();
          fd.append('photo', photoFile);
          await api.post(`/personnel/${res.data.id}/upload-photo/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
      }
      setSuccess(true);
      setTimeout(() => navigate('/personnel'), 1500);
    } catch (err) {
      if (err.response?.data) {
        const errors = Object.entries(err.response.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('\n');
        setError(errors);
      } else {
        setError('Une erreur est survenue');
      }
    } finally {
      setSaving(false);
    }
  };

  const fullName = `${formData.first_name} ${formData.last_name}`.trim();
  const currentStatus = STATUS_OPTIONS.find(s => s.value === formData.status) || STATUS_OPTIONS[0];
  const initials = (formData.first_name?.[0] || '') + (formData.last_name?.[0] || '');
  const avatarGradient = avatarColors[Math.abs((formData.first_name?.charCodeAt(0) || 0) % avatarColors.length)];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <p className="text-slate-600 font-medium">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30" />

      <div className="relative space-y-6 pb-12 px-4 sm:px-6 lg:px-8 pt-8 max-w-4xl mx-auto">

        {/* ── HEADER PREMIUM ── */}
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200/60 animate-fadeInDown">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-blue-500/5 to-indigo-500/5 rounded-full translate-y-1/2 -translate-x-1/4" />

          <div className="relative p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-sm">
                  <div className="absolute inset-0 rounded-2xl bg-white/20" />
                  <UsersIcon className="h-7 w-7 text-white relative" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => navigate('/personnel')}
                      className="text-slate-400 hover:text-indigo-600 text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <ArrowLeftIcon className="h-3.5 w-3.5" />
                      Personnel
                    </button>
                    <span className="text-slate-300 text-sm">/</span>
                    <span className="text-slate-500 text-sm font-medium">{isEdit ? 'Modifier' : 'Nouveau'}</span>
                  </div>
                  <h1 className="text-xl font-semibold text-slate-800">
                    {isEdit ? "Modifier l'employé" : 'Nouvel employé'}
                  </h1>
                  <p className="mt-0.5 text-slate-500">
                    {isEdit ? "Modifiez les informations de l'employé" : 'Ajoutez un nouveau membre du personnel'}
                  </p>
                </div>
              </div>

              {/* Status pill */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ring-1 ring-inset self-start sm:self-auto ${currentStatus.badge} ${currentStatus.ring}`}>
                <span className={`w-2 h-2 rounded-full ${currentStatus.dot}`} />
                {currentStatus.label}
              </div>
            </div>
          </div>
        </div>

        {/* ── ALERTS ── */}
        {success && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 font-medium shadow-sm">
            <CheckCircleIcon className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            {isEdit ? 'Employé modifié avec succès.' : 'Employé ajouté avec succès.'} Redirection...
          </div>
        )}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 shadow-sm">
            <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <pre className="whitespace-pre-line font-sans text-sm flex-1">{error}</pre>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-xl leading-none ml-auto">×</button>
          </div>
        )}

        <ReadOnlyBanner message={roleBanner} />

        <form onSubmit={readOnly ? (e) => e.preventDefault() : handleSubmit} className="space-y-6">

          {/* ── 1 · Informations personnelles ── */}
          <SectionCard delay="0.05s">
            <SectionHeader
              icon={UserIcon}
              iconBg="bg-indigo-100"
              iconColor="text-indigo-600"
              title="Informations personnelles"
              subtitle="Identité et coordonnées de l'employé"
            />
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar / Photo */}
              <div className="flex flex-col items-center gap-3 flex-shrink-0">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => !readOnly && document.getElementById('personnel-photo-input')?.click()}
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Photo" className="h-20 w-20 rounded-2xl object-cover ring-2 ring-slate-200 shadow-md" />
                  ) : (
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarGradient} shadow-lg flex items-center justify-center`}>
                      <span className="text-2xl font-bold text-white">{initials || '?'}</span>
                    </div>
                  )}
                  {!readOnly && (
                    <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">📷 Photo</span>
                    </div>
                  )}
                </div>
                <input id="personnel-photo-input" type="file" accept="image/*" className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); }
                  }}
                />
                <span className="text-xs text-slate-400 font-medium">{readOnly ? 'Photo' : 'Cliquer pour changer'}</span>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Matricule */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                    <IdentificationIcon className="h-4 w-4" /> Matricule *
                  </label>
                  <input type="text" name="employee_id" value={formData.employee_id} onChange={handleChange}
                    required placeholder="EMP-2026-0001" disabled={readOnly} className={inputCls} />
                </div>

                {/* Site */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                    <MapPinIcon className="h-4 w-4" /> Site d'affectation *
                  </label>
                  <select name="site" value={formData.site} onChange={handleChange}
                    required disabled={readOnly} className={inputCls + ' appearance-none cursor-pointer'}>
                    <option value="">📍 Sélectionner un site</option>
                    {sites.map(site => <option key={site.value} value={site.value}>{site.label}</option>)}
                  </select>
                </div>

                {/* Prénom */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                    <UserCircleIcon className="h-4 w-4" /> Prénom *
                  </label>
                  <input type="text" name="first_name" value={formData.first_name} onChange={handleChange}
                    required placeholder="Ex: Mamadou" disabled={readOnly} className={inputCls} />
                </div>

                {/* Nom */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                    <UserIcon className="h-4 w-4" /> Nom de famille *
                  </label>
                  <input type="text" name="last_name" value={formData.last_name} onChange={handleChange}
                    required placeholder="Ex: Diallo" disabled={readOnly} className={inputCls} />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── 2 · Poste et statut ── */}
          <SectionCard delay="0.1s">
            <SectionHeader
              icon={BriefcaseIcon}
              iconBg="bg-amber-100"
              iconColor="text-amber-600"
              title="Poste et statut"
              subtitle="Fonction et état de l'employé"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Poste */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                  <BriefcaseIcon className="h-4 w-4" /> Poste / Fonction *
                </label>
                <select name="position" value={formData.position} onChange={handleChange}
                  required disabled={readOnly} className={inputCls + ' appearance-none cursor-pointer'}>
                  <option value="">Sélectionner un poste</option>
                  {POSITION_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>

              {/* Statut */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Statut *</label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map(option => {
                    const isSelected = formData.status === option.value;
                    return (
                      <label key={option.value} className={`
                        inline-flex items-center gap-2 px-3.5 py-2 rounded-xl cursor-pointer
                        border-2 transition-all duration-200 text-sm font-semibold select-none
                        ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}
                        ${isSelected
                          ? `${option.badge} ring-1 ring-inset ${option.ring} border-transparent shadow-sm`
                          : 'bg-slate-50 border-slate-200/60 text-slate-600 hover:border-gray-300 hover:bg-white'
                        }
                      `}>
                        <input type="radio" name="status" value={option.value} checked={isSelected}
                          onChange={handleChange} disabled={readOnly} className="sr-only" />
                        <span className={`w-2 h-2 rounded-full ${option.dot}`} />
                        {option.label}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── 3 · Coordonnées ── */}
          <SectionCard delay="0.15s">
            <SectionHeader
              icon={PhoneIcon}
              iconBg="bg-emerald-100"
              iconColor="text-emerald-600"
              title="Coordonnées"
              subtitle="Informations de contact"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Téléphone */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                  <PhoneIcon className="h-4 w-4" /> Téléphone
                </label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                  placeholder="+224 621 00 00 00" disabled={readOnly} className={inputCls} />
                <p className="mt-1.5 text-xs text-slate-400">Format international recommandé</p>
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                  <EnvelopeIcon className="h-4 w-4" /> Email
                </label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="m.diallo@nexusmine.com" disabled={readOnly} className={inputCls} />
              </div>

              {/* Date d'embauche */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                  <CalendarIcon className="h-4 w-4" /> Date d'embauche
                </label>
                <input type="date" name="hire_date" value={formData.hire_date} onChange={handleChange}
                  disabled={readOnly} className={inputCls} />
              </div>
            </div>
          </SectionCard>

          {/* ── RÉSUMÉ ── */}
          <div
            className="group relative overflow-hidden rounded-2xl border border-indigo-200/60 p-6 shadow-lg bg-gradient-to-r from-indigo-50/80 to-blue-50/80 animate-fadeInUp"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="flex items-center gap-4">
              <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarGradient} shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300 flex-shrink-0`}>
                <span className="text-xl font-bold text-white">{initials || '?'}</span>
                <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${currentStatus.dot}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800 text-lg">{fullName || 'Nouvel employé'}</h4>
                <p className="text-sm text-slate-500">
                  {POSITION_OPTIONS.find(p => p.value === formData.position)?.label || 'Poste non défini'}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.employee_id && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 ring-1 ring-inset ring-gray-600/20">
                      🪪 {formData.employee_id}
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${currentStatus.badge} ${currentStatus.ring}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`} />
                    {currentStatus.label}
                  </span>
                  {formData.hire_date && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 ring-1 ring-inset ring-gray-600/20">
                      📅 Embauché le {new Date(formData.hire_date).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── ACTIONS ── */}
          <div className="flex items-center justify-between pt-2 animate-fadeInUp" style={{ animationDelay: '0.25s' }}>
            <button
              type="button"
              onClick={() => navigate('/personnel')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-semibold transition-all duration-200 shadow-sm"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              {canSubmit ? 'Annuler' : 'Retour'}
            </button>

            {canSubmit && (
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <CheckCircleIcon className="h-5 w-5" />
                {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer les modifications' : "Ajouter l'employé"}
              </button>
            )}
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.5s ease-out forwards;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
          animation-fill-mode: both;
          opacity: 0;
        }
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'%3E%3C/path%3E%3C/svg%3E");
          background-position: right 0.75rem center;
          background-repeat: no-repeat;
          background-size: 1.25em 1.25em;
        }
      `}</style>
    </div>
  );
}