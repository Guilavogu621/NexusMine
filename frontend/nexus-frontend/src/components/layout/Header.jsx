import { Fragment, useState, useEffect, useCallback } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import useAuthStore from '../../stores/authStore';
import api from '../../api/axios';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Charger le nombre d'alertes non lues (status = NEW)
  const fetchUnreadAlerts = useCallback(async () => {
    try {
      const res = await api.get('/alerts/', { params: { status: 'NEW' } });
      const count = res.data?.count ?? res.data?.results?.length ?? 0;
      setUnreadCount(count);
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchUnreadAlerts();
    const interval = setInterval(fetchUnreadAlerts, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadAlerts]);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-8 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden -m-2.5 p-2.5 text-slate-500 hover:text-slate-700"
            onClick={onMenuClick}
          >
            <span className="sr-only">Ouvrir le menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Page title area */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Tableau de bord
            </h2>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-x-4">
          {/* Search */}
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <MagnifyingGlassIcon className="h-6 w-6" />
          </button>

          {/* Notifications */}
          <button
            type="button"
            onClick={() => navigate('/alerts')}
            className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title={`${unreadCount} alerte${unreadCount !== 1 ? 's' : ''} non lue${unreadCount !== 1 ? 's' : ''}`}
          >
            <BellIcon className="h-6 w-6" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center h-5 min-w-[20px] px-1 text-xs font-bold text-white bg-rose-500 rounded-full animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Separator */}
          <div className="hidden lg:block h-6 w-px bg-slate-200" aria-hidden="true" />

          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center">
                <span className="text-sm font-medium text-slate-200">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="text-base font-medium text-slate-700" aria-hidden="true">
                  {user?.first_name} {user?.last_name}
                </span>
              </span>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2.5 w-56 origin-top-right rounded-xl bg-white py-2 shadow-lg ring-1 ring-slate-200/60 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/profile"
                      className={`${
                        active ? 'bg-slate-50' : ''
                      } flex items-center px-4 py-2.5 text-[0.95rem] text-gray-700`}
                    >
                      <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400" />
                      Mon profil
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/settings"
                      className={`${
                        active ? 'bg-slate-50' : ''
                      } flex items-center px-4 py-2.5 text-[0.95rem] text-gray-700`}
                    >
                      <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400" />
                      Paramètres
                    </a>
                  )}
                </Menu.Item>
                <hr className="my-1 border-gray-100" />
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? 'bg-slate-50' : ''
                      } flex w-full items-center px-4 py-2.5 text-[0.95rem] text-red-600`}
                    >
                      <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                      Déconnexion
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
}
