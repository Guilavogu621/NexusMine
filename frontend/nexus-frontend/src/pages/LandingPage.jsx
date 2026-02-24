import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPinIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BeakerIcon,
  BellAlertIcon,
  DocumentChartBarIcon,
  CpuChipIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  PlayIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

// Composant Counter animé
const AnimatedCounter = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

// Données des fonctionnalités
const features = [
  {
    icon: MapPinIcon,
    title: 'Gestion des Sites',
    description: 'Cartographie et suivi en temps réel de tous vos sites miniers à travers la Guinée.',
    color: 'bg-indigo-500',
  },
  {
    icon: WrenchScrewdriverIcon,
    title: 'Suivi des Équipements',
    description: 'Maintenance prédictive et gestion optimisée de votre flotte d\'équipements lourds.',
    color: 'bg-yellow-500',
  },
  {
    icon: UsersIcon,
    title: 'Gestion du Personnel',
    description: 'Planification des équipes, suivi des compétences et gestion des certifications.',
    color: 'bg-green-500',
  },
  {
    icon: ChartBarIcon,
    title: 'Analytics Avancés',
    description: 'Tableaux de bord intelligents pour une prise de décision éclairée.',
    color: 'bg-purple-500',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Sécurité & Incidents',
    description: 'Système de reporting et d\'analyse des incidents pour améliorer la sécurité.',
    color: 'bg-red-500',
  },
  {
    icon: BeakerIcon,
    title: 'Suivi Environnemental',
    description: 'Conformité aux normes environnementales et reporting ESG automatisé.',
    color: 'bg-teal-500',
  },
];

// Statistiques
const stats = [
  { label: 'Sites Miniers Gérés', value: 150, suffix: '+' },
  { label: 'Tonnes Extraites/Jour', value: 50000, suffix: '' },
  { label: 'Employés Suivis', value: 5000, suffix: '+' },
  { label: 'Incidents Prévenus', value: 98, suffix: '%' },
];

// Ressources minières de Guinée
const resources = [
  { name: 'Bauxite', description: '1er exportateur mondial', icon: '🔶' },
  { name: 'Or', description: 'Gisements majeurs', icon: '🥇' },
  { name: 'Fer', description: 'Réserves de Simandou', icon: '⚙️' },
  { name: 'Diamant', description: 'Qualité exceptionnelle', icon: '💎' },
];

// Témoignages
const testimonials = [
  {
    name: 'Lux jr Guilavogui',
    role: 'Directeur des Opérations',
    company: 'CBG - Compagnie des Bauxites de Guinée',
    quote: 'NexusMine a transformé notre façon de gérer les opérations. La visibilité en temps réel a réduit nos temps d\'arrêt de 35%.',
    rating: 5,
  },
  {
    name: 'Fatoumata Camara',
    role: 'Responsable HSE',
    company: 'SMB-Winning Consortium',
    quote: 'Le module de sécurité nous a permis d\'atteindre 500 jours sans incident majeur. Un outil indispensable.',
    rating: 5,
  },
  {
    name: 'Ibrahima Sow',
    role: 'Directeur Technique',
    company: 'Société Minière de Boké',
    quote: 'L\'analyse prédictive des équipements nous fait économiser des millions en maintenance préventive.',
    rating: 5,
  },
];

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      setShowScrollTop(window.scrollY > 500);
    };

    // Intersection Observer pour le Reveal effect
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const scrollToTop = (e) => {
    // Si on clique sur un bouton, un lien ou un élément interactif, on n'interrompt pas l'action
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('textarea')) {
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white cursor-pointer" onClick={scrollToTop}>
      {/* Bouton Retour en Haut Flottant */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 z-60 p-4 bg-indigo-600 text-white rounded-full shadow-2xl transition-all duration-500 transform ${showScrollTop ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-50'
          } hover:bg-indigo-700 hover:scale-110 active:scale-95 group`}
      >
        <ChevronDownIcon className="h-6 w-6 rotate-180 group-hover:-translate-y-1 transition-transform" />
      </button>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? 'bg-white/80 backdrop-blur-lg shadow-sm border-b border-white/20 py-3'
        : 'bg-transparent py-6'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 rounded-lg blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <img
                  src="/logo_nexuss.png"
                  alt="NexusMine"
                  className="h-10 w-auto relative transform group-hover:scale-105 transition-transform"
                />
              </div>
              <span className={`text-xl font-black tracking-tight font-outfit ${isScrolled ? 'text-slate-900' : 'text-white'
                }`}>
                Nexus<span className="text-indigo-500">Mine</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className={`text-sm font-medium transition-colors ${isScrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white hover:text-blue-200'
                }`}>
                Fonctionnalités
              </a>
              <a href="#stats" className={`text-sm font-medium transition-colors ${isScrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white hover:text-blue-200'
                }`}>
                Impact
              </a>
              <a href="#resources" className={`text-sm font-medium transition-colors ${isScrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white hover:text-blue-200'
                }`}>
                Ressources
              </a>
              <a href="#testimonials" className={`text-sm font-medium transition-colors ${isScrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white hover:text-blue-200'
                }`}>
                Témoignages
              </a>
              <a href="#contact" className={`text-sm font-medium transition-colors ${isScrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white hover:text-blue-200'
                }`}>
                Contact
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className={`text-sm font-medium transition-colors ${isScrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white hover:text-blue-200'
                  }`}
              >
                Connexion
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Demander une Démo
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className={`h-6 w-6 ${isScrolled ? 'text-slate-800' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-slate-600 hover:text-indigo-600">Fonctionnalités</a>
              <a href="#stats" className="block text-slate-600 hover:text-indigo-600">Impact</a>
              <a href="#resources" className="block text-slate-600 hover:text-indigo-600">Ressources</a>
              <a href="#testimonials" className="block text-slate-600 hover:text-indigo-600">Témoignages</a>
              <a href="#contact" className="block text-slate-600 hover:text-indigo-600">Contact</a>
              <Link to="/login" className="block w-full text-center bg-indigo-600 text-white py-2 rounded-lg">
                Connexion
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image - Vue aérienne site minier Simandou */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/vue-aerieenne.png')`,
          }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-gray-900/95 via-gray-900/80 to-gray-900/60"></div>
        </div>

        {/* Animated particles/dots */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-yellow-400 rounded-full animate-pulse delay-100"></div>
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-green-400 rounded-full animate-pulse delay-200"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-indigo-500/20 backdrop-blur-sm rounded-full text-blue-300 text-sm font-medium mb-6">
                <CpuChipIcon className="h-5 w-5 mr-2" />
                Plateforme d'Intelligence Minière
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-8 tracking-tight font-outfit">
                Optimisez vos{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-indigo-400 to-cyan-400">
                  Opérations Minières
                </span>{' '}
                en Guinée
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-xl leading-relaxed font-light">
                NexusMine est la plateforme d'intelligence géospatiale et opérationnelle
                conçue pour transformer les défis miniers en opportunités de croissance durable.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white text-base font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-sm"
                >
                  Commencer Maintenant
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <button className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white text-base font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20">
                  <PlayIcon className="mr-2 h-5 w-5" />
                  Voir la Démo
                </button>
              </div>

              {/* Trust badges */}
              <div className="mt-12 flex items-center gap-8 justify-center lg:justify-start">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-white">15+</div>
                  <div className="text-sm text-slate-400">Années d'Expertise</div>
                </div>
                <div className="h-12 w-px bg-gray-600"></div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-white">50+</div>
                  <div className="text-sm text-slate-400">Sites Miniers</div>
                </div>
                <div className="h-12 w-px bg-gray-600"></div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-white">99%</div>
                  <div className="text-sm text-slate-400">Disponibilité</div>
                </div>
              </div>
            </div>

            {/* Dashboard Preview - Style Moderne Raffiné (Basé sur l'image) */}
            <div className="hidden lg:block relative">
              <div className="relative bg-[#F8FAFC] rounded-[32px] shadow-2xl overflow-hidden border border-white/40 transform hover:scale-[1.01] transition-all duration-700" style={{ width: '640px' }}>

                {/* Dashboard Nav Bar */}
                <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                      <ChartBarIcon className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-slate-900 text-sm">Dashboard</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200"></div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Top Row Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: 'SITES MINIERS', val: '4', trend: '+12%', color: 'blue', icon: MapPinIcon },
                      { label: 'PERSONNEL ACTIF', val: '5', trend: '+5.2%', color: 'emerald', icon: UsersIcon },
                      { label: 'ÉQUIPEMENTS', val: '3', trend: '+3%', color: 'orange', icon: WrenchScrewdriverIcon },
                      { label: 'INCIDENTS', val: '2', trend: '-18%', color: 'rose', icon: ExclamationTriangleIcon, down: true },
                    ].map((s, i) => (
                      <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-bold text-slate-400 tracking-wider">{s.label}</span>
                          <div className={`p-1.5 rounded-lg bg-${s.color}-50`}>
                            <s.icon className={`h-4 w-4 text-${s.color}-500`} />
                          </div>
                        </div>
                        <div className="text-xl font-bold text-slate-900 mb-1">{s.val}</div>
                        <div className={`text-[9px] font-bold ${s.down ? 'text-rose-500' : 'text-emerald-500'} flex items-center gap-1`}>
                          {s.down ? '↓' : '↑'} {s.trend}
                          <span className="text-slate-300 font-medium">vs mois dernier</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Middle Row KPIs */}
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: 'PRODUCTION', val: '12,847', unit: 'tonnes', trend: '+8.2%', icon: CubeIcon },
                      { label: 'RENDEMENT', val: '94.5', unit: '%', trend: '+2.1%', icon: ChartBarIcon },
                      { label: 'HEURES MACHINE', val: '2,450', unit: 'h', trend: '+4.5%', icon: ClockIcon },
                      { label: 'TAUX SÉCURITÉ', val: '99.2', unit: '%', trend: '+0.8%', icon: ShieldCheckIcon },
                    ].map((k, i) => (
                      <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-1.5 bg-slate-50 rounded-lg">
                            <k.icon className="h-3.5 w-3.5 text-slate-500" />
                          </div>
                          <span className="text-[8px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full">{k.trend}</span>
                        </div>
                        <div className="text-[8px] font-bold text-slate-400 mb-0.5">{k.label}</div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-bold text-slate-900">{k.val}</span>
                          <span className="text-[9px] font-medium text-slate-400">{k.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Row Charts */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-slate-900">Production Mensuelle</span>
                        <span className="text-[9px] font-bold text-indigo-600">Voir détails</span>
                      </div>
                      {/* Mockup Area Chart */}
                      <div className="h-24 relative mt-2">
                        <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path d="M0,80 Q30,60 60,75 T120,40 T180,55 T240,30 T300,20 L300,100 L0,100 Z" fill="url(#chartGradient)" />
                          <path d="M0,80 Q30,60 60,75 T120,40 T180,55 T240,30 T300,20" fill="none" stroke="#10B981" strokeWidth="2.5" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col justify-between py-1">
                          <div className="border-t border-slate-50 w-full"></div>
                          <div className="border-t border-slate-50 w-full"></div>
                          <div className="border-t border-slate-50 w-full"></div>
                        </div>
                      </div>
                      <div className="flex justify-between mt-2 text-[8px] font-bold text-slate-400">
                        <span>MAI</span><span>JUIL</span><span>SEP</span><span>NOV</span><span>JAN</span><span>MAR</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col items-center">
                      <span className="text-xs font-bold text-slate-900 mb-1">Performance</span>
                      <span className="text-[9px] text-slate-400 mb-4">Ce mois-ci</span>
                      <div className="relative w-20 h-20">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="14" fill="none" stroke="#F1F5F9" strokeWidth="3" />
                          <circle cx="18" cy="18" r="14" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray="87 13" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-black text-slate-900">87%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements for context */}
              <div className="absolute -right-6 top-20 bg-white rounded-2xl shadow-xl p-4 border border-slate-100 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <ShieldCheckIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">127 Jours</div>
                    <div className="text-[10px] text-slate-500 font-medium">Sans Incident</div>
                  </div>
                </div>
              </div>

              <div className="absolute -left-10 bottom-24 bg-linear-to-br from-indigo-600 to-blue-700 text-white rounded-2xl shadow-2xl p-4 transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <CpuChipIcon className="h-4 w-4" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">Nexus AI</span>
                </div>
                <div className="text-xs font-medium opacity-90">Maintenance prédictive :</div>
                <div className="text-sm font-bold mt-1 text-blue-200">92% de précision</div>
              </div>

              <div className="absolute -right-2 bottom-12 bg-white rounded-xl shadow-lg border border-slate-100 p-3 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase">Alerte Bauxite S-2</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDownIcon className="h-8 w-8 text-white/50" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50 reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-3xl font-semibold text-slate-800 mb-4">
              Une Plateforme Complète pour{' '}
              <span className="text-indigo-600">l'Industrie Minière</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-3xl mx-auto">
              NexusMine combine les meilleurs outils de gestion pour optimiser
              chaque aspect de vos opérations minières.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-slate-200/60"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-24 bg-linear-to-r from-blue-600 to-blue-800 relative overflow-hidden reveal">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-3xl font-semibold text-white mb-4">
              Impact Mesurable sur vos Opérations
            </h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Des résultats concrets pour les entreprises minières en Guinée et en Afrique de l'Ouest.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-semibold text-white mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-blue-200 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Section - Guinea Mining */}
      <section id="resources" className="py-24 bg-white reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-3xl font-semibold text-slate-800 mb-6">
                Adapté aux{' '}
                <span className="text-indigo-600">Richesses Minières</span>{' '}
                de la Guinée
              </h2>
              <p className="text-lg text-slate-500 mb-8">
                La Guinée possède les plus grandes réserves de bauxite au monde et des gisements
                exceptionnels d'or, de fer et de diamants. NexusMine est conçu pour optimiser
                l'exploitation de ces ressources précieuses.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {resources.map((resource, index) => (
                  <div key={index} className="flex items-center gap-4 bg-slate-50 rounded-xl p-4">
                    <span className="text-3xl">{resource.icon}</span>
                    <div>
                      <div className="font-semibold text-slate-800">{resource.name}</div>
                      <div className="text-sm text-slate-500">{resource.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <img
                src="/casque.png"
                alt="Équipement de sécurité minier"
                className="rounded-2xl shadow-2xl w-full h-auto object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-slate-800">1er</div>
                    <div className="text-sm text-slate-500">Exportateur mondial de bauxite</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Équipement Moderne */}
      <section className="py-24 bg-linear-to-b from-slate-50 to-white reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image équipement */}
            <div className="relative order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/equipement.png"
                  alt="Équipement minier moderne"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent"></div>
              </div>
              {/* Badge flottant */}
              <div className="absolute -top-4 -right-4 bg-indigo-600 text-white rounded-xl p-4 shadow-xl">
                <div className="text-2xl font-semibold">500+</div>
                <div className="text-sm opacity-90">Équipements suivis</div>
              </div>
            </div>

            {/* Contenu */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium mb-6">
                <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
                Gestion des Équipements
              </div>
              <h2 className="text-3xl sm:text-3xl font-semibold text-slate-800 mb-6">
                Maintenance Prédictive pour{' '}
                <span className="text-indigo-600">Équipements Lourds</span>
              </h2>
              <p className="text-lg text-slate-500 mb-8">
                Réduisez vos temps d'arrêt et optimisez la durée de vie de vos équipements
                grâce à notre système d'intelligence artificielle qui anticipe les pannes
                avant qu'elles ne surviennent.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-slate-600">Suivi en temps réel de tous vos véhicules</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-slate-600">Alertes de maintenance automatiques</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-slate-600">Historique complet des interventions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Opérations Souterraines */}
      <section className="py-24 bg-slate-900 relative overflow-hidden reveal">
        {/* Background Image - Tunnel minier */}
        <div className="absolute inset-0">
          <img
            src="/mine-tunnel.png"
            alt="Mineurs dans un tunnel souterrain"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-linear-to-r from-gray-900/90 via-gray-900/70 to-gray-900/90"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Contenu texte */}
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-yellow-500/20 backdrop-blur-sm text-yellow-400 rounded-full text-sm font-medium mb-6">
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Sécurité & Excellence
              </div>
              <h2 className="text-3xl sm:text-3xl font-semibold text-white mb-6">
                Opérations{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-orange-400">
                  Souterraines
                </span>{' '}
                Sécurisées
              </h2>
              <p className="text-lg text-slate-300 mb-8">
                Nos équipes d'experts travaillent dans les conditions les plus exigeantes.
                NexusMine assure le suivi en temps réel du personnel, la surveillance des
                conditions environnementales et la gestion des équipements de sécurité.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="text-3xl font-semibold text-yellow-400 mb-2">24/7</div>
                  <div className="text-slate-300">Surveillance continue</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="text-3xl font-semibold text-green-400 mb-2">99.9%</div>
                  <div className="text-slate-300">Taux de sécurité</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="text-3xl font-semibold text-indigo-400 mb-2">500+</div>
                  <div className="text-slate-300">Mineurs équipés</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <div className="text-3xl font-semibold text-purple-400 mb-2">30+</div>
                  <div className="text-slate-300">Sites souterrains</div>
                </div>
              </div>
            </div>

            {/* Liste des fonctionnalités de sécurité */}
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <BellAlertIcon className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-2">Alertes en Temps Réel</h3>
                    <p className="text-slate-400">Détection automatique des situations dangereuses et notification immédiate aux superviseurs.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <UsersIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-2">Suivi du Personnel</h3>
                    <p className="text-slate-400">Localisation précise de chaque membre de l'équipe dans les tunnels grâce aux capteurs IoT.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <BeakerIcon className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-2">Qualité de l'Air</h3>
                    <p className="text-slate-400">Monitoring constant des niveaux d'oxygène, de CO2 et de particules pour la santé des mineurs.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white mb-2">Gestion des Incidents</h3>
                    <p className="text-slate-400">Protocoles d'urgence automatisés et plans d'évacuation optimisés pour chaque situation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-slate-50 reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-3xl font-semibold text-slate-800 mb-4">
              Ce que Disent nos{' '}
              <span className="text-indigo-600">Clients</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Des entreprises minières de premier plan nous font confiance pour leurs opérations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-500 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{testimonial.name}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                    <div className="text-sm text-indigo-600">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-linear-to-r from-slate-900 to-slate-800 relative overflow-hidden reveal">
        <div className="absolute inset-0">
          <img
            src="/natureetenvironement.png"
            alt="Environnement naturel préservé"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-3xl font-semibold text-white mb-6">
            Prêt à Transformer vos Opérations Minières ?
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Rejoignez les leaders de l'industrie minière guinéenne qui ont choisi NexusMine
            pour optimiser leur production et améliorer leur performance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white text-base font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg"
            >
              Demander une Démo Gratuite
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white text-base font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20"
            >
              Nous Contacter
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl sm:text-3xl font-semibold text-slate-800 mb-6">
                Contactez-nous
              </h2>
              <p className="text-lg text-slate-500 mb-8">
                Notre équipe est disponible pour répondre à toutes vos questions
                et vous accompagner dans votre transformation digitale.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <MapIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Adresse</div>
                    <div className="text-slate-500">Kaloum, Conakry, Guinée<br />Immeuble NexusMine, 3ème étage</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                    <PhoneIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Téléphone</div>
                    <div className="text-slate-500">+224 0000000000000<br />+224 628 00 00 00</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                    <EnvelopeIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Email</div>
                    <div className="text-slate-500">contact@nexusmine.com<br />support@nexusmine.com</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-slate-50 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-slate-800 mb-6">
                Envoyez-nous un message
              </h3>
              <form className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Nom</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Prénom</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Votre prénom"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Entreprise</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Nom de votre entreprise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    placeholder="Comment pouvons-nous vous aider ?"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Envoyer le message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <img
                src="/logo_nexuss.png"
                alt="NexusMine"
                className="h-10 w-auto mb-4 brightness-200"
              />
              <p className="text-slate-400 mb-6 max-w-md">
                NexusMine est la plateforme de référence pour la gestion intelligente
                des opérations minières en Afrique de l'Ouest.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-base font-semibold mb-4">Produit</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Intégrations</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-base font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Carrières</a></li>
                <li><a href="#contact" className="text-slate-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Mentions légales</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © 2026 NexusMine. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-slate-400 hover:text-white text-sm">Politique de confidentialité</a>
              <a href="#" className="text-slate-400 hover:text-white text-sm">Conditions d'utilisation</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
