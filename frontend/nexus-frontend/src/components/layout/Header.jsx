import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import useAuthStore from '../../stores/authStore';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="lg:hidden -m-2.5 p-2.5 text-gray-700"
        onClick={onMenuClick}
      >
        <span className="sr-only">Ouvrir le menu</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Search (optional) */}
        <div className="flex-1" />

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          <button
            type="button"
            className="relative -m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Voir les notifications</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="-m-1.5 flex items-center p-1.5">
              <span className="sr-only">Ouvrir le menu utilisateur</span>
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-4 text-sm font-semibold text-gray-900" aria-hidden="true">
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
              <Menu.Items className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/profile"
                      className={`${
                        active ? 'bg-gray-50' : ''
                      } flex items-center px-4 py-2 text-sm text-gray-700`}
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
                        active ? 'bg-gray-50' : ''
                      } flex items-center px-4 py-2 text-sm text-gray-700`}
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
                        active ? 'bg-gray-50' : ''
                      } flex w-full items-center px-4 py-2 text-sm text-red-600`}
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
