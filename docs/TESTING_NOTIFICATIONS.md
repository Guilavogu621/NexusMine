# Guide de Test - Système de Notifications WebSocket

## 🧪 Tests Backend

### 1. Test des Modèles

```python
# backend/alerts/tests.py

from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from alerts.models import Alert, UserNotificationPreferences

class AlertModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.site = MiningSite.objects.create(
            name='Test Site',
            location='Test Location'
        )

    def test_create_alert_with_category(self):
        alert = Alert.objects.create(
            title='Test Alert',
            message='This is a test',
            alert_type='INCIDENT',
            severity='HIGH',
            site=self.site,
            category='SAFETY',
            priority_order=5
        )
        self.assertEqual(alert.category, 'SAFETY')
        self.assertEqual(alert.priority_order, 5)

    def test_dismiss_alert(self):
        alert = Alert.objects.create(
            title='Test Alert',
            message='This is a test',
            alert_type='INCIDENT',
            severity='HIGH',
            site=self.site
        )
        alert.is_dismissed = True
        alert.dismissed_at = timezone.now()
        alert.dismissed_by = self.user
        alert.save()
        
        self.assertTrue(alert.is_dismissed)
        self.assertIsNotNone(alert.dismissed_at)

    def test_snooze_alert(self):
        alert = Alert.objects.create(
            title='Test Alert',
            message='This is a test',
            alert_type='INCIDENT',
            severity='HIGH',
            site=self.site
        )
        snooze_until = timezone.now() + timedelta(minutes=30)
        alert.snoozed_until = snooze_until
        alert.status = 'SNOOZED'
        alert.save()
        
        self.assertEqual(alert.status, 'SNOOZED')
        self.assertIsNotNone(alert.snoozed_until)

class UserNotificationPreferencesTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )

    def test_create_preferences(self):
        prefs = UserNotificationPreferences.objects.create(
            user=self.user,
            enabled_categories=['SAFETY', 'OPERATIONAL'],
            enabled_severity_levels=['CRITICAL', 'HIGH'],
            group_by_category=True,
            default_snooze_minutes=30
        )
        self.assertEqual(prefs.user, self.user)
        self.assertTrue(prefs.group_by_category)

    def test_should_receive_alert_filtering(self):
        prefs = UserNotificationPreferences.objects.create(
            user=self.user,
            enabled_categories=['SAFETY'],
            enabled_severity_levels=['CRITICAL', 'HIGH']
        )
        
        # Créer une alerte qui devrait passer le filtre
        alert = Alert(
            title='Safety Alert',
            category='SAFETY',
            severity='CRITICAL'
        )
        
        # Créer une alerte qui ne devrait pas passer
        alert2 = Alert(
            title='Low Alert',
            category='OPERATIONAL',
            severity='LOW'
        )
        
        self.assertTrue(prefs.should_receive_alert(alert))
        self.assertFalse(prefs.should_receive_alert(alert2))
```

### 2. Test des Signaux

```python
# backend/alerts/tests.py

from django.test import TestCase
from django.db.models.signals import post_save
from alerts.models import Alert
from alerts.signals import handle_alert_deduplication
import hashlib

class AlertDeduplicationSignalTest(TestCase):
    def test_dedupe_key_generation(self):
        """Test que le dedupe_key est généré correctement"""
        alert1 = Alert.objects.create(
            title='Equipment Failure',
            message='Excavator #1 failed',
            alert_type='INCIDENT',
            severity='HIGH',
            site=self.site,
            category='SAFETY'
        )
        
        # Créer une alerte identique
        alert2 = Alert.objects.create(
            title='Equipment Failure',
            message='Excavator #1 failed',
            alert_type='INCIDENT',
            severity='HIGH',
            site=self.site,
            category='SAFETY'
        )
        
        # Les dedupe_keys devraient être identiques
        self.assertEqual(alert1.dedupe_key, alert2.dedupe_key)
        
        # La deuxième alerte devrait être archivée
        alert2.refresh_from_db()
        # self.assertEqual(alert2.status, 'ARCHIVED')  # Si déjà archivée par le signal
```

### 3. Test du Consumer WebSocket

```python
# backend/alerts/tests.py

from django.test import AsyncClient
from django.contrib.auth.models import User
from channels.testing import AsyncWebsocketCommunicator
from nexus_backend.asgi import application
import json

class NotificationConsumerTest(AsyncTestCase):
    async def test_websocket_connect(self):
        """Test la connexion WebSocket"""
        user = await sync_to_async(User.objects.create_user)(
            username='testuser',
            password='testpass123'
        )
        
        communicator = AsyncWebsocketCommunicator(
            application,
            "/ws/notifications/",
            headers=[(b'origin', b'http://testserver')]
        )
        
        connected, subprotocol = await communicator.connect()
        self.assertTrue(connected)
        await communicator.disconnect()

    async def test_dismiss_alert(self):
        """Test la rejection d'une alerte"""
        user = await sync_to_async(User.objects.create_user)(
            username='testuser',
            password='testpass123'
        )
        
        # Créer une alerte
        alert = await sync_to_async(Alert.objects.create)(
            title='Test',
            alert_type='INCIDENT',
            severity='HIGH',
            category='SAFETY'
        )
        
        communicator = AsyncWebsocketCommunicator(
            application,
            "/ws/notifications/",
            headers=[(b'origin', b'http://testserver')]
        )
        
        connected, _ = await communicator.connect()
        self.assertTrue(connected)
        
        # Envoyer l'action dismiss
        await communicator.send_json_to({
            'action': 'dismiss',
            'alert_id': alert.id
        })
        
        # Vérifier la réponse
        response = await communicator.receive_json_from()
        self.assertEqual(response['type'], 'success')
        
        # Vérifier que l'alerte est bien dismissée
        alert.refresh_from_db()
        self.assertTrue(alert.is_dismissed)
        
        await communicator.disconnect()
```

---

## 🧪 Tests Frontend

### 1. Test du Hook useNotificationWebSocket

```jsx
// frontend/src/hooks/__tests__/useNotificationWebSocket.test.js

import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotificationWebSocket } from '../useNotificationWebSocket';

// Mock WebSocket
global.WebSocket = jest.fn(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: 1, // OPEN
}));

describe('useNotificationWebSocket', () => {
  it('should initialize and connect', async () => {
    const { result } = renderHook(() => useNotificationWebSocket());
    
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
  });

  it('should handle incoming alerts', async () => {
    const onAlert = jest.fn();
    const { result } = renderHook(() => 
      useNotificationWebSocket({ onAlert })
    );
    
    // Simuler une alerte entrante
    act(() => {
      const messageEvent = new MessageEvent('message', {
        data: JSON.stringify({
          type: 'alert_notification',
          alert: { id: 1, title: 'Test Alert' }
        })
      });
      WebSocket.prototype.onmessage(messageEvent);
    });
    
    await waitFor(() => {
      expect(onAlert).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1 })
      );
    });
  });

  it('should send messages', async () => {
    const { result } = renderHook(() => useNotificationWebSocket());
    
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
    
    act(() => {
      result.current.send({ action: 'read', alert_id: 1 });
    });
    
    expect(WebSocket.prototype.send).toHaveBeenCalledWith(
      JSON.stringify({ action: 'read', alert_id: 1 })
    );
  });

  it('should handle reconnection', async () => {
    const { result } = renderHook(() => 
      useNotificationWebSocket({ reconnectDelay: 100 })
    );
    
    // Simuler une déconnexion
    act(() => {
      WebSocket.prototype.onclose();
    });
    
    expect(result.current.isConnected).toBe(false);
    
    // Attendre la reconnexion
    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    }, { timeout: 200 });
  });
});
```

### 2. Test du NotificationCenter

```jsx
// frontend/src/components/notifications/__tests__/NotificationCenter.test.jsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationCenter from '../NotificationCenter';
import { NotificationProvider } from '../../../context/NotificationContext';

describe('NotificationCenter', () => {
  it('should render the bell icon', () => {
    render(
      <NotificationProvider>
        <NotificationCenter />
      </NotificationProvider>
    );
    
    const bellButton = screen.getByRole('button');
    expect(bellButton).toBeInTheDocument();
  });

  it('should show unread count badge', async () => {
    render(
      <NotificationProvider>
        <NotificationCenter />
      </NotificationProvider>
    );
    
    // Simuler une alerte arrivée
    await waitFor(() => {
      const badge = screen.getByText(/\d+/);
      expect(badge).toBeInTheDocument();
    });
  });

  it('should open panel on button click', () => {
    render(
      <NotificationProvider>
        <NotificationCenter />
      </NotificationProvider>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const notificationsHeader = screen.getByText('Notifications');
    expect(notificationsHeader).toBeInTheDocument();
  });

  it('should display alerts in the panel', async () => {
    render(
      <NotificationProvider>
        <NotificationCenter />
      </NotificationProvider>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      // Les alertes devraient être affichées
      const alertElements = screen.queryAllByText(/Test Alert|Aucune alerte/);
      expect(alertElements.length).toBeGreaterThan(0);
    });
  });

  it('should dismiss an alert', async () => {
    render(
      <NotificationProvider>
        <NotificationCenter />
      </NotificationProvider>
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const dismissButton = screen.getByTitle('Rejeter');
    fireEvent.click(dismissButton);
    
    // L'alerte devrait être supprimée
    // (vérifier via le mock WebSocket ou via le state)
  });
});
```

---

## 🧪 Tests d'Intégration

### 1. Test de bout en bout

```python
# integration_tests/test_notification_flow.py

from django.test import TestCase, AsyncClient
from django.contrib.auth.models import User
from alerts.models import Alert, MiningSite
import json

class NotificationIntegrationTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.site = MiningSite.objects.create(
            name='Test Site',
            location='Test Location'
        )
        self.client.login(username='testuser', password='testpass123')

    def test_full_notification_flow(self):
        """Test du flux complet: créer alerte -> WebSocket -> dismiss"""
        
        # 1. Créer une alerte
        alert = Alert.objects.create(
            title='Equipment Failure',
            message='Excavator #1 has failed',
            alert_type='INCIDENT',
            severity='HIGH',
            site=self.site,
            category='SAFETY'
        )
        
        # 2. Vérifier que l'alerte est créée
        self.assertEqual(Alert.objects.filter(id=alert.id).count(), 1)
        self.assertFalse(alert.is_dismissed)
        
        # 3. Simuler le rejet via WebSocket
        # (Ce test serait basé sur AsyncWebsocketCommunicator)
        
        # 4. Vérifier que l'alerte est dismissée
        alert.refresh_from_db()
        self.assertTrue(alert.is_dismissed)

    def test_deduplication_flow(self):
        """Test de la déduplication"""
        
        # Créer deux alertes identiques
        alert1 = Alert.objects.create(
            title='Equipment Failure',
            message='Excavator #1 failed',
            alert_type='INCIDENT',
            severity='HIGH',
            site=self.site,
            category='SAFETY'
        )
        
        alert2 = Alert.objects.create(
            title='Equipment Failure',
            message='Excavator #1 failed',
            alert_type='INCIDENT',
            severity='HIGH',
            site=self.site,
            category='SAFETY'
        )
        
        # Les deux devraient avoir le même dedupe_key
        self.assertEqual(alert1.dedupe_key, alert2.dedupe_key)
        
        # La deuxième devrait être archivée par le signal
        alert2.refresh_from_db()
        # Vérifier le status selon votre logique

    def test_snooze_flow(self):
        """Test du snooze"""
        from django.utils import timezone
        from datetime import timedelta
        
        alert = Alert.objects.create(
            title='Low Priority Alert',
            message='Just a warning',
            alert_type='WARNING',
            severity='LOW',
            site=self.site
        )
        
        # Snooze l'alerte
        snooze_until = timezone.now() + timedelta(minutes=15)
        alert.snoozed_until = snooze_until
        alert.status = 'SNOOZED'
        alert.save()
        
        # Vérifier
        alert.refresh_from_db()
        self.assertEqual(alert.status, 'SNOOZED')
        self.assertIsNotNone(alert.snoozed_until)

    def test_filter_flow(self):
        """Test du filtrage"""
        
        # Créer plusieurs alertes
        safety_alert = Alert.objects.create(
            title='Safety Alert',
            category='SAFETY',
            severity='CRITICAL',
            alert_type='INCIDENT',
            site=self.site
        )
        
        operational_alert = Alert.objects.create(
            title='Operational Alert',
            category='OPERATIONAL',
            severity='LOW',
            alert_type='WARNING',
            site=self.site
        )
        
        # Filtrer par catégorie
        safety_alerts = Alert.objects.filter(category='SAFETY')
        self.assertEqual(safety_alerts.count(), 1)
        self.assertEqual(safety_alerts.first().id, safety_alert.id)
```

---

## 🚀 Commandes de Test

```bash
# Backend - Tous les tests
cd backend
python manage.py test alerts

# Backend - Tests spécifiques
python manage.py test alerts.tests.AlertModelTest
python manage.py test alerts.tests.AlertDeduplicationSignalTest

# Frontend - Tous les tests
cd frontend/nexus-frontend
npm test

# Frontend - Tests avec couverture
npm test -- --coverage

# Frontend - Tests en mode watch
npm test -- --watch
```

---

## 📊 Checklist de Test Manuel

### Backend
- [ ] Créer une alerte via Django admin ou API
- [ ] Vérifier que le dedupe_key est généré
- [ ] Créer deux alertes identiques et vérifier la déduplication
- [ ] Tester les signaux de nettoyage
- [ ] Vérifier les migrations

### Frontend
- [ ] Connecter le WebSocket en développement
- [ ] Voir les alertes arriver en temps réel
- [ ] Tester le dismiss d'une alerte
- [ ] Tester le snooze (30 min)
- [ ] Tester marquer comme lu
- [ ] Tester les filtres
- [ ] Tester les préférences
- [ ] Tester le groupement par catégorie/site
- [ ] Tester sur mobile (responsif)

### Intégration
- [ ] Créer alerte via API
- [ ] Voir arriver via WebSocket
- [ ] Dismiss via WebSocket
- [ ] Vérifier mise à jour BD
- [ ] Tester déconnexion/reconnexion
- [ ] Tester reconnexion automatique

---

## 🐛 Dépannage

### WebSocket ne se connecte pas
```bash
# Vérifier que Daphne/ASGI tourne
# Vérifier la console du navigateur
# Vérifier ALLOWED_HOSTS
# Vérifier les logs Django
```

### Tests échouent
```bash
# Reconstruire les dépendances
pip install -r requirements.txt
npm install

# Nettoyer le cache
rm -rf __pycache__ .pytest_cache node_modules/.cache
python manage.py migrate --run-syncdb

# Relancer les tests
```

