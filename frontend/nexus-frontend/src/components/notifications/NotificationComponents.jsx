import { useNotifications, useNotificationActionsContext } from '../context/NotificationContext';
import { BellIcon } from '@heroicons/react/24/outline';

/**
 * NotificationBadge - Badge simple affichant le nombre de notifications non lues
 * Utilisation: <NotificationBadge />
 */
export function NotificationBadge() {
  const { unreadCount } = useNotifications();

  if (unreadCount === 0) return null;

  return (
    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full text-white text-xs font-bold bg-red-600">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}

/**
 * NotificationIcon - Icône de cloche avec badge
 * Utilisation: <NotificationIcon onClick={() => setOpen(true)} />
 */
export function NotificationIcon({ onClick }) {
  const { unreadCount } = useNotifications();

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
      title="Notifications"
    >
      <BellIcon className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 h-2 w-2 bg-red-600 rounded-full" />
      )}
    </button>
  );
}

/**
 * NotificationToast - Toast simple pour afficher une notification
 * Utilisation: <NotificationToast alert={alert} onClose={() => dismiss(alert.id)} />
 */
export function NotificationToast({ alert, onClose }) {
  const severityColors = {
    CRITICAL: 'bg-red-50 border-red-200',
    HIGH: 'bg-orange-50 border-orange-200',
    MEDIUM: 'bg-yellow-50 border-yellow-200',
    LOW: 'bg-blue-50 border-blue-200',
  };

  return (
    <div className={`p-4 rounded-lg border ${severityColors[alert.severity] || severityColors.MEDIUM}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900">{alert.title}</h4>
          <p className="text-sm text-slate-700 mt-1">{alert.message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/**
 * QuickNotificationPanel - Panneau rapide des 5 dernières alertes
 * Utilisation: <QuickNotificationPanel />
 */
export function QuickNotificationPanel() {
  const { alerts, unreadCount } = useNotifications();
  const actions = useNotificationActionsContext();
  const recentAlerts = alerts.slice(0, 5);

  const getSeverityEmoji = (severity) => {
    const emojis = {
      CRITICAL: '🔴',
      HIGH: '🟠',
      MEDIUM: '🟡',
      LOW: '🔵',
    };
    return emojis[severity] || '⚪';
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900">Alertes récentes</h3>
        {unreadCount > 0 && (
          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
            {unreadCount}
          </span>
        )}
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {recentAlerts.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">Aucune alerte</p>
        ) : (
          recentAlerts.map((alert) => (
            <div key={alert.id} className="p-2 bg-slate-50 rounded border border-slate-200">
              <div className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0 mt-0.5">
                  {getSeverityEmoji(alert.severity)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {alert.title}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {alert.message}
                  </p>
                </div>
                {alert.status === 'NEW' && (
                  <button
                    onClick={() => actions.read(alert.id)}
                    className="flex-shrink-0 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition-colors"
                  >
                    Lire
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
