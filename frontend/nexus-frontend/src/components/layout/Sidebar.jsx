import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  MapPinIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CloudIcon,
  ChartBarIcon,
  BellIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import useAuthStore from '../../stores/authStore';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, roles: ['ADMIN', 'SUPERVISOR', 'OPERATOR', 'ANALYST', 'REGULATOR'] },
  { name: 'Sites Miniers', href: '/sites', icon: MapPinIcon, roles: ['ADMIN', 'SUPERVISOR', 'OPERATOR', 'ANALYST', 'REGULATOR'] },
  { name: 'Personnel', href: '/personnel', icon: UsersIcon, roles: ['ADMIN', 'SUPERVISOR', 'ANALYST', 'REGULATOR'] },
  { name: 'Équipements', href: '/equipment', icon: WrenchScrewdriverIcon, roles: ['ADMIN', 'SUPERVISOR', 'OPERATOR', 'ANALYST', 'REGULATOR'] },
  { name: 'Opérations', href: '/operations', icon: ClipboardDocumentListIcon, roles: ['ADMIN', 'SUPERVISOR', 'OPERATOR', 'ANALYST', 'REGULATOR'] },
  { name: 'Incidents', href: '/incidents', icon: ExclamationTriangleIcon, roles: ['ADMIN', 'SUPERVISOR', 'OPERATOR', 'ANALYST', 'REGULATOR'] },
  { name: 'Environnement', href: '/environment', icon: CloudIcon, roles: ['ADMIN', 'SUPERVISOR', 'OPERATOR', 'ANALYST', 'REGULATOR'] },
  { name: 'Indicateurs', href: '/analytics', icon: ChartBarIcon, roles: ['ADMIN', 'SUPERVISOR', 'ANALYST', 'REGULATOR'] },
  { name: 'Alertes', href: '/alerts', icon: BellIcon, roles: ['ADMIN', 'SUPERVISOR', 'OPERATOR', 'ANALYST', 'REGULATOR'] },
  { name: 'Rapports', href: '/reports', icon: DocumentTextIcon, roles: ['ADMIN', 'SUPERVISOR', 'ANALYST', 'REGULATOR'] },
  { name: 'Utilisateurs', href: '/users', icon: Cog6ToothIcon, roles: ['ADMIN'] },
];

export default function Sidebar() {
  const { user, hasRole } = useAuthStore();

  const filteredNavigation = navigation.filter((item) => hasRole(item.roles));

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      {/* Logo */}
      <div className="flex h-20 shrink-0 items-center px-4 border-b border-gray-800">
        <div className="flex items-center">
          <img 
            src="/logo.png" 
            alt="NexusMine" 
            className="h-12 w-auto"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-4 py-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-1">
          {filteredNavigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `group flex gap-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User info */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center gap-x-3">
          <div className="h-9 w-9 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
