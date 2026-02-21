# 🔔 Système de Notifications WebSocket Amélioré

> Mise à jour complète du système de notifications NexusMine avec filtrage intelligent, déduplication, throttling, et préférences utilisateur.

## 📊 Vue d'ensemble

Ce système fournit une **couche de notifications en temps réel** pour tous les rôles NexusMine via WebSocket :

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Notification │  │ Preferences  │  │ Quick Panel  │   │
│  │   Center     │  │    Modal     │  │              │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│           ▲                ▲                 ▲            │
│           └────────────────┴─────────────────┘            │
│              WebSocket Connection (Real-time)            │
│           ▼                 ▼                 ▼            │
│  ┌──────────────────────────────────────────────────┐    │
│  │        Django Channels (ASGI Server)             │    │
│  │  ┌────────────────────────────────────────────┐  │    │
│  │  │  NotificationConsumer (WebSocket Handler)  │  │    │
│  │  │  - connect/disconnect                      │  │    │
│  │  │  - handle_dismiss/snooze/read              │  │    │
│  │  │  - handle_filter/update_preferences        │  │    │
│  │  └────────────────────────────────────────────┘  │    │
│  │  ┌────────────────────────────────────────────┐  │    │
│  │  │  Signals (Auto-processing)                 │  │    │
│  │  │  - Deduplication (5-min window)            │  │    │
│  │  │  - Cleanup (expiring alerts)               │  │    │
│  │  │  - Snooze reawakening                      │  │    │
│  │  └────────────────────────────────────────────┘  │    │
│  └──────────────────────────────────────────────────┘    │
│  │                                                        │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
            │
            ▼
    ┌────────────────┐
    │   Database     │
    │ (Alerts, Prefs)│
    └────────────────┘
```

---

## ✨ Fonctionnalités

### 🔍 Filtrage Intelligent
- Par **catégorie** (Sécurité, Opération, Maintenance, etc.)
- Par **gravité** (Critique, Élevée, Moyenne, Faible)
- Par **type d'alerte** (Incident, Avertissement, etc.)
- Par **site** de production

### 🔗 Déduplication
- **Génération automatique de clés** MD5 basée sur les attributs d'alerte
- **Fenêtre de 5 minutes** (configurable)
- Alertes identiques **archivées automatiquement**

### 🚦 Routage par Rôle
- Groupes WebSocket **par utilisateur** (user_123)
- Groupes WebSocket **par rôle** (role_SUPERVISOR)
- Notification **ciblée par permissions**

### ⏱️ Throttling
- Limites **par heure** (100 alertes/h par défaut)
- Limites **par jour** (500 alertes/jour par défaut)
- **Configurable par utilisateur**

### ⏸️ Actions Utilisateur
- **Marquer comme lu** (supprime du compteur)
- **Snooze** (15/30/60 min configurable)
- **Rejeter/Dismiss** (archive l'alerte)
- **Marquer tout comme lu**

### 📦 Groupement d'Alertes
- Grouper par **catégorie**
- Grouper par **site**
- **Collapsible groups** (déroulant/roulé)

### 🎯 Limites Intelligentes
- Auto-**expiration** des alertes (expires_at)
- **Snoozed alerts** reviennent après le timeout
- **Dismissed alerts** archivées automatiquement

### 👤 Préférences Utilisateur
- Catégories **habilitées/déshabilitées**
- Niveaux de gravité **filtrés**
- Options de **groupement**
- Durée de **snooze par défaut**
- Canaux de **notification** (email, push, SMS)

---

## 📁 Structure des Fichiers

```
backend/
├── alerts/
│   ├── models.py                      # Alert, UserNotificationPreferences
│   ├── consumers.py                   # NotificationConsumer WebSocket (NEW)
│   ├── signals.py                     # Dédup, cleanup, snooze (NEW)
│   ├── serializers.py                 # Sérialisation API (UPDATED)
│   ├── migrations/
│   │   └── 0002_add_notification_system.py  (NEW)
│   └── tests.py
├── nexus_backend/
│   ├── asgi.py                        # Configuration Channels (UPDATED)
│   ├── asgi_config.py                 # Routes WebSocket (NEW)
│   └── settings.py                    # (À mettre à jour)
└── requirements.txt                   # (UPDATED avec channels, daphne)

frontend/nexus-frontend/
├── src/
│   ├── components/
│   │   └── notifications/
│   │       ├── NotificationCenter.jsx           # Composant principal (NEW)
│   │       └── NotificationComponents.jsx       # Composants réutilisables (NEW)
│   ├── context/
│   │   └── NotificationContext.jsx              # Context global (NEW)
│   ├── hooks/
│   │   └── useNotificationWebSocket.js          # Hook WebSocket (NEW)
│   └── pages/
│       └── Dashboard.jsx              # Exemple d'intégration

docs/
├── INTEGRATION_WEBSOCKET.md           # Guide complet d'intégration (NEW)
├── TESTING_NOTIFICATIONS.md           # Guide de test (NEW)
└── ARCHITECTURE_NOTIFICATIONS.md      # (À créer)

QUICK_START_NOTIFICATIONS.sh           # Script setup automatisé (NEW)
```

---

## 🚀 Démarrage Rapide

### Option 1: Script Automatisé (Recommandé)

```bash
cd /home/guilavogui/django_home/NexusMine
chmod +x QUICK_START_NOTIFICATIONS.sh
./QUICK_START_NOTIFICATIONS.sh
```

### Option 2: Manuel

#### Backend
```bash
# Terminal 1
cd backend
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate alerts
daphne -b 0.0.0.0 -p 8000 nexus_backend.asgi:application
```

#### Frontend
```bash
# Terminal 2
cd frontend/nexus-frontend
npm install
npm run dev
```

---

## 🔧 Configuration Django

### settings.py

```python
INSTALLED_APPS = [
    'daphne',  # AVANT django.core.wsgi
    'django.contrib.admin',
    'django.contrib.auth',
    # ...
    'channels',
    'alerts',
]

# Django Channels
ASGI_APPLICATION = 'nexus_backend.asgi.application'

CHANNEL_LAYERS = {
    "default": {
        # Dev: InMemoryChannelLayer
        "BACKEND": "channels.layers.InMemoryChannelLayer",
        
        # Prod: RedisChannelLayer
        # "BACKEND": "channels_redis.core.RedisChannelLayer",
        # "CONFIG": {
        #     "hosts": [("127.0.0.1", 6379)],
        # },
    }
}

CORS_ALLOW_CREDENTIALS = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'yourdomain.com']
```

---

## 📱 Intégration Frontend

### 1. Envelopper l'application

```jsx
// src/main.jsx
import { NotificationProvider } from './context/NotificationContext';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <NotificationProvider>
    <App />
  </NotificationProvider>
);
```

### 2. Ajouter le composant principal

```jsx
// src/App.jsx
import NotificationCenter from './components/notifications/NotificationCenter';

export default function App() {
  return (
    <div>
      {/* Votre contenu */}
      <NotificationCenter />
    </div>
  );
}
```

### 3. Utiliser dans vos composants

```jsx
import { useNotifications } from './context/NotificationContext';

function MyComponent() {
  const { alerts, unreadCount, actions } = useNotifications();

  return (
    <div>
      <p>Alertes non lues: {unreadCount}</p>
      <button onClick={() => actions.markAllRead()}>Tout marquer comme lu</button>
    </div>
  );
}
```

---

## 📨 Format des Messages WebSocket

### Client → Serveur

**Dismiss (rejeter)**
```json
{ "action": "dismiss", "alert_id": 123 }
```

**Snooze**
```json
{ "action": "snooze", "alert_id": 123, "minutes": 30 }
```

**Read (marquer comme lu)**
```json
{ "action": "read", "alert_id": 123 }
```

**Filter**
```json
{
  "action": "filter",
  "filters": {
    "category": "SAFETY",
    "severity": ["CRITICAL", "HIGH"],
    "alert_type": "INCIDENT"
  }
}
```

**Update Preferences**
```json
{
  "action": "update_preferences",
  "preferences": {
    "enabled_categories": ["SAFETY", "OPERATIONAL"],
    "group_by_category": true,
    "default_snooze_minutes": 45
  }
}
```

### Serveur → Client

**Alert Notification**
```json
{
  "type": "alert_notification",
  "alert": {
    "id": 123,
    "title": "Équipement défaillant",
    "message": "L'excavatrice #5 a détecté une anomalie",
    "category": "SAFETY",
    "severity": "HIGH",
    "status": "NEW"
  }
}
```

---

## 🧪 Test WebSocket

```bash
# Installer wscat
npm install -g wscat

# Se connecter
wscat -c ws://localhost:8000/ws/notifications/

# Envoyer une action
{"action": "list"}

# Voir les alertes
```

---

## 📊 Modèles de Données

### Alert (Amélioré)

```python
class Alert(models.Model):
    # Existant
    title = CharField(max_length=255)
    message = TextField()
    alert_type = CharField(choices=[('INCIDENT', ...), ...])
    severity = CharField(choices=[('CRITICAL', ...), ...])
    status = CharField(choices=[('NEW', ...), ('DISMISSED', ...), ('SNOOZED', ...)])
    
    # NOUVEAU - Catégorisation
    category = CharField(
        choices=[
            ('OPERATIONAL', 'Opérationnel'),
            ('SAFETY', 'Sécurité'),
            ('MAINTENANCE', 'Maintenance'),
            ('ENVIRONMENTAL', 'Environnemental'),
            ('TECHNICAL', 'Technique'),
            ('ADMINISTRATIVE', 'Administratif'),
        ],
        default='OPERATIONAL',
        db_index=True
    )
    priority_order = IntegerField(default=0, db_index=True)
    
    # NOUVEAU - Actions utilisateur
    is_dismissed = BooleanField(default=False, db_index=True)
    dismissed_at = DateTimeField(null=True, blank=True)
    dismissed_by = ForeignKey(User, null=True, blank=True)
    
    # NOUVEAU - Expiration/Snooze
    expires_at = DateTimeField(null=True, blank=True, db_index=True)
    snoozed_until = DateTimeField(null=True, blank=True)
    
    # NOUVEAU - Déduplication
    dedupe_key = CharField(max_length=255, null=True, blank=True, db_index=True)
```

### UserNotificationPreferences (Nouveau)

```python
class UserNotificationPreferences(models.Model):
    user = OneToOneField(User)
    
    # Filtres
    enabled_categories = JSONField(default=list)
    enabled_severity_levels = JSONField(default=list)
    enabled_alert_types = JSONField(default=list)
    
    # Throttling
    max_alerts_per_hour = IntegerField(default=100)
    max_alerts_per_day = IntegerField(default=500)
    
    # Groupement
    group_by_category = BooleanField(default=True)
    group_by_site = BooleanField(default=False)
    
    # Canaux de notification
    email_on_critical = BooleanField(default=True)
    push_notifications = BooleanField(default=True)
    sms_on_critical = BooleanField(default=False)
    
    # UI
    default_snooze_minutes = IntegerField(default=30)
    alerts_per_page = IntegerField(default=20)
    
    def should_receive_alert(self, alert):
        """Vérifie si l'utilisateur devrait recevoir cette alerte"""
        # Implémentation du filtrage
```

---

## 🔐 Sécurité

- ✅ **Authentification WebSocket** via Django sessions/JWT
- ✅ **Autorisation par rôle** via groupes Channels
- ✅ **CORS** via `AllowedHostsOriginValidator`
- ✅ **Rate limiting** via préférences d'utilisateur
- ✅ **Audit trail** via `dismissed_by` field

---

## 📖 Documentation

| Fichier | Description |
|---------|-------------|
| [INTEGRATION_WEBSOCKET.md](./docs/INTEGRATION_WEBSOCKET.md) | Guide d'intégration complet |
| [TESTING_NOTIFICATIONS.md](./docs/TESTING_NOTIFICATIONS.md) | Tests unitaires et d'intégration |
| [ARCHITECTURE_NOTIFICATIONS.md](./docs/ARCHITECTURE_NOTIFICATIONS.md) | Architecture détaillée (à créer) |

---

## 🎯 Checklist de Déploiement

- [ ] Installer dépendances backend (`pip install channels daphne`)
- [ ] Exécuter migrations (`python manage.py migrate alerts`)
- [ ] Configurer Django settings (ASGI_APPLICATION, CHANNEL_LAYERS)
- [ ] Tester WebSocket local (`wscat`)
- [ ] Envelopper l'app frontend avec NotificationProvider
- [ ] Ajouter NotificationCenter au layout
- [ ] Tester actions (dismiss, snooze, read)
- [ ] Configurer Daphne pour production
- [ ] Configurer Redis pour production (si scalabilité)
- [ ] Mettre en place monitoring
- [ ] Créer alertes de test

---

## 🐛 Troubleshooting

### WebSocket ne se connecte pas
```
Vérifier:
1. Daphne/ASGI tourne
2. Console du navigateur pour erreurs
3. ALLOWED_HOSTS en settings
4. Logs Django en DEBUG
```

### Alertes doublons
```
Vérifier:
1. Signal de déduplication activé
2. dedupe_key généré correctement
3. Fenêtre 5-min non expirée
```

### Alertes manquent
```
Vérifier:
1. Préférences utilisateur (filtres)
2. Throttling limits (per_hour, per_day)
3. Permissions de rôle
```

---

## 📞 Support

Pour des questions ou issues:
1. Voir la documentation (links ci-dessus)
2. Vérifier les logs: `python manage.py tail alerts`
3. Tester avec `wscat` directement

---

## 📝 Changelog

### Phase 2 - Notifications (Actuelle)
- ✅ Système WebSocket complet
- ✅ Filtrage intelligent
- ✅ Déduplication
- ✅ Préférences utilisateur
- ✅ Actions utilisateur (dismiss, snooze, read)
- ✅ Composants React réutilisables
- ✅ Documentation complète

### Phase 1 - Validation des Dates (Précédent)
- ✅ DateRangeInput component
- ✅ Django validators
- ✅ Model cleanups

---

## 📜 License

Voir PROJECT_LICENSE pour les détails
