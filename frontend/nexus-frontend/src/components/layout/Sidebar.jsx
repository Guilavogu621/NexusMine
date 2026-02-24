import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  MapPinIcon,
  GlobeAltIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CloudIcon,
  ChartBarIcon,
  BellIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  CubeIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CpuChipIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import useAuthStore from '../../stores/authStore';

const roleLabels = {
  ADMIN: 'Administrateur',
  SITE_MANAGER: 'Chef de site / Gestionnaire',
  TECHNICIEN: 'Technicien / Ingénieur terrain',
  ANALYST: 'Analyste',
  MMG: 'Ministère des Mines',
};

// Structure de navigation groupée
const navigationGroups = [
  {
    name: 'Dashboard',
    icon: HomeIcon,
    href: '/',
    roles: ['ADMIN', 'SITE_MANAGER', 'TECHNICIEN', 'ANALYST', 'MMG'],
  },
  {
    name: 'Sites & Zones',
    icon: MapPinIcon,
    roles: ['ADMIN', 'SITE_MANAGER', 'TECHNICIEN', 'ANALYST', 'MMG'],
    children: [
      { name: 'Sites Miniers', href: '/sites', icon: MapPinIcon },
      { name: 'Carte Guinée', href: '/sites/map', icon: GlobeAltIcon },
    ],
  },
  {
    name: 'Personnel',
    icon: UsersIcon,
    href: '/personnel',
    roles: ['ADMIN', 'SITE_MANAGER', 'TECHNICIEN', 'ANALYST', 'MMG'],
  },
  {
    name: 'Équipements',
    icon: WrenchScrewdriverIcon,
    href: '/equipment',
    roles: ['ADMIN', 'SITE_MANAGER', 'TECHNICIEN', 'ANALYST', 'MMG'],
  },
  {
    name: 'Opérations',
    icon: ClipboardDocumentListIcon,
    href: '/operations',
    roles: ['ADMIN', 'SITE_MANAGER', 'TECHNICIEN', 'ANALYST', 'MMG'],
  },
  {
    name: 'HSE & Environnement',
    icon: CloudIcon,
    roles: ['ADMIN', 'SITE_MANAGER', 'TECHNICIEN', 'ANALYST', 'MMG'],
    children: [
      { name: 'Incidents', href: '/incidents', icon: ExclamationTriangleIcon },
      { name: 'Environnement', href: '/environment', icon: CloudIcon },
    ],
  },
  {
    name: 'Monitoring',
    icon: ChartBarIcon,
    roles: ['ADMIN', 'SITE_MANAGER', 'SUPERVISOR', 'OPERATOR', 'ANALYST', 'MMG'],
    children: [
      { name: 'Indicateurs', href: '/analytics', icon: ChartBarIcon, roles: ['ADMIN', 'SITE_MANAGER', 'TECHNICIEN', 'ANALYST', 'MMG'] },
      { name: 'Intelligence IA', href: '/intelligence', icon: CpuChipIcon, roles: ['ADMIN', 'SITE_MANAGER', 'TECHNICIEN', 'ANALYST', 'MMG'] },
      { name: 'Alertes', href: '/alerts', icon: BellIcon },
    ],
  },
  {
    name: 'Stock',
    icon: CubeIcon,
    roles: ['ADMIN', 'SITE_MANAGER', 'SUPERVISOR', 'OPERATOR', 'ANALYST', 'MMG'],
    children: [
      { name: 'Mouvements', href: '/stock', icon: CubeIcon },
      { name: 'Zones / Emplacements', href: '/stock/locations', icon: MapPinIcon },
    ],
  },
  {
    name: 'Rapports',
    icon: DocumentTextIcon,
    href: '/reports',
    roles: ['ADMIN', 'SITE_MANAGER', 'SUPERVISOR', 'OPERATOR', 'ANALYST', 'MMG'],
  },
  {
    name: 'Utilisateurs',
    icon: Cog6ToothIcon,
    href: '/users',
    roles: ['ADMIN'],
  },
  {
    name: 'Audit & Conformité',
    icon: ShieldCheckIcon,
    href: '/audit',
    roles: ['MMG', 'ADMIN'],
  },
];

// Composant pour les groupes dépliables
function NavGroup({ group, hasRole }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(() => {
    if (group.children) {
      return group.children.some(child => location.pathname.startsWith(child.href));
    }
    return false;
  });

  // Si pas d'enfants (lien direct)
  if (!group.children) {
    return (
      <NavLink
        to={group.href}
        className={({ isActive }) =>
          `group flex items-center gap-x-3 rounded-xl px-4 py-3 text-[18px] font-medium transition-all duration-200 ${isActive
            ? 'bg-slate-800 text-white'
            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
          }`
        }
      >
        <group.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        {group.name}
      </NavLink>
    );
  }

  // Filtrer les enfants par rôle
  const visibleChildren = group.children.filter(child =>
    !child.roles || hasRole(child.roles)
  );

  if (visibleChildren.length === 0) return null;

  // Vérifier si un enfant est actif
  const hasActiveChild = visibleChildren.some(child =>
    location.pathname === child.href || location.pathname.startsWith(child.href + '/')
  );

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full group flex items-center justify-between rounded-xl px-4 py-3 text-[18px] font-medium transition-all duration-200 ${hasActiveChild
            ? 'bg-slate-800 text-white'
            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
          }`}
      >
        <span className="flex items-center gap-x-3">
          <group.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
          {group.name}
        </span>
        {isOpen ? (
          <ChevronDownIcon className="h-4 w-4 transition-transform" />
        ) : (
          <ChevronRightIcon className="h-4 w-4 transition-transform" />
        )}
      </button>

      {/* Sous-menu */}
      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-48' : 'max-h-0'}`}>
        <ul className="mt-1 ml-8 border-l border-slate-700/30 pl-3 space-y-0.5">
          {visibleChildren.map((child) => (
            <li key={child.name}>
              <NavLink
                to={child.href}
                className={({ isActive }) =>
                  `group flex items-center gap-x-3 rounded-xl px-3 py-2.5 text-[16px] font-medium transition-all duration-200 ${isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`
                }
              >
                <child.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                {child.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { user, hasRole } = useAuthStore();

  // Filtrer les groupes par rôle
  const visibleGroups = navigationGroups.filter(group => hasRole(group.roles));

  return (
    <div className="flex h-full w-72 flex-col bg-[#0f1729]">
      {/* Logo */}
      <div className="shrink-0 px-6 py-5 border-b border-white/[0.06]">
        <div className="flex flex-col items-center gap-2">
          <img
            src="/logo.png"
            alt="NexusMine"
            className="h-14 w-auto"
          />
          <span className="text-xl font-semibold text-white/90 tracking-tight">NexusMine</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-3 py-4 overflow-y-auto">
        <ul role="list" className="flex flex-1 flex-col gap-y-0.5">
          {visibleGroups.map((group) => (
            <li key={group.name}>
              <NavGroup group={group} hasRole={hasRole} />
            </li>
          ))}
        </ul>
      </nav>

      {/* User info */}
      <div className="border-t border-white/[0.06] p-4">
        <div className="flex items-center gap-x-3">
          <div className="h-10 w-10 rounded-full bg-indigo-600/80 flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[18px] font-medium text-white truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-[14px] text-slate-400 truncate">{roleLabels[user?.role] || user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
