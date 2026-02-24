import { useState } from 'react';
import {
  KeyIcon,
  BellIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  Cog6ToothIcon,
  LockClosedIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import api from '../api/axios';
import useAuthStore from '../stores/authStore';

export default function Settings() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('password');

  const roleLabels = {
    ADMIN: 'Administrateur',
    SITE_MANAGER: 'Responsable de site',
    SUPERVISOR: 'Gestionnaire de site',
    OPERATOR: 'Technicien / Opérateur',
    ANALYST: 'Analyste',
    MMG: 'Ministère des Mines',
  };
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Password form
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirm: '',
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email_alerts: true,
    email_reports: true,
    email_incidents: true,
    push_notifications: true,
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validation
    if (passwordForm.new_password.length < 8) {
      setMessage({ type: 'error', text: 'Le nouveau mot de passe doit contenir au moins 8 caractères' });
      return;
    }

    if (passwordForm.new_password !== passwordForm.new_password_confirm) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }

    setSaving(true);

    try {
      await api.post('/users/change-password/', passwordForm);
      setMessage({ type: 'success', text: 'Mot de passe modifié avec succès' });
      setPasswordForm({
        current_password: '',
        new_password: '',
        new_password_confirm: '',
      });
    } catch (error) {
      console.error('Erreur:', error);
      if (error.response?.data?.current_password) {
        setMessage({ type: 'error', text: 'Mot de passe actuel incorrect' });
      } else {
        setMessage({ type: 'error', text: 'Erreur lors du changement de mot de passe' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    // TODO: Sauvegarder les préférences via API
  };

  const tabs = [
    { id: 'password', name: 'Sécurité', icon: KeyIcon, color: 'from-blue-500 to-cyan-600' },
    { id: 'notifications', name: 'Notifications', icon: BellIcon, color: 'from-amber-500 to-orange-600' },
    { id: 'privacy', name: 'Confidentialité', icon: ShieldCheckIcon, color: 'from-purple-500 to-indigo-600' },
  ];

  // Toggle Switch Component
  const ToggleSwitch = ({ enabled, onChange, icon: IconComponent, title, description }) => (
    <div className="group flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl transition-all duration-200 ${enabled ? 'bg-linear-to-br from-blue-500 to-cyan-600 shadow-lg shadow-indigo-500/30' : 'bg-gray-200'}`}>
          <IconComponent className={`h-5 w-5 ${enabled ? 'text-white' : 'text-slate-500'}`} />
        </div>
        <div>
          <h4 className="text-base font-semibold text-slate-800">{title}</h4>
          <p className="text-base text-slate-500">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-500/20 ${enabled ? 'bg-linear-to-r from-blue-500 to-cyan-600' : 'bg-gray-300'
          }`}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-all duration-300 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
        />
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="settingsGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#settingsGrid)" />
          </svg>
        </div>

        {/* Gradient orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-linear-to-br from-blue-500 to-cyan-600 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-linear-to-br from-purple-500 to-indigo-600 opacity-20 blur-3xl"></div>

        <div className="relative px-8 py-10">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-linear-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-xl shadow-indigo-500/30">
              <Cog6ToothIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">Paramètres</h1>
              <p className="mt-1 text-slate-300">
                Gérez vos préférences et la sécurité de votre compte
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`flex items-center gap-3 p-4 rounded-2xl shadow-sm ${message.type === 'success'
              ? 'bg-linear-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200'
              : 'bg-linear-to-r from-red-50 to-rose-50 text-red-700 border border-red-200'
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

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
        {/* Premium Tabs */}
        <div className="border-b border-slate-100 bg-linear-to-r from-gray-50 to-white">
          <nav className="flex gap-1 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-5 py-3 text-base font-semibold rounded-xl transition-all duration-300 ${activeTab === tab.id
                    ? `bg-linear-to-r ${tab.color} text-white shadow-lg`
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-linear-to-br from-blue-500 to-cyan-600 rounded-xl shadow-sm">
                  <LockClosedIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Changer le mot de passe</h3>
                  <p className="text-base text-slate-500">
                    Assurez-vous d'utiliser un mot de passe fort et unique
                  </p>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-xl">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="current_password" className="block text-base font-semibold text-slate-600 mb-2">
                      Mot de passe actuel
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        id="current_password"
                        name="current_password"
                        value={passwordForm.current_password}
                        onChange={handlePasswordChange}
                        required
                        className="block w-full rounded-xl border border-slate-200/60 px-4 py-3 pr-12 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 hover:border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-500 transition-colors"
                      >
                        {showCurrentPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="new_password" className="block text-base font-semibold text-slate-600 mb-2">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        id="new_password"
                        name="new_password"
                        value={passwordForm.new_password}
                        onChange={handlePasswordChange}
                        required
                        minLength={8}
                        className="block w-full rounded-xl border border-slate-200/60 px-4 py-3 pr-12 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 hover:border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-500 transition-colors"
                      >
                        {showNewPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-slate-500 flex items-center gap-1">
                      <ShieldCheckIcon className="h-3.5 w-3.5" />
                      Minimum 8 caractères
                    </p>
                  </div>

                  <div>
                    <label htmlFor="new_password_confirm" className="block text-base font-semibold text-slate-600 mb-2">
                      Confirmer le nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="new_password_confirm"
                        name="new_password_confirm"
                        value={passwordForm.new_password_confirm}
                        onChange={handlePasswordChange}
                        required
                        className="block w-full rounded-xl border border-slate-200/60 px-4 py-3 pr-12 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 hover:border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-500 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-cyan-600 px-8 py-3 text-base font-semibold text-white shadow-sm"
                  >
                    {saving ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Modification...
                      </>
                    ) : (
                      <>
                        <LockClosedIcon className="h-5 w-5" />
                        Modifier le mot de passe
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-linear-to-br from-amber-500 to-orange-600 rounded-xl shadow-sm">
                  <BellIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Préférences de notification</h3>
                  <p className="text-base text-slate-500">
                    Choisissez comment vous souhaitez être notifié
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <ToggleSwitch
                  enabled={notifications.email_alerts}
                  onChange={() => handleNotificationChange('email_alerts')}
                  icon={EnvelopeIcon}
                  title="Alertes par email"
                  description="Recevoir les alertes critiques par email"
                />
                <ToggleSwitch
                  enabled={notifications.email_reports}
                  onChange={() => handleNotificationChange('email_reports')}
                  icon={EnvelopeIcon}
                  title="Rapports hebdomadaires"
                  description="Recevoir un résumé hebdomadaire des opérations"
                />
                <ToggleSwitch
                  enabled={notifications.email_incidents}
                  onChange={() => handleNotificationChange('email_incidents')}
                  icon={ExclamationCircleIcon}
                  title="Notifications d'incidents"
                  description="Être notifié des nouveaux incidents"
                />
                <ToggleSwitch
                  enabled={notifications.push_notifications}
                  onChange={() => handleNotificationChange('push_notifications')}
                  icon={DevicePhoneMobileIcon}
                  title="Notifications push"
                  description="Recevoir des notifications dans le navigateur"
                />
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-linear-to-br from-purple-500 to-indigo-600 rounded-xl shadow-sm">
                  <ShieldCheckIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Confidentialité et données</h3>
                  <p className="text-base text-slate-500">
                    Gérez vos données personnelles et la confidentialité de votre compte
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Account Info Card */}
                <div className="bg-linear-to-r from-gray-50 to-white rounded-2xl p-6 border border-slate-200/60">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4">Informations du compte</h4>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200/60">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <EnvelopeIcon className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <dt className="text-sm text-slate-500">Email</dt>
                        <dd className="text-base font-medium text-slate-800">{user?.email}</dd>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200/60">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <ShieldCheckIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <dt className="text-sm text-slate-500">Rôle</dt>
                        <dd className="text-base font-medium text-slate-800">{roleLabels[user?.role] || user?.role}</dd>
                      </div>
                    </div>
                  </dl>
                </div>

                {/* Export Card */}
                <div className="bg-linear-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-100">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-100 rounded-xl">
                      <ArrowDownTrayIcon className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-amber-900">Exporter mes données</h4>
                      <p className="mt-1 text-base text-amber-700">
                        Vous pouvez demander une copie de toutes vos données personnelles.
                      </p>
                      <button
                        type="button"
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-100 px-5 py-3 text-base font-semibold text-amber-800 hover:bg-amber-200 transition-colors duration-200"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        Demander l'export
                      </button>
                    </div>
                  </div>
                </div>

                {/* Delete Account Card */}
                <div className="bg-linear-to-r from-red-50 to-rose-50 rounded-2xl p-6 border border-red-100">
                  <div className="flex items-start gap-4">
                    # ── CONTENU ──
                    <div className="p-3 bg-red-100 rounded-xl">
                      <TrashIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-red-900">Supprimer mon compte</h4>
                      <p className="mt-1 text-base text-red-700">
                        Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                      </p>
                      <button
                        type="button"
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-100 px-5 py-3 text-base font-semibold text-red-800 hover:bg-red-200 transition-colors duration-200"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Supprimer le compte
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
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
