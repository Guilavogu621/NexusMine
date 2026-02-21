import { createContext, useContext, useCallback } from 'react';
import { useNotificationWebSocket, useNotificationActions } from '../hooks/useNotificationWebSocket';

const NotificationContext = createContext(null);

/**
 * NotificationProvider - Contexte global pour les notifications
 * Fournit l'accès aux notifications et actions à tous les composants
 */
export function NotificationProvider({ children }) {
  const { isConnected, send, alerts, unreadCount } = useNotificationWebSocket({
    onAlert: (alert) => {
      console.log('Nouvelle alerte reçue:', alert);
    },
    onError: (error) => {
      console.error('Erreur notification:', error);
    },
  });

  const actions = useNotificationActions(send);

  const value = {
    isConnected,
    alerts,
    unreadCount,
    actions,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * useNotifications - Hook pour accéder au contexte des notifications
 * @returns {Object} {isConnected, alerts, unreadCount, actions}
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications doit être utilisé dans un NotificationProvider'
    );
  }
  return context;
}

/**
 * useNotificationActions - Alias pour récupérer les actions
 * @returns {Object} {dismiss, snooze, read, markAllRead, filter, updatePreferences}
 */
export function useNotificationActionsContext() {
  const { actions } = useNotifications();
  return actions;
}
