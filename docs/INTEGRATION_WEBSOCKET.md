# Guide d'Intégration - Système de Notifications WebSocket

## 🎯 Vue d'ensemble

Ce guide vous aide à intégrer le système de notifications WebSocket amélioré dans votre application NexusMine.

---

## 📋 Prérequis

```bash
# Backend
pip install channels==4.0.0
pip install channels-redis==4.1.0  # Pour la couche de messages en production

# Frontend (déjà inclus)
# React 17+, Heroicons React, Tailwind CSS
```

---

## 🔧 Configuration Django

### 1. Mise à jour de settings.py

```python
# nexus_backend/settings.py

INSTALLED_APPS = [
    'daphne',  # Ajouter AVANT django.core.wsgi
    'django.contrib.admin',
    'django.contrib.auth',
    # ... autres apps
    'channels',
    'alerts',  # ou votre app de notifications
]

# Django Channels
ASGI_APPLICATION = 'nexus_backend.asgi.application'

CHANNEL_LAYERS = {
    "default": {
        # En développement: InMemoryChannelLayer
        "BACKEND": "channels.layers.InMemoryChannelLayer",
        
        # En production: RedisChannelLayer
        # "BACKEND": "channels_redis.core.RedisChannelLayer",
        # "CONFIG": {
        #     "hosts": [("127.0.0.1", 6379)],
        # },
    }
}

# CORS WebSocket (si nécessaire)
CORS_ALLOW_CREDENTIALS = True
```

### 2. Configuration ASGI (déjà faite - asgi.py)

L'application ASGI est configurée pour supporter HTTP et WebSocket.

### 3. Exécuter les migrations

```bash
cd backend
python manage.py makemigrations alerts
python manage.py migrate alerts
```

---

## 🎨 Intégration Frontend

### 1. Envelopper l'application avec NotificationProvider

```jsx
// src/main.jsx ou src/App.jsx

import { NotificationProvider } from './context/NotificationContext';
import NotificationCenter from './components/notifications/NotificationCenter';

export default function App() {
  return (
    <NotificationProvider>
      <div className="app">
        {/* Votre contenu */}
        
        {/* Ajouter le NotificationCenter n'importe où */}
        <NotificationCenter />
      </div>
    </NotificationProvider>
  );
}
```

### 2. Utiliser les composants de notification

#### Badge simple dans la navigation

```jsx
import { NotificationBadge, NotificationIcon } from './components/notifications/NotificationComponents';
import { useState } from 'react';

function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <nav className="flex items-center gap-4">
      <button onClick={() => setShowNotifications(!showNotifications)} className="relative">
        <NotificationIcon onClick={() => setShowNotifications(!showNotifications)} />
        <NotificationBadge />
      </button>
    </nav>
  );
}
```

#### Panneau rapide

```jsx
import { QuickNotificationPanel } from './components/notifications/NotificationComponents';

function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <QuickNotificationPanel />
      {/* autres composants */}
    </div>
  );
}
```

### 3. Utiliser le hook directement

```jsx
import { useNotifications } from './context/NotificationContext';

function MyComponent() {
  const { alerts, unreadCount, actions, isConnected } = useNotifications();

  return (
    <div>
      <p>Alertes non lues: {unreadCount}</p>
      <button onClick={() => actions.markAllRead()}>Tout marquer comme lu</button>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div key={alert.id} className="p-3 border rounded">
            <h4>{alert.title}</h4>
            <p>{alert.message}</p>
            <button onClick={() => actions.dismiss(alert.id)}>Rejeter</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🚀 Lancer l'application

### Développement

```bash
# Terminal 1 - Backend (avec Daphne)
cd backend
source .venv/bin/activate
daphne -b 0.0.0.0 -p 8000 nexus_backend.asgi:application

# Terminal 2 - Frontend
cd frontend/nexus-frontend
npm run dev
```

### Production

```bash
# Utiliser Gunicorn + Daphne ou autre serveur ASGI
pip install gunicorn
gunicorn -b 0.0.0.0:8000 -w 4 -k uvicorn.workers.UvicornWorker nexus_backend.wsgi:application
```

---

## 📨 Format des Messages WebSocket

### Client → Serveur (Actions)

#### Dismiss (rejeter une alerte)
```json
{
  "action": "dismiss",
  "alert_id": 123
}
```

#### Snooze (mettre en pause)
```json
{
  "action": "snooze",
  "alert_id": 123,
  "minutes": 30
}
```

#### Read (marquer comme lu)
```json
{
  "action": "read",
  "alert_id": 123
}
```

#### Mark All Read
```json
{
  "action": "mark_all_read"
}
```

#### Filter (appliquer des filtres)
```json
{
  "action": "filter",
  "filters": {
    "category": "SAFETY",
    "severity": ["CRITICAL", "HIGH"],
    "alert_type": "INCIDENT",
    "site_id": 5
  }
}
```

#### Update Preferences
```json
{
  "action": "update_preferences",
  "preferences": {
    "enabled_categories": ["SAFETY", "OPERATIONAL"],
    "enabled_severity_levels": ["CRITICAL", "HIGH"],
    "group_by_category": true,
    "group_by_site": false,
    "default_snooze_minutes": 45,
    "alerts_per_page": 25,
    "email_on_critical": true,
    "push_notifications": true
  }
}
```

### Serveur → Client (Messages)

#### Nouvelle alerte
```json
{
  "type": "alert_notification",
  "alert": {
    "id": 123,
    "title": "Équipement défaillant",
    "message": "L'excavatrice #5 a détecté une anomalie",
    "category": "SAFETY",
    "severity": "HIGH",
    "status": "NEW",
    "site": "Site Principal",
    "generated_at": "2024-01-15T14:30:00Z"
  }
}
```

#### Liste d'alertes
```json
{
  "type": "alerts_list",
  "alerts": [
    { "id": 123, "title": "...", ... },
    { "id": 124, "title": "...", ... }
  ]
}
```

#### Succès
```json
{
  "type": "success",
  "message": "Alerte marquée comme lue"
}
```

#### Erreur
```json
{
  "type": "error",
  "message": "Alerte non trouvée"
}
```

---

## 🧪 Test WebSocket (avec wscat)

```bash
# Installer wscat
npm install -g wscat

# Se connecter
wscat -c ws://localhost:8000/ws/notifications/

# Envoyer un message
{"action": "list"}

# Recevoir les alertes
```

---

## 🔐 Sécurité

### Authentification

Le consumer WebSocket utilise `AuthMiddlewareStack`, donc l'utilisateur doit être authentifié via les cookies Django.

### CORS WebSocket

Les origines autorisées sont contrôlées par `AllowedHostsOriginValidator` basé sur `ALLOWED_HOSTS`.

```python
# settings.py
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'example.com']
```

---

## 📊 Architecture

```
Frontend
├── NotificationCenter (composant principal)
├── NotificationComponents (composants réutilisables)
├── context/NotificationContext (contexte global)
└── hooks/useNotificationWebSocket (gestion WebSocket)

Backend
├── alerts/models.py (Alert, UserNotificationPreferences)
├── alerts/consumers.py (NotificationConsumer WebSocket)
├── alerts/signals.py (déduplication, cleanup)
├── alerts/serializers.py (sérialisation API)
└── asgi.py (routage WebSocket)
```

---

## 🐛 Dépannage

### WebSocket ne se connecte pas

```python
# Vérifier les logs Django
# Vérifier que Daphne/ASGI est lancé
# Vérifier CORS: ALLOWED_HOSTS
# Vérifier la console du navigateur pour les erreurs
```

### Alertes non reçues

```python
# Vérifier que le signal est déclenché
# Vérifier la base de données
# Vérifier les logs du consumer
```

### Alertes en double

```python
# Vérifier que le signal de déduplication fonctionne
# Vérifier la génération de dedupe_key
# Vérifier les logs des signaux
```

---

## 📝 Exemple Complet

```jsx
// pages/Dashboard.jsx
import { useState } from 'react';
import NotificationCenter from '../components/notifications/NotificationCenter';
import { useNotifications } from '../context/NotificationContext';

export default function Dashboard() {
  const { alerts, unreadCount, isConnected } = useNotifications();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">NexusMine Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? '🟢 Connecté' : '🔴 Déconnecté'}
            </span>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Métrique d'alertes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Alertes non lues</h3>
            <p className="text-3xl font-bold text-indigo-600">{unreadCount}</p>
          </div>

          {/* Total d'alertes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Total d'alertes</h3>
            <p className="text-3xl font-bold text-slate-600">{alerts.length}</p>
          </div>

          {/* Statut de connexion */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Statut</h3>
            <p className="text-lg font-semibold">
              {isConnected ? '✅ WebSocket Actif' : '❌ Déconnecté'}
            </p>
          </div>
        </div>
      </main>

      {/* Centre de notifications (fixe en bas à droite) */}
      <NotificationCenter />
    </div>
  );
}
```

---

## 📖 Références

- [Django Channels Documentation](https://channels.readthedocs.io/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Hooks](https://react.dev/reference/react)
- [Tailwind CSS](https://tailwindcss.com/)

