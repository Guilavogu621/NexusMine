# NexusMine — Frontend Web

**Application web de gestion minière** construite avec React 19, Vite et Tailwind CSS 4.

Utilisée par tous les rôles **sauf OPERATOR** (qui utilise l'app mobile Flutter).

---

## 🚀 Démarrage

```bash
npm install
npm run dev          # → http://localhost:5174
npm run build        # Production build → dist/
npm run preview      # Prévisualiser le build
npm run lint         # ESLint
```

---

## 🏗️ Structure du projet

```
src/
├── api/                  # Client Axios, intercepteurs JWT
├── assets/               # Images, logos
├── components/
│   ├── layout/           # Sidebar, TopBar, MainLayout
│   ├── maps/             # Composants Leaflet (cartes interactives)
│   ├── ui/               # Composants réutilisables (boutons, modals, etc.)
│   ├── FloatingChatbot.jsx   # Chatbot IA flottant (NexusMine Copilot)
│   └── ProtectedRoute.jsx    # Garde de route avec vérification JWT + rôle
├── hooks/                # Custom hooks React
├── pages/
│   ├── Dashboard.jsx     # Tableau de bord principal (KPIs, graphiques)
│   ├── LandingPage.jsx   # Page d'accueil publique
│   ├── Login.jsx         # Connexion
│   ├── ForgotPassword.jsx # Réinitialisation mot de passe
│   ├── Profile.jsx       # Profil utilisateur
│   ├── Settings.jsx      # Paramètres
│   ├── users/            # Gestion des utilisateurs (ADMIN)
│   ├── sites/            # Sites miniers
│   ├── personnel/        # Effectifs
│   ├── equipment/        # Équipements
│   ├── maintenance/      # Historique maintenance
│   ├── operations/       # Opérations minières
│   ├── shifts/           # Gestion des shifts
│   ├── workzones/        # Zones de travail
│   ├── incidents/        # Incidents & sécurité
│   ├── environment/      # Relevés environnementaux
│   ├── thresholds/       # Seuils environnementaux
│   ├── stock/            # Stock minerai
│   ├── alerts/           # Alertes
│   ├── alert-rules/      # Règles d'alerte
│   ├── reports/          # Rapports (PDF/Excel, approbation)
│   ├── analytics/        # Graphiques & KPIs avancés
│   └── intelligence/     # Intelligence prédictive IA
├── stores/
│   └── authStore.js      # Zustand store (auth, tokens, user)
├── App.jsx               # Routes principales (React Router)
├── main.jsx              # Point d'entrée
└── index.css             # Styles globaux (Tailwind)
```

---

## 🎨 Design system

- **Accent principal** : Indigo (uniformisé sur toutes les pages)
- **Framework CSS** : Tailwind CSS 4 (utility-first)
- **Icônes** : Heroicons 2 (outline + solid)
- **Graphiques** : Recharts 3
- **Cartes** : Leaflet + react-leaflet
- **Composants UI** : Headless UI (modals, menus)

---

## 🔐 Authentification

- JWT via SimpleJWT (backend Django)
- Access token (60 min) stocké en mémoire (Zustand)
- Refresh token (7 jours) avec rotation automatique
- Intercepteur Axios pour refresh transparent
- `ProtectedRoute` vérifie le token et le rôle utilisateur

---

## 📦 Dépendances principales

| Package | Version | Usage |
|---------|---------|-------|
| react | 19.2 | UI framework |
| react-dom | 19.2 | DOM rendering |
| react-router-dom | 7.12 | SPA routing |
| zustand | 5.0 | State management |
| axios | 1.13 | HTTP client |
| tailwindcss | 4.1 | CSS utility-first |
| recharts | 3.7 | Graphiques / charts |
| @heroicons/react | 2.2 | Icônes SVG |
| @headlessui/react | 2.2 | Composants accessibles |
| leaflet | 1.9 | Cartes |
| react-leaflet | 5.0 | React wrapper Leaflet |
| date-fns | 4.1 | Manipulation dates |
| vite | 7.2 | Build tool |

---

## 🔗 API Backend

Le frontend communique avec l'API REST Django sur `http://localhost:8000/api/`.

Configuration du proxy dans `vite.config.js` si nécessaire.

Endpoints principaux : voir le [README racine](../../README.md#-api-endpoints-principaux).

---

## 👥 Rôles et accès

| Rôle | Pages accessibles |
|------|-------------------|
| ADMIN | Toutes les pages + gestion utilisateurs |
| SITE_MANAGER | Dashboard, sites, personnel, opérations, incidents, rapports (approbation) |
| SUPERVISOR | Dashboard, opérations, incidents, équipements, rapports (approbation terrain) |
| ANALYST | Dashboard, analytics, intelligence, rapports |
| MMG | Lecture seule sur toutes les données (tous les sites) |
