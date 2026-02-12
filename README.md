# 🏔️ NexusMine

**Plateforme d'intelligence minière pour la Guinée et l'Afrique**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.12+-green)
![Django](https://img.shields.io/badge/django-4.2.27-green)
![React](https://img.shields.io/badge/react-19.2-blue)
![Flutter](https://img.shields.io/badge/flutter-3.x-blue)

---

## 📋 Description

NexusMine est une solution complète de gestion des opérations minières permettant de :

- 🏭 **Gérer les sites miniers** — Localisation, production, statut
- 👷 **Suivre le personnel** — Employés, postes, qualifications
- 🔧 **Monitorer les équipements** — Machines, maintenance, état
- ⛏️ **Planifier les opérations** — Production journalière, équipes, zones de travail
- 🚨 **Gérer les incidents** — Sécurité, accidents, suivi, photos
- 🌿 **Surveiller l'environnement** — Qualité air/eau/bruit, seuils, rapports
- 🔔 **Recevoir des alertes** — Seuils intelligents, notifications temps réel
- 📊 **Analyser les KPIs** — Tableaux de bord, intelligence prédictive, scores de risque
- 📄 **Générer des rapports** — PDF/Excel, approbation OPERATOR, validation manager
- 📦 **Gérer le stock** — Mouvements de minerai, emplacements, synthèse
- 🤖 **Chatbot IA** — NexusMine Copilot avec données temps réel de la base

---

## 🚀 Démarrage rapide

### Prérequis

- Python 3.12+
- Node.js 18+
- Flutter SDK 3.0+
- SQLite (par défaut) ou PostgreSQL 14+

### Installation

```bash
# 1. Cloner le projet
git clone https://github.com/votre-repo/NexusMine.git
cd NexusMine

# 2. Backend (terminal 1)
cd backend
python -m venv .venv
source .venv/bin/activate        # Linux/Mac
# .venv\Scripts\activate         # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000

# 3. Frontend web (terminal 2)
cd frontend/nexus-frontend
npm install
npm run dev

# 4. Application mobile (terminal 3)
cd mobile/nexusmine_mobile
flutter pub get
flutter run              # appareil par défaut
flutter run -d chrome    # navigateur web (debug)
```

### URLs

| Service | URL |
|---------|-----|
| Frontend web | http://localhost:5174 |
| Backend API | http://localhost:8000/api/ |
| Admin Django | http://localhost:8000/admin/ |
| Mobile (web debug) | http://localhost:PORT (affiché par flutter run) |

---

## 🏗️ Architecture

```
NexusMine/
├── backend/                  # Django 4.2 REST API
│   ├── accounts/             # Utilisateurs, Auth, RBAC (6 rôles)
│   ├── mining_sites/         # Sites miniers
│   ├── personnel/            # Personnel & effectifs
│   ├── equipment/            # Équipements & maintenance
│   ├── operations/           # Opérations, zones de travail, shifts
│   ├── incidents/            # Incidents & sécurité (photos)
│   ├── environment/          # Données environnementales & seuils
│   ├── alerts/               # Alertes & règles d'alerte
│   ├── stock/                # Stock minerai (emplacements, mouvements)
│   ├── reports/              # Rapports (PDF/Excel, approbation)
│   ├── analytics/            # Indicateurs KPI, dashboard, intelligence IA
│   └── nexus_backend/        # Settings, URLs, chatbot IA
├── frontend/
│   └── nexus-frontend/       # React 19 + Vite + Tailwind 4 (app web)
├── mobile/
│   └── nexusmine_mobile/     # Flutter + Riverpod (app terrain OPERATOR)
└── docs/                     # Documentation
```

---

## 📱 Répartition Web / Mobile

| Plateforme | Utilisateurs | Modules |
|------------|-------------|---------|
| **Web** (React) | ADMIN, SITE_MANAGER, SUPERVISOR, ANALYST, MMG | Tous les modules : sites, personnel, opérations, incidents, équipements, environnement, stock, rapports, analytics, alertes, chatbot IA, administration |
| **Mobile** (Flutter) | **OPERATOR** (ingénieur terrain) | 6 modules terrain : opérations, incidents, équipements, environnement, stock, alertes + profil |

> L'app mobile est conçue exclusivement pour l'ingénieur sur le terrain. Les fonctions de gestion (rapports, analytics, personnel, sites, admin) sont accessibles uniquement via le web.

---

## 🔐 Rôles utilisateur (RBAC)

| Rôle | Plateforme | Permissions |
|------|-----------|-------------|
| **ADMIN** | Web | Accès total, gestion utilisateurs, configuration système |
| **SITE_MANAGER** | Web | Gestion de son site, personnel, opérations, validation rapports |
| **SUPERVISOR** | Web | Supervision opérations, incidents, équipements, validation rapports terrain |
| **OPERATOR** | **Mobile** | Saisie terrain : opérations, incidents, environnement, stock (rapports soumis à approbation) |
| **ANALYST** | Web | Rapports, KPIs, intelligence prédictive |
| **MMG** | Web | Lecture seule sur tous les sites (autorité ministérielle) |

---

## 🔗 API Endpoints principaux

| Endpoint | Description |
|----------|-------------|
| `POST /api/token/` | Authentification JWT |
| `POST /api/token/refresh/` | Rafraîchir le token |
| `GET /api/users/me/` | Profil utilisateur connecté |
| `CRUD /api/sites/` | Sites miniers |
| `CRUD /api/personnel/` | Personnel |
| `CRUD /api/equipment/` | Équipements |
| `CRUD /api/maintenance/` | Historique maintenance |
| `CRUD /api/operations/` | Opérations minières |
| `CRUD /api/incidents/` | Incidents |
| `CRUD /api/environmental-data/` | Relevés environnementaux |
| `CRUD /api/alerts/` | Alertes |
| `CRUD /api/reports/` | Rapports (+ approve, reject, generate_pdf, generate_excel) |
| `CRUD /api/stock-movements/` | Mouvements de stock |
| `GET /api/indicators/dashboard_overview/` | Dashboard unifié |
| `GET /api/indicators/intelligence/` | Intelligence prédictive IA |
| `POST /api/chatbot/` | NexusMine Copilot (chatbot IA) |
| `POST /api/password-reset/` | Réinitialisation mot de passe |

---

## 🛠️ Stack technique

### Backend
- **Django 4.2.27** — Framework web Python
- **Django REST Framework 3.16.1** — API REST
- **SimpleJWT 5.5.1** — Authentification JWT (access 60min, refresh 7j)
- **django-cors-headers 4.7.0** — CORS
- **django-filter 23.5** — Filtrage avancé
- **OpenAI 2.15.0** — Chatbot IA (GPT-4o-mini)
- **Pillow 12.1.0** — Traitement images
- **ReportLab 4.4.9** — Génération PDF
- **openpyxl 3.1.5** — Génération Excel
- **psycopg2-binary 2.9.11** — PostgreSQL driver
- **Gunicorn 23.0.0** — Serveur WSGI production

### Frontend web
- **React 19.2** — UI framework
- **Vite 7.2.4** — Build tool
- **Tailwind CSS 4.1** — Styles utilitaires
- **Zustand 5.0** — State management
- **React Router DOM 7.12** — Routing SPA
- **Axios 1.13** — Client HTTP
- **Recharts 3.7** — Graphiques
- **Heroicons 2.2** — Icônes
- **Leaflet 1.9** — Cartes interactives

### Mobile (Flutter)
- **Flutter 3.x / Dart 3.x** — Framework multi-plateforme
- **flutter_riverpod 2.4** — State management
- **go_router 13.0** — Navigation
- **Dio 5.4** — Client HTTP
- **flutter_secure_storage 9.0** — JWT tokens sécurisés
- **image_picker 1.0** — Photos (caméra/galerie)
- **geolocator 10.1** — Géolocalisation
- **reactive_forms 16.1** — Formulaires réactifs

---

## 📁 Fichiers de dépendances

| Projet | Fichier | Lockfile |
|--------|---------|----------|
| Backend | `backend/requirements.txt` | — (pip freeze) |
| Frontend | `frontend/nexus-frontend/package.json` | `package-lock.json` |
| Mobile | `mobile/nexusmine_mobile/pubspec.yaml` | `pubspec.lock` |

### Réinstaller les dépendances (après un clone)

```bash
# Backend
cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt

# Frontend
cd frontend/nexus-frontend && npm install

# Mobile
cd mobile/nexusmine_mobile && flutter pub get
```

---

## 📚 Documentation

- [Guide Développeur](docs/DEVELOPER_GUIDE.md) — Documentation technique complète
- [Tâches à faire](docs/TASKS.md) — Répartition des tâches
- [Stack technique](TECH_STACK.md) — Détails des technologies

---

## 👥 Équipe

- Développeur principal
- Contributeurs

---

## 📄 Licence

Projet privé — Tous droits réservés

---

*Développé avec ❤️ pour l'industrie minière africaine*
