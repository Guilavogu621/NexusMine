import { useEffect, useState, useCallback, useRef } from 'react';
import {
  BellIcon,
  XMarkIcon,
  CheckIcon,
  ClockIcon,
  FunnelIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

/**
 * NotificationCenter - Composant de gestion des notifications WebSocket
 * Supporte:
 * - Filtrage par catégorie, gravité, type
 * - Groupement par catégorie/site
 * - Actions: dismiss, snooze, read
 * - Préférences utilisateur
 */
export default function NotificationCenter() {
  const [alerts, setAlerts] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    severity: [],
    alert_type: '',
  });
  const [preferences, setPreferences] = useState({
    group_by_category: true,
    group_by_site: true,
    default_snooze_minutes: 30,
    alerts_per_page: 20,
  });
  const [loading, setLoading] = useState(false);
  const wsRef = useRef(null);
  const connectionTimeoutRef = useRef(null);

  // Connexion WebSocket
  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, []);

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/notifications/`;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connecté');
        // Demander les alertes existantes
        sendWebSocketMessage({
          action: 'filter',
          filters: filters,
        });
      };

      wsRef.current.onmessage = (event) => {
        handleWebSocketMessage(event.data);
      };

      wsRef.current.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket fermé, tentative de reconnexion...');
        connectionTimeoutRef.current = setTimeout(connectWebSocket, 5000);
      };
    } catch (error) {
      console.error('Erreur connexion WebSocket:', error);
    }
  };

  const handleWebSocketMessage = (data) => {
    const message = JSON.parse(data);

    if (message.type === 'alert_notification') {
      addAlert(message.alert);
    } else if (message.type === 'alerts_list') {
      setAlerts(message.alerts || []);
      updateUnreadCount(message.alerts || []);
      groupAlerts(message.alerts || []);
    } else if (message.type === 'alert_dismissed') {
      removeAlert(message.alert_id);
    } else if (message.type === 'preferences') {
      setPreferences(message.preferences);
    } else if (message.type === 'success') {
      console.log('Succès:', message.message);
    } else if (message.type === 'error') {
      console.error('Erreur:', message.message);
    }
  };

  const sendWebSocketMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const addAlert = (alert) => {
    setAlerts((prev) => [alert, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  const removeAlert = (alertId) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const updateUnreadCount = (alertsList) => {
    const count = alertsList.filter((a) => a.status === 'NEW').length;
    setUnreadCount(count);
  };

  const groupAlerts = (alertsList) => {
    if (!preferences.group_by_category && !preferences.group_by_site) {
      return;
    }

    const grouped = {};
    alertsList.forEach((alert) => {
      let key = 'Autres';

      if (preferences.group_by_category && alert.category) {
        key = alert.category;
      } else if (preferences.group_by_site && alert.site) {
        key = alert.site;
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(alert);
    });

    setGrouped(grouped);
  };

  // ============ ACTIONS ============

  const handleDismiss = (alertId) => {
    sendWebSocketMessage({
      action: 'dismiss',
      alert_id: alertId,
    });
  };

  const handleSnooze = (alertId, minutes = null) => {
    const snoozeMinutes = minutes || preferences.default_snooze_minutes;
    sendWebSocketMessage({
      action: 'snooze',
      alert_id: alertId,
      minutes: snoozeMinutes,
    });
  };

  const handleRead = (alertId) => {
    sendWebSocketMessage({
      action: 'read',
      alert_id: alertId,
    });
  };

  const handleMarkAllRead = () => {
    sendWebSocketMessage({
      action: 'mark_all_read',
    });
  };

  const handleApplyFilter = (newFilters) => {
    setFilters(newFilters);
    sendWebSocketMessage({
      action: 'filter',
      filters: newFilters,
    });
  };

  const handleUpdatePreferences = (newPrefs) => {
    setPreferences(newPrefs);
    sendWebSocketMessage({
      action: 'update_preferences',
      preferences: newPrefs,
    });
  };

  const getSeverityColor = (severity) => {
    const colors = {
      LOW: 'bg-blue-100 text-blue-800 border-blue-300',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
      CRITICAL: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[severity] || colors.MEDIUM;
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'CRITICAL' || severity === 'HIGH') {
      return <ExclamationTriangleIcon className="h-5 w-5" />;
    }
    return null;
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      OPERATIONAL: '⚙️',
      SAFETY: '🛡️',
      MAINTENANCE: '🔧',
      ENVIRONMENTAL: '🌍',
      TECHNICAL: '💻',
      ADMINISTRATIVE: '📋',
    };
    return emojis[category] || '📌';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Bouton d'ouverture */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-indigo-600 text-white rounded-full p-3 shadow-lg hover:bg-indigo-700 transition-all"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel des notifications */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BellIcon className="h-5 w-5" />
                <h3 className="font-bold">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-indigo-500/20 p-1 rounded"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Filtres et actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowPreferences(true)}
                className="flex-1 bg-indigo-500/30 hover:bg-indigo-500/50 p-2 rounded text-sm flex items-center justify-center gap-1 transition-all"
              >
                <Cog6ToothIcon className="h-4 w-4" />
                Préférences
              </button>
              <button
                onClick={handleMarkAllRead}
                className="flex-1 bg-indigo-500/30 hover:bg-indigo-500/50 p-2 rounded text-sm flex items-center justify-center gap-1 transition-all"
              >
                <CheckIcon className="h-4 w-4" />
                Lues
              </button>
            </div>
          </div>

          {/* Filtres */}
          <FilterBar filters={filters} onFilter={handleApplyFilter} />

          {/* Liste des alertes ou vue groupée */}
          <div className="max-h-96 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <BellIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>Aucune alerte</p>
              </div>
            ) : preferences.group_by_category || preferences.group_by_site ? (
              Object.entries(grouped).map(([groupKey, groupAlerts]) => (
                <AlertGroup
                  key={groupKey}
                  title={groupKey}
                  alerts={groupAlerts}
                  onDismiss={handleDismiss}
                  onSnooze={handleSnooze}
                  onRead={handleRead}
                  getSeverityColor={getSeverityColor}
                  getSeverityIcon={getSeverityIcon}
                  getCategoryEmoji={getCategoryEmoji}
                />
              ))
            ) : (
              alerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onDismiss={handleDismiss}
                  onSnooze={handleSnooze}
                  onRead={handleRead}
                  getSeverityColor={getSeverityColor}
                  getSeverityIcon={getSeverityIcon}
                  getCategoryEmoji={getCategoryEmoji}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal des préférences */}
      {showPreferences && (
        <PreferencesModal
          preferences={preferences}
          onSave={handleUpdatePreferences}
          onClose={() => setShowPreferences(false)}
        />
      )}
    </div>
  );
}

// ============ COMPOSANTS ENFANTS ============

function FilterBar({ filters, onFilter }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 p-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 rounded transition-all"
      >
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">Filtres</span>
        </div>
      </button>

      {open && (
        <div className="mt-2 space-y-2 p-2 bg-slate-50 rounded">
          <select
            value={filters.severity.join(',')}
            onChange={(e) =>
              onFilter({
                ...filters,
                severity: e.target.value ? e.target.value.split(',') : [],
              })
            }
            className="w-full p-2 border border-slate-300 rounded text-sm"
          >
            <option value="">Toutes les gravités</option>
            <option value="CRITICAL">Critique</option>
            <option value="HIGH">Élevée</option>
            <option value="MEDIUM">Moyenne</option>
            <option value="LOW">Faible</option>
          </select>
        </div>
      )}
    </div>
  );
}

function AlertGroup({
  title,
  alerts,
  onDismiss,
  onSnooze,
  onRead,
  getSeverityColor,
  getSeverityIcon,
  getCategoryEmoji,
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border-b border-slate-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 hover:bg-slate-50 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCategoryEmoji(title)}</span>
          <span className="font-semibold text-slate-800">{title}</span>
          <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
            {alerts.length}
          </span>
        </div>
        <span>{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div className="bg-slate-50 divide-y">
          {alerts.map((alert) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onDismiss={onDismiss}
              onSnooze={onSnooze}
              onRead={onRead}
              getSeverityColor={getSeverityColor}
              getSeverityIcon={getSeverityIcon}
              compact
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AlertItem({
  alert,
  onDismiss,
  onSnooze,
  onRead,
  getSeverityColor,
  getSeverityIcon,
  getCategoryEmoji,
  compact = false,
}) {
  return (
    <div className={`p-3 border-l-4 ${getSeverityColor(alert.severity)} border-l-indigo-500`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {getSeverityIcon(alert.severity)}
            <h4 className="font-semibold text-slate-800 text-sm">{alert.title}</h4>
          </div>
          {!compact && (
            <p className="text-xs text-slate-600 mb-2">{alert.message}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{new Date(alert.generated_at).toLocaleTimeString('fr-FR')}</span>
            {alert.status === 'NEW' && (
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Nouvelle</span>
            )}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-1">
          {alert.status === 'NEW' && (
            <button
              onClick={() => onRead(alert.id)}
              title="Marquer comme lue"
              className="p-1 hover:bg-white/50 rounded"
            >
              <CheckIcon className="h-4 w-4 text-green-600" />
            </button>
          )}

          <button
            onClick={() => onSnooze(alert.id)}
            title="Snooze 30 min"
            className="p-1 hover:bg-white/50 rounded"
          >
            <ClockIcon className="h-4 w-4 text-yellow-600" />
          </button>

          <button
            onClick={() => onDismiss(alert.id)}
            title="Rejeter"
            className="p-1 hover:bg-white/50 rounded"
          >
            <XMarkIcon className="h-4 w-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PreferencesModal({ preferences, onSave, onClose }) {
  const [prefs, setPrefs] = useState(preferences);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4 flex items-center justify-between">
          <h3 className="font-bold">Préférences de notification</h3>
          <button onClick={onClose} className="hover:bg-indigo-500/20 p-1 rounded">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Groupement */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={prefs.group_by_category}
                onChange={(e) => setPrefs({ ...prefs, group_by_category: e.target.checked })}
              />
              <span className="text-sm text-slate-700">Grouper par catégorie</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={prefs.group_by_site}
                onChange={(e) => setPrefs({ ...prefs, group_by_site: e.target.checked })}
              />
              <span className="text-sm text-slate-700">Grouper par site</span>
            </label>
          </div>

          {/* Snooze */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Durée snooze par défaut (min)
            </label>
            <input
              type="number"
              value={prefs.default_snooze_minutes}
              onChange={(e) => setPrefs({ ...prefs, default_snooze_minutes: parseInt(e.target.value) })}
              className="w-full p-2 border border-slate-300 rounded"
            />
          </div>

          {/* Alertes par page */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Alertes par page
            </label>
            <input
              type="number"
              value={prefs.alerts_per_page}
              onChange={(e) => setPrefs({ ...prefs, alerts_per_page: parseInt(e.target.value) })}
              className="w-full p-2 border border-slate-300 rounded"
            />
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="flex-1 p-2 border border-slate-300 rounded hover:bg-slate-50"
          >
            Annuler
          </button>
          <button
            onClick={() => {
              onSave(prefs);
              onClose();
            }}
            className="flex-1 p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}
