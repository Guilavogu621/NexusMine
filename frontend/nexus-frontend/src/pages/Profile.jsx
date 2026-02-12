import { useState, useEffect, useRef } from 'react';
import {
  UserCircleIcon,
  CameraIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import api from '../api/axios';
import useAuthStore from '../stores/authStore';

const roleLabels = {
  ADMIN: 'Administrateur',
  SITE_MANAGER: 'Responsable de site',
  SUPERVISOR: 'Gestionnaire de Site',
  OPERATOR: 'Technicien/Opérateur',
  ANALYST: 'Analyste',
  MMG: 'Autorité (MMG)',
};

const roleColors = {
  ADMIN: 'from-purple-500 to-indigo-600',
  SITE_MANAGER: 'from-sky-500 to-blue-600',
  SUPERVISOR: 'from-blue-500 to-cyan-600',
  OPERATOR: 'from-emerald-500 to-teal-600',
  ANALYST: 'from-amber-500 to-orange-600',
  MMG: 'from-rose-500 to-pink-600',
};

const roleBadgeColors = {
  ADMIN: 'bg-purple-100 text-purple-700 ring-purple-600/20',
  SITE_MANAGER: 'bg-sky-100 text-sky-700 ring-sky-600/20',
  SUPERVISOR: 'bg-indigo-50 text-indigo-700 ring-blue-600/20',
  OPERATOR: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
  ANALYST: 'bg-amber-100 text-amber-700 ring-amber-600/20',
  MMG: 'bg-rose-100 text-rose-700 ring-rose-600/20',
};

export default function Profile() {
  const { setUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/me/');
      setProfile(response.data);
      setFormData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        phone: response.data.phone || '',
      });
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement du profil' });
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
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.patch('/users/update-profile/', formData);
      setProfile(response.data);
      if (setUser) {
        setUser(response.data);
      }
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil' });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une image' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'L\'image ne doit pas dépasser 5 Mo' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('profile_photo', file);

      const response = await api.post('/users/upload-photo/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfile(response.data);
      if (setUser) {
        setUser(response.data);
      }
      setMessage({ type: 'success', text: 'Photo de profil mise à jour' });
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      setMessage({ type: 'error', text: 'Erreur lors de l\'upload de la photo' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin border-t-blue-600 mx-auto"></div>
            <SparklesIcon className="h-6 w-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-slate-500 font-medium">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-8">
      {/* Premium Header avec bannière */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="profileGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#profileGrid)" />
          </svg>
        </div>
        
        {/* Gradient orbs */}
        <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br ${roleColors[profile?.role] || 'from-blue-500 to-cyan-600'} opacity-20 blur-3xl`}></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 opacity-20 blur-3xl"></div>
        
        <div className="relative px-8 py-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Photo de profil avec gradient border */}
            <div className="relative group">
              <div className={`absolute -inset-1 rounded-full bg-gradient-to-r ${roleColors[profile?.role] || 'from-blue-500 to-cyan-600'} opacity-75 blur group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className="relative">
                {profile?.profile_photo_url ? (
                  <img
                    src={profile.profile_photo_url}
                    alt="Photo de profil"
                    className="h-32 w-32 rounded-full object-cover ring-4 ring-white/20"
                  />
                ) : (
                  <div className={`h-32 w-32 rounded-full bg-gradient-to-br ${roleColors[profile?.role] || 'from-blue-500 to-cyan-600'} flex items-center justify-center ring-4 ring-white/20`}>
                    <span className="text-3xl font-semibold text-white">
                      {profile?.first_name?.charAt(0) || profile?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={handlePhotoClick}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 p-2.5 bg-white rounded-full text-slate-600 hover:text-indigo-600 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-110 disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CameraIcon className="h-5 w-5" />
                  )}
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
            </div>
            
            {/* Informations principales */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl font-semibold text-white">
                {profile?.first_name && profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : profile?.email}
              </h1>
              <p className="mt-2 text-slate-300 flex items-center justify-center md:justify-start gap-2">
                <EnvelopeIcon className="h-4 w-4" />
                {profile?.email}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-base font-semibold ring-1 ring-inset ${roleBadgeColors[profile?.role] || 'bg-slate-100 text-slate-600'}`}>
                  <ShieldCheckIcon className="h-4 w-4" />
                  {roleLabels[profile?.role] || profile?.role}
                </span>
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-base font-medium bg-white/10 text-white backdrop-blur-sm">
                  <CalendarDaysIcon className="h-4 w-4" />
                  Membre depuis {new Date(profile?.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`flex items-center gap-3 p-4 rounded-2xl shadow-sm ${
            message.type === 'success'
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200'
              : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200'
          }`}
        >
          <div className={`p-2 rounded-xl ${message.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
            {message.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <ExclamationCircleIcon className="h-5 w-5" />
            )}
          </div>
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Formulaire de profil */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
        <div className="border-b border-slate-100 px-8 py-5 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-sm">
              <PencilSquareIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Informations personnelles</h2>
              <p className="text-base text-slate-500">Modifiez vos informations de profil</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label htmlFor="first_name" className="flex items-center gap-2 text-base font-semibold text-slate-600 mb-2">
                <UserIcon className="h-4 w-4 text-slate-400" />
                Prénom
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="block w-full rounded-xl border border-slate-200/60 px-4 py-3 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 hover:border-gray-300"
                placeholder="Votre prénom"
              />
            </div>
            
            <div className="group">
              <label htmlFor="last_name" className="flex items-center gap-2 text-base font-semibold text-slate-600 mb-2">
                <UserIcon className="h-4 w-4 text-slate-400" />
                Nom
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="block w-full rounded-xl border border-slate-200/60 px-4 py-3 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 hover:border-gray-300"
                placeholder="Votre nom"
              />
            </div>
          </div>

          <div className="group">
            <label htmlFor="phone" className="flex items-center gap-2 text-base font-semibold text-slate-600 mb-2">
              <PhoneIcon className="h-4 w-4 text-slate-400" />
              Téléphone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+224 620 00 00 00"
              className="block w-full rounded-xl border border-slate-200/60 px-4 py-3 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 hover:border-gray-300"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-base font-semibold text-slate-600 mb-2">
              <EnvelopeIcon className="h-4 w-4 text-slate-400" />
              Email
            </label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="block w-full rounded-xl border border-slate-200/60 bg-slate-50 px-4 py-3 text-slate-500 cursor-not-allowed"
            />
            <p className="mt-2 text-sm text-slate-400 flex items-center gap-1.5">
              <ShieldCheckIcon className="h-3.5 w-3.5" />
              L'email ne peut pas être modifié. Contactez un administrateur si nécessaire.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-3 text-base font-semibold text-white shadow-sm"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>Enregistrer les modifications</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .max-w-5xl > * {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
