import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  EnvelopeIcon,
  KeyIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import api from '../api/axios';

export default function ForgotPassword() {
  /* ---- état ---- */
  const [step, setStep] = useState('email');        // 'email' | 'code' | 'done'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  /* ---- étape 1 : demander le code ---- */
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post('/password-reset/', { email });
      setStep('code');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de l\'envoi du code.');
    } finally {
      setLoading(false);
    }
  };

  /* ---- étape 2 : confirmer le code + nouveau mdp ---- */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/password-reset/confirm/', {
        email,
        code,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      });
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.detail || 'Code invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  /* ---- rendu ---- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-white to-indigo-50/30 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 rounded-xl blur-lg opacity-30"></div>
            <img src="/logo_nexuss.png" alt="NexusMine" className="h-14 w-auto relative" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">NexusMine</h2>
            <p className="text-sm text-indigo-600 font-medium tracking-wide">MINING INTELLIGENCE</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8">

          {/* ========== ÉTAPE 1 : Email ========== */}
          {step === 'email' && (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-100 mb-4">
                  <EnvelopeIcon className="h-7 w-7 text-indigo-600" />
                </div>
                <h1 className="text-xl font-semibold text-slate-800">Mot de passe oublié ?</h1>
                <p className="text-slate-500 mt-1 text-sm">
                  Entrez votre email, nous vous enverrons un code de réinitialisation.
                </p>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleRequestCode} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Adresse email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="block w-full rounded-xl border-0 py-3.5 px-4 bg-slate-50 text-slate-800 ring-1 ring-inset ring-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all text-base"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-3.5 text-base font-semibold text-white shadow-sm transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <EnvelopeIcon className="h-5 w-5" />
                      Envoyer le code
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ========== ÉTAPE 2 : Code + nouveau mdp ========== */}
          {step === 'code' && (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-100 mb-4">
                  <KeyIcon className="h-7 w-7 text-green-600" />
                </div>
                <h1 className="text-xl font-semibold text-slate-800">Vérification</h1>
                <p className="text-slate-500 mt-1 text-sm">
                  Entrez le code à 6 chiffres envoyé à <span className="font-medium text-slate-700">{email}</span>
                </p>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Code de vérification</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="block w-full rounded-xl border-0 py-3.5 px-4 bg-slate-50 text-slate-800 ring-1 ring-inset ring-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all text-2xl text-center tracking-[0.5em] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Nouveau mot de passe</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 caractères"
                    className="block w-full rounded-xl border-0 py-3.5 px-4 bg-slate-50 text-slate-800 ring-1 ring-inset ring-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Confirmer le mot de passe</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Même mot de passe"
                    className="block w-full rounded-xl border-0 py-3.5 px-4 bg-slate-50 text-slate-800 ring-1 ring-inset ring-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all text-base"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-500">Afficher les mots de passe</span>
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 px-4 py-3.5 text-base font-semibold text-white shadow-sm transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheckIcon className="h-5 w-5" />
                      Réinitialiser le mot de passe
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('email'); setError(null); }}
                  className="w-full text-center text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  ← Renvoyer un code / changer d'email
                </button>
              </form>
            </>
          )}

          {/* ========== ÉTAPE 3 : Succès ========== */}
          {step === 'done' && (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-xl font-semibold text-slate-800 mb-2">Mot de passe réinitialisé !</h1>
              <p className="text-slate-500 text-sm mb-6">
                Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-base font-semibold text-white transition-colors"
              >
                Se connecter
              </Link>
            </div>
          )}
        </div>

        {/* Retour */}
        {step !== 'done' && (
          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
              <ArrowLeftIcon className="h-4 w-4" />
              Retour à la connexion
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
