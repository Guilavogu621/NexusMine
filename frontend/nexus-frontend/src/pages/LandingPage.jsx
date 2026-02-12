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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src="/logo_nexuss.svg"
                alt="NexusMine"
                className="h-12 w-auto"
              />
              NexusMine

            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className={`text-sm font-medium transition-colors ${
                isScrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white hover:text-blue-200'
              }`}>
                Fonctionnalités
              </a>
              <a href="#stats" className={`text-sm font-medium transition-colors ${
                isScrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white hover:text-blue-200'
              }`}>
                Impact
              </a>
              <a href="#resources" className={`text-sm font-medium transition-colors ${
                isScrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white hover:text-blue-200'
              }`}>
                Ressources
              </a>
              <a href="#testimonials" className={`text-sm font-medium transition-colors ${
                isScrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white hover:text-blue-200'
              }`}>
                Témoignages
              </a>
              <a href="#contact" className={`text-sm font-medium transition-colors ${
                isScrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white hover:text-blue-200'
              }`}>
                Contact
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className={`text-sm font-medium transition-colors ${
                  isScrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white hover:text-blue-200'
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
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/60"></div>
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
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Optimisez vos{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Opérations Minières
                </span>{' '}
                en Guinée
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-xl">
                NexusMine centralise la gestion de vos sites, équipements, personnel et production 
                pour une exploitation minière plus efficace, sécurisée et durable.
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

            {/* Dashboard Preview - Style CRM Premium */}
            <div className="hidden lg:block relative">
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-500" style={{ width: '520px' }}>
                
                {/* Dashboard Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <ChartBarIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span className="text-white font-semibold text-sm">NexusMine Dashboard</span>
                      <span className="text-blue-200 text-xs ml-2">MINING.IO</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg">Overview</button>
                    <button className="text-blue-200 text-xs px-3 py-1.5 hover:text-white">Sites</button>
                    <button className="text-blue-200 text-xs px-3 py-1.5 hover:text-white">Rapports</button>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-4 bg-gray-50">
                  
                  {/* KPI Cards Row 1 */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white">
                      <div className="text-[10px] opacity-80 mb-1">Production Totale</div>
                      <div className="text-lg font-bold">8.5M</div>
                      <div className="text-[9px] opacity-70">tonnes</div>
                    </div>
                    <div className="bg-gradient-to-br from-sky-400 to-sky-500 rounded-xl p-3 text-white">
                      <div className="text-[10px] opacity-80 mb-1">Taux Extraction</div>
                      <div className="text-lg font-bold">94.2%</div>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-xl p-3 text-white">
                      <div className="text-[10px] opacity-80 mb-1">Efficacité</div>
                      <div className="text-lg font-bold">87.5%</div>
                    </div>
                    <div className="bg-gradient-to-br from-teal-400 to-teal-500 rounded-xl p-3 text-white">
                      <div className="text-[10px] opacity-80 mb-1">Jours sans incident</div>
                      <div className="text-lg font-bold">127</div>
                    </div>
                  </div>

                  {/* KPI Cards Row 2 */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-xl p-3 text-white">
                      <div className="text-[10px] opacity-80 mb-1">Valeur Pipeline</div>
                      <div className="text-lg font-bold">$24.8M</div>
                    </div>
                    <div className="bg-gradient-to-br from-violet-400 to-violet-500 rounded-xl p-3 text-white">
                      <div className="text-[10px] opacity-80 mb-1">Sites Actifs</div>
                      <div className="text-lg font-bold">24</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl p-3 text-white">
                      <div className="text-[10px] opacity-80 mb-1">Équipements</div>
                      <div className="text-lg font-bold">456</div>
                    </div>
                    <div className="bg-gradient-to-br from-fuchsia-400 to-fuchsia-500 rounded-xl p-3 text-white">
                      <div className="text-[10px] opacity-80 mb-1">Personnel</div>
                      <div className="text-lg font-bold">1,234</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-3">
                    {/* Left Column - Charts */}
                    <div className="col-span-3 space-y-3">
                      
                      {/* Area Chart - Production */}
                      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200/60">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-slate-600">Production (12 derniers mois)</span>
                          <div className="flex gap-3">
                            <span className="text-[9px] text-indigo-500 flex items-center gap-1">
                              <span className="w-2 h-0.5 bg-indigo-500 rounded"></span>Bauxite
                            </span>
                            <span className="text-[9px] text-cyan-500 flex items-center gap-1">
                              <span className="w-2 h-0.5 bg-cyan-400 rounded"></span>Or
                            </span>
                          </div>
                        </div>
                        {/* SVG Area Chart */}
                        <div className="relative h-20">
                          <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                            {/* Grid lines */}
                            <line x1="0" y1="20" x2="300" y2="20" stroke="#f0f0f0" strokeWidth="1"/>
                            <line x1="0" y1="40" x2="300" y2="40" stroke="#f0f0f0" strokeWidth="1"/>
                            <line x1="0" y1="60" x2="300" y2="60" stroke="#f0f0f0" strokeWidth="1"/>
                            
                            {/* Area fill - Bauxite */}
                            <defs>
                              <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
                                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05"/>
                              </linearGradient>
                              <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.3"/>
                                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.05"/>
                              </linearGradient>
                            </defs>
                            
                            <path d="M0,60 L25,55 L50,35 L75,25 L100,30 L125,35 L150,28 L175,40 L200,35 L225,45 L250,30 L275,25 L300,20 L300,80 L0,80 Z" fill="url(#blueGradient)"/>
                            <path d="M0,60 L25,55 L50,35 L75,25 L100,30 L125,35 L150,28 L175,40 L200,35 L225,45 L250,30 L275,25 L300,20" fill="none" stroke="#3B82F6" strokeWidth="2"/>
                            
                            {/* Line - Or */}
                            <path d="M0,65 L25,62 L50,55 L75,50 L100,52 L125,48 L150,45 L175,50 L200,48 L225,52 L250,45 L275,42 L300,38" fill="none" stroke="#06B6D4" strokeWidth="2"/>
                          </svg>
                          {/* Y-axis labels */}
                          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[8px] text-slate-400 -ml-1">
                            <span>1M</span>
                            <span>500K</span>
                            <span>0</span>
                          </div>
                        </div>
                        <div className="flex justify-between mt-1 text-[8px] text-slate-400 px-2">
                          <span>Mai</span><span>Juil</span><span>Sep</span><span>Nov</span><span>Jan</span><span>Mar</span>
                        </div>
                      </div>

                      {/* Area Chart - Projection */}
                      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200/60">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-slate-600">Projection (12 prochains mois)</span>
                          <div className="flex gap-3">
                            <span className="text-[9px] text-indigo-500 flex items-center gap-1">
                              <span className="w-2 h-0.5 bg-indigo-500 rounded"></span>Estimé
                            </span>
                            <span className="text-[9px] text-emerald-500 flex items-center gap-1">
                              <span className="w-2 h-0.5 bg-emerald-400 rounded"></span>Objectif
                            </span>
                          </div>
                        </div>
                        {/* SVG Area Chart */}
                        <div className="relative h-16">
                          <svg className="w-full h-full" viewBox="0 0 300 60" preserveAspectRatio="none">
                            <line x1="0" y1="15" x2="300" y2="15" stroke="#f0f0f0" strokeWidth="1"/>
                            <line x1="0" y1="30" x2="300" y2="30" stroke="#f0f0f0" strokeWidth="1"/>
                            <line x1="0" y1="45" x2="300" y2="45" stroke="#f0f0f0" strokeWidth="1"/>
                            
                            <path d="M0,45 L50,40 L100,35 L150,25 L200,30 L250,22 L300,18 L300,60 L0,60 Z" fill="url(#blueGradient)"/>
                            <path d="M0,45 L50,40 L100,35 L150,25 L200,30 L250,22 L300,18" fill="none" stroke="#3B82F6" strokeWidth="2"/>
                            <path d="M0,50 L50,45 L100,40 L150,35 L200,32 L250,28 L300,25" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="4,2"/>
                          </svg>
                        </div>
                        <div className="flex justify-between mt-1 text-[8px] text-slate-400 px-2">
                          <span>Mai 25</span><span>Sep 25</span><span>Jan 26</span><span>Mai 26</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Donut Charts */}
                    <div className="col-span-2 space-y-3">
                      
                      {/* Donut Chart - Sites par type */}
                      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200/60">
                        <span className="text-xs font-semibold text-slate-600">Répartition Sites</span>
                        <div className="flex items-center mt-2">
                          {/* SVG Donut */}
                          <div className="relative w-16 h-16">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="14" fill="none" stroke="#E5E7EB" strokeWidth="4"/>
                              <circle cx="18" cy="18" r="14" fill="none" stroke="#3B82F6" strokeWidth="4" strokeDasharray="35 65" strokeLinecap="round"/>
                              <circle cx="18" cy="18" r="14" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray="25 75" strokeDashoffset="-35" strokeLinecap="round"/>
                              <circle cx="18" cy="18" r="14" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray="20 80" strokeDashoffset="-60" strokeLinecap="round"/>
                              <circle cx="18" cy="18" r="14" fill="none" stroke="#EF4444" strokeWidth="4" strokeDasharray="15 85" strokeDashoffset="-80" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <div className="ml-2 space-y-1">
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                              <span className="text-[9px] text-slate-500">Ciel ouvert 35%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span className="text-[9px] text-slate-500">Souterrain 25%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                              <span className="text-[9px] text-slate-500">Alluvial 20%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              <span className="text-[9px] text-slate-500">Exploration 15%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Donut Chart - Types incidents */}
                      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200/60">
                        <span className="text-xs font-semibold text-slate-600">Types d'incidents</span>
                        <div className="flex items-center mt-2">
                          {/* SVG Donut */}
                          <div className="relative w-16 h-16">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="14" fill="none" stroke="#E5E7EB" strokeWidth="4"/>
                              <circle cx="18" cy="18" r="14" fill="none" stroke="#8B5CF6" strokeWidth="4" strokeDasharray="32 68" strokeLinecap="round"/>
                              <circle cx="18" cy="18" r="14" fill="none" stroke="#EC4899" strokeWidth="4" strokeDasharray="25 75" strokeDashoffset="-32" strokeLinecap="round"/>
                              <circle cx="18" cy="18" r="14" fill="none" stroke="#F97316" strokeWidth="4" strokeDasharray="22 78" strokeDashoffset="-57" strokeLinecap="round"/>
                              <circle cx="18" cy="18" r="14" fill="none" stroke="#14B8A6" strokeWidth="4" strokeDasharray="18 82" strokeDashoffset="-79" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <div className="ml-2 space-y-1">
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
                              <span className="text-[9px] text-slate-500">Équipement 32%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                              <span className="text-[9px] text-slate-500">Sécurité 25%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                              <span className="text-[9px] text-slate-500">Environnement 22%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                              <span className="text-[9px] text-slate-500">Autre 18%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Filters */}
                      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200/60">
                        <span className="text-xs font-semibold text-slate-600 mb-2 block">Filtres rapides</span>
                        <div className="space-y-2">
                          <div>
                            <span className="text-[9px] text-slate-500">Période</span>
                            <div className="bg-slate-50 rounded px-2 py-1 text-[10px] text-slate-600 mt-0.5 flex justify-between items-center">
                              <span>01/01/2025 - 31/12/2025</span>
                              <ChevronDownIcon className="h-3 w-3 text-slate-400" />
                            </div>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500">Site</span>
                            <div className="bg-slate-50 rounded px-2 py-1 text-[10px] text-slate-600 mt-0.5 flex justify-between items-center">
                              <span>Tous les sites</span>
                              <ChevronDownIcon className="h-3 w-3 text-slate-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notifications */}
              <div className="absolute -right-4 top-12 bg-white rounded-xl shadow-xl p-3 animate-bounce border border-slate-200/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center">
                    <ArrowRightIcon className="h-4 w-4 text-white rotate-[-45deg]" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">+12.5%</div>
                    <div className="text-[10px] text-slate-500">ce mois</div>
                  </div>
                </div>
              </div>

              <div className="absolute -left-6 bottom-20 bg-white rounded-xl shadow-xl p-3 border border-slate-200/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <ShieldCheckIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">127 jours</div>
                    <div className="text-[10px] text-slate-500">sans incident</div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-2 bottom-8 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl shadow-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <CpuChipIcon className="h-4 w-4" />
                  <span className="text-xs font-medium">IA Prédictive</span>
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
      <section id="features" className="py-24 bg-gray-50">
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
      <section id="stats" className="py-24 bg-gradient-to-r from-blue-600 to-blue-800 relative overflow-hidden">
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
      <section id="resources" className="py-24 bg-white">
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
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
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
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        {/* Background Image - Tunnel minier */}
        <div className="absolute inset-0">
          <img
            src="/mine-tunnel.png"
            alt="Mineurs dans un tunnel souterrain"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/90"></div>
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
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
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
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
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
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
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
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
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
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
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
      <section id="testimonials" className="py-24 bg-gray-50">
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
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
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
      <section className="py-24 bg-gradient-to-r from-gray-900 to-gray-800 relative overflow-hidden">
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
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Adresse</div>
                    <div className="text-slate-500">Kaloum, Conakry, Guinée<br />Immeuble NexusMine, 3ème étage</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <PhoneIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">Téléphone</div>
                    <div className="text-slate-500">+224 0000000000000<br />+224 628 00 00 00</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
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
                src="/logo_nexuss.svg"
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
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-indigo-600 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
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
