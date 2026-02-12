# NexusMine Mobile — Application terrain

Application mobile Flutter réservée aux **ingénieurs terrain (OPERATOR)** de NexusMine.

> **Qui utilise cette app ?** Uniquement l'ingénieur sur le terrain.
> Tous les autres rôles (ADMIN, SITE_MANAGER, SUPERVISOR, ANALYST, MMG) utilisent l'**application web** React.

---

## 📱 Fonctionnalités terrain

| Module | Actions |
|--------|---------|
| **Opérations** | Créer, consulter, modifier les opérations d'extraction |
| **Incidents** | Signaler un incident, joindre une photo, suivre le statut |
| **Équipements** | Consulter l'état des machines, signaler une panne |
| **Environnement** | Saisir les relevés air / eau / bruit |
| **Stock** | Enregistrer les mouvements de minerai (chargement, expédition) |
| **Alertes** | Recevoir et consulter les alertes critiques |
| **Profil** | Voir ses infos, sites assignés, se déconnecter |

L'ingénieur terrain a le droit de **créer** des opérations, incidents, relevés environnementaux et mouvements de stock directement depuis son téléphone.

### Ce qui n'est PAS dans l'app mobile

Les fonctions suivantes sont uniquement disponibles sur le **web** :
- Gestion des sites miniers
- Indicateurs / KPI / Analytics
- Rapports (génération, validation)
- Gestion du personnel
- Administration des utilisateurs et des rôles

---

## 🚀 Installation

### Prérequis
- Flutter SDK 3.0+
- Android Studio / Xcode
- Backend NexusMine en cours d'exécution (`python manage.py runserver 0.0.0.0:8000`)

### Configuration

1. **Cloner et installer les dépendances**
```bash
cd mobile/nexusmine_mobile
flutter pub get
```

2. **Configurer l'URL de l'API**

Modifier `lib/core/constants/api_constants.dart` :
```dart
// Pour émulateur Android
static const String baseUrl = 'http://10.0.2.2:8000/api';

// Pour simulateur iOS / web
static const String baseUrl = 'http://localhost:8000/api';

// Pour appareil physique (remplacer par l'IP de votre machine)
static const String baseUrl = 'http://192.168.1.X:8000/api';
```

3. **Lancer l'application**
```bash
flutter run              # appareil par défaut
flutter run -d chrome    # navigateur web (debug)
flutter run --release    # mode release
```

---

## 📁 Structure du projet

```
lib/
├── main.dart                 # Point d'entrée
├── app.dart                  # Configuration MaterialApp + thème
├── core/
│   ├── constants/            # API endpoints, couleurs, config
│   ├── network/              # Client HTTP Dio + intercepteur JWT
│   └── storage/              # Stockage sécurisé (tokens)
├── features/
│   ├── auth/                 # Login, AuthProvider, JWT
│   ├── home/                 # Dashboard terrain (6 modules)
│   ├── operations/           # CRUD opérations d'extraction
│   ├── incidents/            # Signalement / suivi incidents
│   ├── equipment/            # Consultation équipements
│   ├── environment/          # Relevés environnementaux
│   ├── stock/                # Mouvements stock minerai
│   ├── alerts/               # Alertes & notifications
│   └── profile/              # Profil utilisateur
├── router/                   # GoRouter — navigation
└── shared/
    ├── models/               # Modèles de données Dart
    └── widgets/              # Widgets réutilisables
```

---

## 🔧 Stack technique

| Catégorie | Package |
|-----------|---------|
| State management | flutter_riverpod |
| Navigation | go_router |
| HTTP client | dio |
| Stockage sécurisé | flutter_secure_storage |
| Géolocalisation | geolocator |
| Caméra | image_picker |
| Formulaires | reactive_forms |

---

## 🔗 API backend consommée

L'app se connecte au backend Django via SimpleJWT :

| Endpoint | Description |
|----------|-------------|
| `POST /api/token/` | Obtenir un access + refresh token |
| `POST /api/token/refresh/` | Rafraîchir le token |
| `GET /api/users/me/` | Profil utilisateur connecté |
| `GET/POST /api/operations/` | Opérations minières |
| `GET/POST /api/incidents/` | Incidents terrain |
| `GET /api/equipment/` | Équipements |
| `GET/POST /api/environmental-data/` | Relevés environnementaux |
| `GET/POST /api/stock-movements/` | Mouvements de stock |
| `GET /api/stock-locations/` | Emplacements de stock |
| `GET /api/stock-summary/` | Synthèse stock |
| `GET /api/alerts/` | Alertes |
| `POST /api/chatbot/` | NexusMine Copilot (chatbot IA) |

---

## 🛠️ Commandes utiles

```bash
flutter pub get            # Installer les dépendances
flutter analyze            # Vérifier le code
flutter test               # Lancer les tests
flutter build apk --release  # Build APK Android
flutter build ios --release   # Build iOS
flutter build web            # Build web
```

---

## 📄 Licence

Propriétaire — NexusMine © 2024-2026
