# NexusMine - Guide Développeur Complet

## 📋 Table des matières

1. [Présentation du projet](#présentation-du-projet)
2. [Architecture technique](#architecture-technique)
3. [Installation et configuration](#installation-et-configuration)
4. [Structure du projet](#structure-du-projet)
5. [Backend Django](#backend-django)
6. [Frontend React](#frontend-react)
7. [API REST](#api-rest)
8. [Authentification et Permissions](#authentification-et-permissions)
9. [Tâches à faire](#tâches-à-faire)
10. [Conventions de code](#conventions-de-code)

---

## 🎯 Présentation du projet

**NexusMine** est une plateforme d'intelligence minière conçue pour la gestion complète des opérations minières en Guinée et en Afrique.

### Objectifs
- Gestion des sites miniers
- Suivi du personnel et des équipements
- Monitoring des opérations et incidents
- Surveillance environnementale
- Alertes et rapports
- Tableaux de bord et indicateurs de performance (KPIs)

### Fonctionnalités principales
| Module | Description |
|--------|-------------|
| Sites Miniers | Gestion des sites, localisations, types de minerais |
| Personnel | Employés, postes, qualifications |
| Équipements | Machines, maintenance, état opérationnel |
| Opérations | Activités quotidiennes, production |
| Incidents | Accidents, incidents de sécurité |
| Environnement | Données environnementales (air, eau, bruit) |
| Alertes | Notifications, seuils dépassés |
| Rapports | Rapports périodiques, exports |
| Indicateurs | KPIs, tableaux de bord analytiques |
| Utilisateurs | Gestion des comptes (ADMIN uniquement) |

---

## 🏗️ Architecture technique

### Stack technologique

#### Backend
- **Python 3.11+**
- **Django 4.2.27** - Framework web
- **Django REST Framework 3.16.1** - API REST
- **PostgreSQL** - Base de données
- **djangorestframework-simplejwt** - Authentification JWT
- **django-cors-headers** - CORS pour le frontend
- **django-filter** - Filtrage des requêtes API

#### Frontend
- **React 19.2** - Framework UI
- **Vite 7.3.1** - Build tool
- **Tailwind CSS 4.1** - Styling
- **React Router DOM 7.6** - Routing
- **Zustand** - State management
- **Axios** - Client HTTP
- **Heroicons** - Icônes
- **Headless UI** - Composants accessibles

### Diagramme d'architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                    (React + Vite)                           │
│                  http://localhost:5174                       │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/REST (JSON)
                          │ JWT Token
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│                (Django + DRF + JWT)                         │
│                http://127.0.0.1:8000                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      PostgreSQL                              │
│              Database: nexusmine_db                          │
│              User: nexusmine_user                            │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Installation et configuration

### Prérequis
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Git

### 1. Cloner le projet
```bash
git clone <repo-url>
cd NexusMine
```

### 2. Configuration Backend

```bash
# Créer l'environnement virtuel
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# ou .venv\Scripts\activate  # Windows

# Installer les dépendances
cd backend
pip install -r requirements.txt

# Configurer PostgreSQL
sudo -u postgres psql
CREATE DATABASE nexusmine_db;
CREATE USER nexusmine_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE nexusmine_db TO nexusmine_user;
\q

# Appliquer les migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver
```

### 3. Configuration Frontend

```bash
cd frontend/nexus-frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

### 4. Variables d'environnement (optionnel)

Créer un fichier `.env` dans `backend/`:
```env
DEBUG=True
SECRET_KEY=votre-cle-secrete-super-longue
DATABASE_URL=postgres://nexusmine_user:password@localhost:5432/nexusmine_db
```

### URLs de développement
- **Frontend**: http://localhost:5174
- **Backend API**: http://127.0.0.1:8000/api/
- **Admin Django**: http://127.0.0.1:8000/admin/

---

## 📁 Structure du projet

```
NexusMine/
├── .venv/                    # Environnement virtuel Python
├── backend/                  # Application Django
│   ├── manage.py
│   ├── requirements.txt
│   ├── db.sqlite3           # (dev only, utiliser PostgreSQL)
│   ├── nexus_backend/       # Configuration Django
│   │   ├── settings.py      # Paramètres Django
│   │   ├── urls.py          # URLs principales
│   │   ├── api_urls.py      # URLs API
│   │   └── wsgi.py
│   ├── accounts/            # Gestion utilisateurs
│   ├── mining_sites/        # Sites miniers
│   ├── personnel/           # Personnel
│   ├── equipment/           # Équipements
│   ├── operations/          # Opérations
│   ├── incidents/           # Incidents
│   ├── environment/         # Données environnementales
│   ├── alerts/              # Alertes
│   ├── reports/             # Rapports
│   └── analytics/           # Indicateurs/KPIs
├── frontend/
│   └── nexus-frontend/      # Application React
│       ├── package.json
│       ├── vite.config.js
│       ├── tailwind.config.js
│       ├── index.html
│       ├── public/
│       └── src/
│           ├── main.jsx          # Point d'entrée
│           ├── App.jsx           # Routes principales
│           ├── index.css         # Styles globaux
│           ├── api/
│           │   └── axios.js      # Configuration Axios
│           ├── stores/
│           │   └── authStore.js  # État authentification
│           ├── components/
│           │   ├── layout/       # Layout, Sidebar, Header
│           │   └── ProtectedRoute.jsx
│           └── pages/
│               ├── Login.jsx
│               ├── Dashboard.jsx
│               ├── sites/        # CRUD Sites
│               ├── personnel/    # CRUD Personnel
│               ├── equipment/    # CRUD Équipements
│               ├── operations/   # CRUD Opérations
│               ├── incidents/    # CRUD Incidents
│               ├── environment/  # CRUD Environnement
│               ├── alerts/       # CRUD Alertes
│               ├── reports/      # CRUD Rapports
│               ├── analytics/    # CRUD Indicateurs
│               └── users/        # CRUD Utilisateurs
└── docs/                     # Documentation
```

---

## 🐍 Backend Django

### Applications Django (10 apps)

| App | Modèle principal | Description |
|-----|------------------|-------------|
| `accounts` | `User` | Utilisateurs avec authentification email |
| `mining_sites` | `MiningSite` | Sites miniers |
| `personnel` | `Personnel` | Employés |
| `equipment` | `Equipment` | Équipements/Machines |
| `operations` | `Operation` | Opérations de production |
| `incidents` | `Incident` | Incidents et accidents |
| `environment` | `EnvironmentalData` | Mesures environnementales |
| `alerts` | `Alert` | Alertes système |
| `reports` | `Report` | Rapports générés |
| `analytics` | `Indicator` | Indicateurs de performance |

### Modèle User personnalisé

```python
# accounts/models.py
class User(AbstractUser):
    ROLE_CHOICES = [
        ('ADMIN', 'Administrateur'),
        ('SUPERVISOR', 'Superviseur'),
        ('OPERATOR', 'Opérateur'),
        ('ANALYST', 'Analyste'),
        ('REGULATOR', 'Régulateur'),
    ]
    
    username = None  # Désactivé
    email = models.EmailField(unique=True)  # Login par email
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='OPERATOR')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
```

### Exemple de modèle - MiningSite

```python
# mining_sites/models.py
class MiningSite(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Actif'),
        ('INACTIVE', 'Inactif'),
        ('MAINTENANCE', 'En maintenance'),
        ('CLOSED', 'Fermé'),
    ]
    
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)
    location = models.CharField(max_length=300)
    region = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='Guinée')
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True)
    mineral_type = models.CharField(max_length=100)  # Or, Bauxite, Fer, etc.
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    surface_area = models.DecimalField(max_digits=12, decimal_places=2, null=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Serializers (DRF)

```python
# mining_sites/serializers.py
class MiningSiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = MiningSite
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
```

### ViewSets

```python
# mining_sites/views.py
class MiningSiteViewSet(viewsets.ModelViewSet):
    queryset = MiningSite.objects.all()
    serializer_class = MiningSiteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'region', 'mineral_type']
    search_fields = ['name', 'code', 'location']
    ordering_fields = ['name', 'created_at']
```

---

## ⚛️ Frontend React

### Configuration Axios

```javascript
// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour refresh token automatique
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Tenter de rafraîchir le token
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(
            'http://127.0.0.1:8000/api/token/refresh/',
            { refresh: refreshToken }
          );
          localStorage.setItem('access_token', response.data.access);
          error.config.headers.Authorization = `Bearer ${response.data.access}`;
          return api.request(error.config);
        } catch {
          // Refresh échoué, déconnecter
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Store Zustand (authentification)

```javascript
// src/stores/authStore.js
import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const response = await api.post('/token/', { email, password });
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    
    // Récupérer les infos utilisateur
    const userResponse = await api.get('/users/me/');
    set({ user: userResponse.data, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const response = await api.get('/users/me/');
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  // Helpers pour vérifier les rôles
  isAdmin: () => get().user?.role === 'ADMIN',
  isSupervisor: () => ['ADMIN', 'SUPERVISOR'].includes(get().user?.role),
  isAnalyst: () => ['ADMIN', 'ANALYST'].includes(get().user?.role),
}));

export default useAuthStore;
```

### Structure d'une page CRUD (exemple)

Chaque module a 3 fichiers + 1 index:

```
pages/sites/
├── index.js           # Exports
├── SitesList.jsx      # Liste avec filtres et tableau
├── SiteForm.jsx       # Formulaire création/édition
└── SiteDetail.jsx     # Vue détaillée
```

#### Exemple SitesList.jsx (simplifié)

```jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function SitesList() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const response = await api.get('/sites/');
      setSites(response.data.results || response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Sites Miniers</h1>
      <Link to="/sites/new">Nouveau site</Link>
      
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <table>
          {sites.map((site) => (
            <tr key={site.id}>
              <td>{site.name}</td>
              <td>{site.status}</td>
              <td>
                <Link to={`/sites/${site.id}`}>Voir</Link>
                <Link to={`/sites/${site.id}/edit`}>Modifier</Link>
              </td>
            </tr>
          ))}
        </table>
      )}
    </div>
  );
}
```

---

## 🔌 API REST

### Endpoints principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/token/` | Obtenir JWT (login) |
| POST | `/api/token/refresh/` | Rafraîchir le token |
| GET | `/api/users/me/` | Profil utilisateur connecté |
| CRUD | `/api/sites/` | Sites miniers |
| CRUD | `/api/personnel/` | Personnel |
| CRUD | `/api/equipment/` | Équipements |
| CRUD | `/api/operations/` | Opérations |
| CRUD | `/api/incidents/` | Incidents |
| CRUD | `/api/environmental-data/` | Données environnementales |
| CRUD | `/api/alerts/` | Alertes |
| CRUD | `/api/reports/` | Rapports |
| CRUD | `/api/indicators/` | Indicateurs |
| CRUD | `/api/users/` | Utilisateurs (ADMIN) |

### Format de réponse paginée

```json
{
  "count": 42,
  "next": "http://127.0.0.1:8000/api/sites/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Mine de Boké",
      "status": "ACTIVE",
      ...
    }
  ]
}
```

### Authentification JWT

```bash
# Obtenir un token
curl -X POST http://127.0.0.1:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@nexusmine.com", "password": "password"}'

# Réponse
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}

# Utiliser le token
curl http://127.0.0.1:8000/api/sites/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

---

## 🔐 Authentification et Permissions

### Rôles utilisateur

| Rôle | Description | Permissions |
|------|-------------|-------------|
| **ADMIN** | Administrateur | Accès total, gestion utilisateurs |
| **SUPERVISOR** | Superviseur | CRUD opérations, personnel, équipements, incidents |
| **OPERATOR** | Opérateur | Lecture + saisie données opérationnelles |
| **ANALYST** | Analyste | Lecture + gestion rapports et indicateurs |
| **REGULATOR** | Régulateur | Lecture seule (conformité) |

### Permissions par module (Frontend)

```javascript
// Exemple dans App.jsx
<Route path="/sites/new" element={
  <ProtectedRoute roles={['ADMIN']}>
    <SiteForm />
  </ProtectedRoute>
} />

<Route path="/equipment/new" element={
  <ProtectedRoute roles={['ADMIN', 'SUPERVISOR']}>
    <EquipmentForm />
  </ProtectedRoute>
} />
```

### Permissions Backend

```python
# accounts/permissions.py
from rest_framework.permissions import BasePermission

class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'ADMIN'

class IsSupervisorOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['ADMIN', 'SUPERVISOR']
```

---

## ✅ Tâches à faire

### 🔴 Priorité Haute

#### Backend
- [ ] Ajouter la validation des données dans les serializers
- [ ] Implémenter les endpoints personnalisés (statistiques dashboard)
- [ ] Ajouter des tests unitaires pour chaque app
- [ ] Configurer les logs et monitoring
- [ ] Sécuriser les settings pour production

#### Frontend
- [ ] Améliorer le Dashboard avec des vrais graphiques (Chart.js ou Recharts)
- [ ] Ajouter la pagination dans toutes les listes
- [ ] Implémenter l'export Excel/PDF des rapports
- [ ] Ajouter des notifications toast (succès/erreur)
- [ ] Améliorer la gestion des erreurs

### 🟡 Priorité Moyenne

- [ ] Ajouter des filtres avancés avec dates
- [ ] Implémenter la recherche globale
- [ ] Ajouter l'upload d'images/fichiers (photos équipements, rapports PDF)
- [ ] Créer une page "Mon profil" pour changer mot de passe
- [ ] Ajouter la géolocalisation sur carte (Leaflet ou Mapbox)
- [ ] Implémenter les notifications en temps réel (WebSocket)

### 🟢 Priorité Basse

- [ ] Mode sombre (dark mode)
- [ ] Internationalisation (i18n) - Français/Anglais
- [ ] PWA (Progressive Web App) pour mobile
- [ ] Génération automatique de rapports PDF
- [ ] Intégration email pour alertes
- [ ] Historique des modifications (audit log)

---

## 📝 Conventions de code

### Backend (Python/Django)

```python
# Nommage
class MiningSite(models.Model):  # PascalCase pour classes
    site_name = models.CharField()  # snake_case pour variables
    
def get_active_sites():  # snake_case pour fonctions
    pass

# Imports
from django.db import models
from rest_framework import serializers
from .models import MiningSite

# Docstrings
def calculate_production(site_id: int) -> float:
    """
    Calcule la production totale d'un site.
    
    Args:
        site_id: ID du site minier
        
    Returns:
        Production totale en tonnes
    """
    pass
```

### Frontend (React/JavaScript)

```jsx
// Nommage des fichiers
// - Composants: PascalCase (SitesList.jsx)
// - Utils/hooks: camelCase (useAuthStore.js)

// Composants fonctionnels avec hooks
export default function SitesList() {
  const [sites, setSites] = useState([]);
  
  useEffect(() => {
    // ...
  }, []);
  
  return <div>...</div>;
}

// Props destructuring
function SiteCard({ site, onDelete }) {
  return <div>{site.name}</div>;
}

// Tailwind CSS
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500">
  Enregistrer
</button>
```

### Git Commits

```bash
# Format: type(scope): description

feat(sites): ajouter filtre par région
fix(auth): corriger refresh token
docs(readme): mettre à jour installation
style(ui): améliorer responsive sidebar
refactor(api): simplifier intercepteurs axios
test(personnel): ajouter tests unitaires
```

---

## 🚀 Commandes utiles

### Backend

```bash
# Migrations
python manage.py makemigrations
python manage.py migrate

# Shell Django
python manage.py shell

# Créer superuser
python manage.py createsuperuser

# Tests
python manage.py test

# Lancer serveur
python manage.py runserver
```

### Frontend

```bash
# Développement
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Linter
npm run lint
```

### Git

```bash
# Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# Commit
git add .
git commit -m "feat(module): description"

# Push
git push origin feature/nouvelle-fonctionnalite
```

---

## 📞 Support

Pour toute question:
1. Consulter cette documentation
2. Vérifier les issues GitHub
3. Contacter l'équipe de développement

---

*Documentation générée le 21 janvier 2026*
*Version 1.0.0*
