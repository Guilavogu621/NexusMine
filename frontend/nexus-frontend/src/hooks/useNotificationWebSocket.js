import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * useNotificationWebSocket - Hook pour gérer la connexion WebSocket aux notifications
 *
 * @param {Object} options Options de configuration
 * @param {Function} options.onAlert Callback quand une alerte arrive
 * @param {Function} options.onAlertsUpdate Callback quand la liste des alertes est mise à jour
 * @param {Function} options.onError Callback quand une erreur occur
 * @param {number} options.reconnectDelay Délai de reconnexion (ms)
 * @returns {Object} {isConnected, send, disconnect, alerts, unreadCount}
 */
export function useNotificationWebSocket(options = {}) {
  const {
    onAlert,
    onAlertsUpdate,
    onError,
    reconnectDelay = 5000,
  } = options;

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

    // Récupérer la base du backend depuis les variables d'environnement ou axios
    let apiBase = import.meta.env.VITE_API_BASE_URL || '';
    let wsHost = window.location.host;

    if (apiBase.startsWith('http')) {
      // Extraire le host de l'URL de l'API (ex: nexus-backend-n9be.onrender.com)
      try {
        const url = new URL(apiBase);
        wsHost = url.host;
      } catch (e) {
        console.error("Invalid VITE_API_BASE_URL", e);
      }
    }

    const wsBase = import.meta.env.VITE_WS_BASE_URL || `${protocol}//${wsHost}`;

    // S'assurer que le chemin /ws/notifications/ est présent
    let wsUrl = wsBase;
    if (!wsUrl.includes('/ws/')) {
      wsUrl = wsUrl.endsWith('/') ? `${wsUrl}ws/notifications/` : `${wsUrl}/ws/notifications/`;
    }

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('[WebSocket] Connected');
        setIsConnected(true);
        // Récupérer les alertes existantes
        send({ action: 'list' });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('[WebSocket] Parse error:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        setIsConnected(false);
        if (onError) {
          onError(error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('[WebSocket] Closed, reconnecting...');
        setIsConnected(false);
        scheduleReconnect();
      };
    } catch (error) {
      console.error('[WebSocket] Connection failed:', error);
      if (onError) {
        onError(error);
      }
      scheduleReconnect();
    }
  }, [onError]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectTimeoutRef.current = setTimeout(connect, reconnectDelay);
  }, [connect, reconnectDelay]);

  const handleMessage = useCallback(
    (message) => {
      switch (message.type) {
        case 'alert_notification':
          if (onAlert) {
            onAlert(message.alert);
          }
          setAlerts((prev) => [message.alert, ...prev]);
          setUnreadCount((prev) => prev + 1);
          break;

        case 'alerts_list':
          setAlerts(message.alerts || []);
          const count = (message.alerts || []).filter(
            (a) => a.status === 'NEW'
          ).length;
          setUnreadCount(count);
          if (onAlertsUpdate) {
            onAlertsUpdate(message.alerts || []);
          }
          break;

        case 'alert_dismissed':
          setAlerts((prev) => prev.filter((a) => a.id !== message.alert_id));
          break;

        case 'alert_snoozed':
          setAlerts((prev) =>
            prev.map((a) =>
              a.id === message.alert_id
                ? { ...a, status: 'SNOOZED', snoozed_until: message.snoozed_until }
                : a
            )
          );
          break;

        case 'alert_read':
          setAlerts((prev) =>
            prev.map((a) =>
              a.id === message.alert_id ? { ...a, status: 'READ' } : a
            )
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
          break;

        case 'preferences':
          console.log('[WebSocket] Preferences updated:', message.preferences);
          break;

        case 'success':
          console.log('[WebSocket] Success:', message.message);
          break;

        case 'error':
          console.error('[WebSocket] Error:', message.message);
          if (onError) {
            onError(new Error(message.message));
          }
          break;

        default:
          console.warn('[WebSocket] Unknown message type:', message.type);
      }
    },
    [onAlert, onAlertsUpdate, onError]
  );

  const send = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Not connected, message not sent:', message);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setIsConnected(false);
  }, []);

  // Connexion automatique
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    send,
    disconnect,
    alerts,
    unreadCount,
  };
}

/**
 * useNotificationActions - Hook pour envoyer les actions au consumer WebSocket
 * @param {Function} send Fonction d'envoi WebSocket
 * @returns {Object} {dismiss, snooze, read, markAllRead, filter, updatePreferences}
 */
export function useNotificationActions(send) {
  return {
    dismiss: (alertId) => {
      send({
        action: 'dismiss',
        alert_id: alertId,
      });
    },

    snooze: (alertId, minutes = 30) => {
      send({
        action: 'snooze',
        alert_id: alertId,
        minutes,
      });
    },

    read: (alertId) => {
      send({
        action: 'read',
        alert_id: alertId,
      });
    },

    markAllRead: () => {
      send({
        action: 'mark_all_read',
      });
    },

    filter: (filters) => {
      send({
        action: 'filter',
        filters,
      });
    },

    updatePreferences: (preferences) => {
      send({
        action: 'update_preferences',
        preferences,
      });
    },
  };
}
