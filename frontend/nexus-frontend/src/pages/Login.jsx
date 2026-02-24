import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  BellAlertIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';
import useAuthStore from '../stores/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Partie gauche - Formulaire */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center px-6 py-12 bg-white relative">
        {/* Background subtle pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#000" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotPattern)" />
          </svg>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-12 group">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <img
                src="/logo_nexuss.png"
                alt="NexusMine"
                className="h-14 w-auto relative transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 font-outfit tracking-tight">NexusMine</h2>
              <p className="text-[10px] text-indigo-600 font-black tracking-[0.2em] uppercase">Mining Intelligence</p>
            </div>
          </Link>

          {/* Titre */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-3 font-outfit tracking-tight">
              Bienvenue sur NexusMine
            </h1>
            <p className="text-slate-500 font-medium">
              Accédez à la plateforme de gestion minière la plus avancée de Guinée.
            </p>
          </div>

          {/* Formulaire */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-base flex items-center gap-2 animate-shake">
                <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            {/* Email */}
            <div className="group">
              <label htmlFor="email" className="block text-base font-semibold text-slate-600 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border-0 py-4 pl-12 pr-4 bg-slate-50 text-slate-800 ring-1 ring-inset ring-gray-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all text-base"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="group">
              <label htmlFor="password" className="block text-base font-semibold text-slate-600 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border-0 py-4 pl-12 pr-12 bg-slate-50 text-slate-800 ring-1 ring-inset ring-gray-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all text-base"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-500 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="ml-2 text-base text-slate-500 group-hover:text-slate-800 transition-colors">
                  Se souvenir de moi
                </span>
              </label>

              <Link to="/forgot-password" className="text-base font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-4 text-base font-semibold text-white shadow-sm transition-colors"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/60"></div>
            </div>
            <div className="relative flex justify-center text-base">
              <span className="bg-white px-4 text-slate-500">ou</span>
            </div>
          </div>

          {/* Back to Home */}
          <Link
            to="/home"
            className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200/60 px-4 py-3.5 text-base font-medium text-slate-600 hover:bg-slate-50 hover:border-gray-300 transition-all"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à l'accueil
          </Link>

          {/* Footer */}
          <p className="mt-8 text-center text-base text-slate-400">
            © {new Date().getFullYear()} NexusMine. Tous droits réservés.
          </p>
        </div>
      </div>

      {/* Partie droite - Image du tunnel minier */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Image de fond - Tunnel minier */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/mine-tunnel.png')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-indigo-900/70"></div>
        </div>

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-base font-medium">Système opérationnel</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg">
                <CpuChipIcon className="h-5 w-5 text-blue-300" />
              </div>
              <span className="text-white/80 text-base">IA Active</span>
            </div>
          </div>

          {/* Middle content */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <div className="flex items-center gap-2 mb-6">
              <SparklesIcon className="h-8 w-8 text-yellow-400" />
              <span className="text-yellow-400 font-semibold tracking-wide">INTELLIGENCE MINIÈRE</span>
            </div>

            <h2 className="text-4xl xl:text-4xl font-semibold text-white leading-tight mb-6">
              Gérez vos opérations minières avec précision
            </h2>

            <p className="text-lg text-slate-300 mb-10 leading-relaxed">
              Surveillance en temps réel, analytics prédictifs et gestion intelligente
              pour maximiser la sécurité et la productivité de vos sites.
            </p>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: ChartBarIcon, text: 'Analytics temps réel', color: 'blue' },
                { icon: ShieldCheckIcon, text: 'Sécurité renforcée', color: 'green' },
                { icon: BellAlertIcon, text: 'Alertes intelligentes', color: 'yellow' },
                { icon: CpuChipIcon, text: 'IA prédictive', color: 'purple' },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${feature.color === 'blue' ? 'bg-indigo-500/20' :
                    feature.color === 'green' ? 'bg-green-500/20' :
                      feature.color === 'yellow' ? 'bg-yellow-500/20' :
                        'bg-purple-500/20'
                    }`}>
                    <feature.icon className={`h-5 w-5 ${feature.color === 'blue' ? 'text-indigo-400' :
                      feature.color === 'green' ? 'text-green-400' :
                        feature.color === 'yellow' ? 'text-yellow-400' :
                          'text-purple-400'
                      }`} />
                  </div>
                  <span className="text-white text-base font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom stats */}
          <div className="flex gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10">
              <p className="text-2xl font-semibold text-white">24</p>
              <p className="text-base text-slate-400">Sites actifs</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10">
              <p className="text-2xl font-semibold text-white">1,234</p>
              <p className="text-base text-slate-400">Personnel</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10">
              <p className="text-2xl font-semibold text-white">127</p>
              <p className="text-base text-slate-400">Jours sans incident</p>
            </div>
            <div className="bg-gradient-to-r from-green-500/20 to-green-400/20 backdrop-blur-md rounded-2xl px-6 py-4 border border-green-400/30">
              <p className="text-2xl font-semibold text-green-400">99.9%</p>
              <p className="text-base text-green-300">Disponibilité</p>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
