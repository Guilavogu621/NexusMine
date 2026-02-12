# NexusMine — Backend API

**API REST Django** pour la plateforme NexusMine de gestion minière.

---

## 🚀 Démarrage

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

### Variables d'environnement

Copier `.env.example` vers `.env` et renseigner :

```env
SECRET_KEY=votre-clé-secrète
DEBUG=True
OPENAI_API_KEY=sk-...       # Pour le chatbot IA
DATABASE_URL=sqlite:///db.sqlite3   # ou PostgreSQL
```

---

## 🏗️ Structure des applications

```
backend/
├── nexus_backend/        # Configuration Django (settings, urls, chatbot)
├── accounts/             # Utilisateurs, auth JWT, RBAC (6 rôles)
├── mining_sites/         # Sites miniers (CRUD)
├── personnel/            # Effectifs & postes
├── equipment/            # Équipements & maintenance
├── operations/           # Opérations d'extraction, shifts, zones
├── incidents/            # Incidents sécurité (avec photos)
├── environment/          # Données environnementales & seuils
├── alerts/               # Alertes & règles d'alerte
├── stock/                # Stock minerai (mouvements, emplacements)
├── reports/              # Rapports (PDF/Excel, approbation workflow)
├── analytics/            # KPIs, dashboard, intelligence prédictive IA
└── media/                # Fichiers uploadés (photos profil, incidents)
```

---

## 🔐 Authentification & RBAC

### JWT (SimpleJWT)
- Access token : **60 minutes**
- Refresh token : **7 jours**, rotation automatique
- Endpoints : `POST /api/token/`, `POST /api/token/refresh/`

### 6 Rôles

| Rôle | Permissions |
|------|-------------|
| **ADMIN** | Accès total, CRUD utilisateurs |
| **SITE_MANAGER** | Gestion de son site, validation rapports |
| **SUPERVISOR** | Supervision opérations, validation rapports terrain |
| **OPERATOR** | Saisie terrain uniquement (rapports soumis à approbation) |
| **ANALYST** | Lecture analytics, rapports, KPIs |
| **MMG** | Lecture seule sur **tous les sites** (autorité ministérielle) |

Les permissions sont gérées dans `accounts/permissions.py` avec des classes DRF.

Le `SiteScopedMixin` dans `accounts/mixins.py` filtre automatiquement les données par site assigné (sauf MMG qui voit tout).

---

## 🔗 API Endpoints

| Endpoint | Méthodes | Description |
|----------|---------|-------------|
| `/api/token/` | POST | Authentification JWT |
| `/api/token/refresh/` | POST | Rafraîchir le token |
| `/api/users/` | CRUD | Gestion utilisateurs (ADMIN) |
| `/api/users/me/` | GET, PATCH | Profil connecté |
| `/api/sites/` | CRUD | Sites miniers |
| `/api/personnel/` | CRUD | Personnel |
| `/api/equipment/` | CRUD | Équipements |
| `/api/maintenance/` | CRUD | Historique maintenance |
| `/api/operations/` | CRUD | Opérations d'extraction |
| `/api/shifts/` | CRUD | Shifts / équipes |
| `/api/work-zones/` | CRUD | Zones de travail |
| `/api/incidents/` | CRUD | Incidents sécurité |
| `/api/environmental-data/` | CRUD | Relevés environnementaux |
| `/api/thresholds/` | CRUD | Seuils environnementaux |
| `/api/alerts/` | CRUD | Alertes |
| `/api/alert-rules/` | CRUD | Règles d'alerte |
| `/api/reports/` | CRUD | Rapports |
| `/api/reports/{id}/approve/` | POST | Approuver un rapport (SUPERVISOR/SITE_MANAGER) |
| `/api/reports/{id}/reject/` | POST | Rejeter un rapport |
| `/api/reports/{id}/generate_pdf/` | GET | Télécharger en PDF |
| `/api/reports/{id}/generate_excel/` | GET | Télécharger en Excel |
| `/api/stock-movements/` | CRUD | Mouvements de stock |
| `/api/stock-locations/` | CRUD | Emplacements de stock |
| `/api/stock-summary/` | GET | Synthèse stock |
| `/api/indicators/` | GET | Indicateurs KPI |
| `/api/indicators/dashboard_overview/` | GET | Dashboard unifié |
| `/api/indicators/intelligence/` | GET | Intelligence prédictive IA |
| `/api/chatbot/` | POST | NexusMine Copilot (chatbot IA + données DB) |
| `/api/password-reset/` | POST | Réinitialisation mot de passe |

---

## 📦 Dépendances principales

| Package | Version | Usage |
|---------|---------|-------|
| Django | 4.2.27 | Framework web |
| djangorestframework | 3.16.1 | API REST |
| djangorestframework-simplejwt | 5.5.1 | Auth JWT |
| django-cors-headers | 4.7.0 | CORS |
| django-filter | 23.5 | Filtrage queryset |
| openai | 2.15.0 | Chatbot IA (GPT-4o-mini) |
| Pillow | 12.1.0 | Images (photos) |
| reportlab | 4.4.9 | Génération PDF |
| openpyxl | 3.1.5 | Génération Excel |
| psycopg2-binary | 2.9.11 | Driver PostgreSQL |
| gunicorn | 23.0.0 | Serveur WSGI production |
| python-dotenv | 1.2.1 | Variables d'environnement |

Toutes les versions exactes : voir `requirements.txt`.

---

## 🤖 Chatbot IA

Le chatbot NexusMine Copilot (`nexus_backend/chatbot.py`) :
- Utilise l'API OpenAI (GPT-4o-mini)
- Interroge la base de données en temps réel
- Gère 8 sujets : opérations, incidents, équipements, environnement, stock, alertes, rapports, résumé/dashboard
- Enrichit les réponses IA avec les données concrètes du site

---

## 🧪 Tests

```bash
python manage.py test                  # Tous les tests
python manage.py test accounts         # Tests d'un module
python manage.py test --verbosity=2    # Mode verbose
```

---

## 🚀 Production

```bash
# Avec Gunicorn
gunicorn nexus_backend.wsgi:application --bind 0.0.0.0:8000

# Collecter les fichiers statiques
python manage.py collectstatic
```

---

## 📄 Licence

Propriétaire — NexusMine © 2024-2026
