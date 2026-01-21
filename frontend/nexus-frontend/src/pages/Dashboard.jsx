import { useEffect, useState } from 'react';
import {
  MapPinIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import api from '../api/axios';
import useAuthStore from '../stores/authStore';

const statsConfig = [
  { name: 'Sites Actifs', icon: MapPinIcon, key: 'sites', color: 'bg-blue-500' },
  { name: 'Personnel', icon: UsersIcon, key: 'personnel', color: 'bg-green-500' },
  { name: 'Équipements', icon: WrenchScrewdriverIcon, key: 'equipment', color: 'bg-yellow-500' },
  { name: 'Incidents', icon: ExclamationTriangleIcon, key: 'incidents', color: 'bg-red-500' },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    sites: 0,
    personnel: 0,
    equipment: 0,
    incidents: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sitesRes, personnelRes, equipmentRes, incidentsRes, alertsRes] = await Promise.all([
          api.get('/sites/'),
          api.get('/personnel/'),
          api.get('/equipment/'),
          api.get('/incidents/'),
          api.get('/alerts/?ordering=-generated_at'),
        ]);

        setStats({
          sites: sitesRes.data.length || sitesRes.data.count || 0,
          personnel: personnelRes.data.length || personnelRes.data.count || 0,
          equipment: equipmentRes.data.length || equipmentRes.data.count || 0,
          incidents: incidentsRes.data.length || incidentsRes.data.count || 0,
        });

        setRecentAlerts((alertsRes.data.results || alertsRes.data).slice(0, 5));
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {user?.first_name} 👋
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Voici un aperçu de vos opérations minières
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5"
          >
            <div className="flex items-center">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats[stat.key]}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Alerts */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Alertes Récentes
          </h2>
          {recentAlerts.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune alerte récente</p>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    alert.priority === 'HIGH' || alert.priority === 'CRITICAL'
                      ? 'bg-red-50'
                      : alert.priority === 'MEDIUM'
                      ? 'bg-yellow-50'
                      : 'bg-gray-50'
                  }`}
                >
                  <ExclamationTriangleIcon
                    className={`h-5 w-5 mt-0.5 ${
                      alert.priority === 'HIGH' || alert.priority === 'CRITICAL'
                        ? 'text-red-500'
                        : alert.priority === 'MEDIUM'
                        ? 'text-yellow-500'
                        : 'text-gray-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {alert.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.generated_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      alert.status === 'NEW'
                        ? 'bg-blue-100 text-blue-700'
                        : alert.status === 'READ'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {alert.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Actions Rapides
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/operations"
              className="flex flex-col items-center justify-center p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <ArrowTrendingUpIcon className="h-8 w-8 text-blue-600" />
              <span className="mt-2 text-sm font-medium text-blue-900">
                Nouvelle Opération
              </span>
            </a>
            <a
              href="/incidents"
              className="flex flex-col items-center justify-center p-4 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
            >
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              <span className="mt-2 text-sm font-medium text-red-900">
                Signaler Incident
              </span>
            </a>
            <a
              href="/environment"
              className="flex flex-col items-center justify-center p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
            >
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
              <span className="mt-2 text-sm font-medium text-green-900">
                Données Environnement
              </span>
            </a>
            <a
              href="/reports"
              className="flex flex-col items-center justify-center p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <ArrowTrendingDownIcon className="h-8 w-8 text-purple-600" />
              <span className="mt-2 text-sm font-medium text-purple-900">
                Générer Rapport
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
