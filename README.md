# 🏔️ NexusMine

**Plateforme d'intelligence minière pour la Guinée et l'Afrique**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.11+-green)
![Django](https://img.shields.io/badge/django-4.2-green)
![React](https://img.shields.io/badge/react-19-blue)

---

## 📋 Description

NexusMine est une solution complète de gestion des opérations minières permettant de :

- 🏭 **Gérer les sites miniers** - Localisation, production, statut
- 👷 **Suivre le personnel** - Employés, postes, qualifications
- 🔧 **Monitorer les équipements** - Machines, maintenance, état
- ⛏️ **Planifier les opérations** - Production journalière, équipes
- 🚨 **Gérer les incidents** - Sécurité, accidents, suivi
- 🌿 **Surveiller l'environnement** - Qualité air/eau, mesures
- 🔔 **Recevoir des alertes** - Seuils, notifications
- 📊 **Analyser les KPIs** - Tableaux de bord, indicateurs
- 📄 **Générer des rapports** - Journaliers, mensuels, personnalisés

---

## 🚀 Démarrage rapide

### Prérequis

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### Installation

```bash
# 1. Cloner le projet
git clone https://github.com/votre-repo/NexusMine.git
cd NexusMine

# 2. Backend
python -m venv .venv
source .venv/bin/activate
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# 3. Frontend (nouveau terminal)
cd frontend/nexus-frontend
npm install
npm run dev
```

### URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5174 |
| Backend API | http://127.0.0.1:8000/api/ |
| Admin Django | http://127.0.0.1:8000/admin/ |

---

## 🏗️ Architecture

```
NexusMine/
├── backend/              # Django REST API
│   ├── accounts/         # Utilisateurs & Auth
│   ├── mining_sites/     # Sites miniers
│   ├── personnel/        # Personnel
│   ├── equipment/        # Équipements
│   ├── operations/       # Opérations
│   ├── incidents/        # Incidents
│   ├── environment/      # Données environnementales
│   ├── alerts/           # Alertes
│   ├── reports/          # Rapports
│   └── analytics/        # Indicateurs
├── frontend/
│   └── nexus-frontend/   # React + Vite + Tailwind
└── docs/                 # Documentation
```

---

## 🔐 Rôles utilisateur

| Rôle | Permissions |
|------|-------------|
| **ADMIN** | Accès total + gestion utilisateurs |
| **SUPERVISOR** | Gestion opérations, personnel, équipements |
| **OPERATOR** | Saisie données opérationnelles |
| **ANALYST** | Rapports et indicateurs |
| **REGULATOR** | Lecture seule (conformité) |

---

## 📚 Documentation

- [Guide Développeur](docs/DEVELOPER_GUIDE.md) - Documentation technique complète
- [Tâches à faire](docs/TASKS.md) - Répartition des tâches pour l'équipe

---

## 🛠️ Stack technique

### Backend
- Django 4.2.27
- Django REST Framework 3.16.1
- PostgreSQL
- JWT Authentication (simplejwt)

### Frontend
- React 19.2
- Vite 7.3.1
- Tailwind CSS 4.1
- Zustand (state management)
- React Router DOM 7.6
- Axios

---

## 👥 Équipe

- Développeur principal
- Contributeurs

---

## 📄 Licence

Projet privé - Tous droits réservés

---

*Développé avec ❤️ pour l'industrie minière africaine*
