# 📋 NexusMine - Répartition des Tâches

## 🎯 État actuel du projet

### ✅ Complété (Phase 1-3)

| Composant | Statut | Description |
|-----------|--------|-------------|
| Backend Django | ✅ | 10 apps avec modèles, serializers, viewsets |
| API REST | ✅ | Tous les endpoints CRUD fonctionnels |
| Authentification JWT | ✅ | Login/logout, refresh token |
| Frontend React | ✅ | Structure, routing, layout |
| Pages CRUD | ✅ | Toutes les pages List/Form/Detail créées |

### Pages Frontend créées
- ✅ Login
- ✅ Dashboard
- ✅ Sites Miniers (CRUD)
- ✅ Personnel (CRUD)
- ✅ Équipements (CRUD)
- ✅ Opérations (CRUD)
- ✅ Incidents (CRUD)
- ✅ Environnement (CRUD)
- ✅ Alertes (CRUD)
- ✅ Rapports (CRUD)
- ✅ Indicateurs (CRUD)
- ✅ Utilisateurs (CRUD - Admin only)

---

## 👥 Attribution des Tâches par Développeur

### 🧑‍💻 Développeur 1 - Backend & API

**Responsabilités:** Améliorer le backend, ajouter des fonctionnalités API

#### Tâches à faire:

1. **Statistiques Dashboard** (3h)
   - Créer un endpoint `/api/dashboard/stats/` qui retourne:
     - Nombre total de sites, personnel, équipements
     - Incidents du mois
     - Alertes non lues
     - Production du mois
   - Fichier: `backend/nexus_backend/views.py` (nouveau)

2. **Validation des Serializers** (2h)
   - Ajouter des validations personnalisées dans chaque serializer
   - Exemple: vérifier que `end_date > start_date` pour les opérations
   - Fichiers: `backend/*/serializers.py`

3. **Filtres avancés** (2h)
   - Ajouter des filtres par date dans les viewsets
   - Permettre de filtrer: `?date_from=2026-01-01&date_to=2026-01-31`
   - Fichiers: `backend/*/views.py`

4. **Tests unitaires** (4h)
   - Écrire des tests pour au moins 3 apps
   - Fichiers: `backend/*/tests.py`

```python
# Exemple test
from django.test import TestCase
from rest_framework.test import APIClient

class MiningSiteTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Créer un user de test
        
    def test_list_sites(self):
        response = self.client.get('/api/sites/')
        self.assertEqual(response.status_code, 200)
```

5. **Endpoint Export CSV** (2h)
   - Créer `/api/sites/export/` pour exporter en CSV
   - Même chose pour personnel, équipements

---

### 🧑‍💻 Développeur 2 - Frontend UI/UX

**Responsabilités:** Améliorer l'interface utilisateur

#### Tâches à faire:

1. **Dashboard avec graphiques** (4h)
   - Installer: `npm install recharts`
   - Ajouter des graphiques dans Dashboard.jsx:
     - Graphique production mensuelle (BarChart)
     - Répartition par type de minerai (PieChart)
     - Évolution incidents (LineChart)
   - Fichier: `frontend/nexus-frontend/src/pages/Dashboard.jsx`

2. **Pagination des listes** (2h)
   - Ajouter un composant Pagination réutilisable
   - L'intégrer dans toutes les pages List
   - Fichier à créer: `frontend/nexus-frontend/src/components/Pagination.jsx`

```jsx
// Exemple Pagination.jsx
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex gap-2">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        Précédent
      </button>
      <span>Page {currentPage} sur {totalPages}</span>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Suivant
      </button>
    </div>
  );
}
```

3. **Notifications Toast** (2h)
   - Installer: `npm install react-hot-toast`
   - Ajouter des notifications de succès/erreur après chaque action
   - Fichier: Modifier `App.jsx` et les pages Form

4. **Page Mon Profil** (2h)
   - Créer une page pour modifier son profil
   - Changer mot de passe
   - Fichier à créer: `frontend/nexus-frontend/src/pages/Profile.jsx`

5. **Responsive Design** (2h)
   - Vérifier et améliorer l'affichage mobile
   - Tester sur différentes tailles d'écran
   - Fichiers: Tous les composants layout

---

### 🧑‍💻 Développeur 3 - Fonctionnalités Avancées

**Responsabilités:** Ajouter des fonctionnalités métier avancées

#### Tâches à faire:

1. **Upload de fichiers** (4h)
   - Backend: Configurer django-storages ou utiliser FileField
   - Frontend: Ajouter input file dans les formulaires
   - Cas d'usage:
     - Photo d'équipement
     - Fichier PDF pour les rapports
   - Fichiers: `backend/equipment/models.py`, `frontend/.../EquipmentForm.jsx`

```python
# Backend - models.py
class Equipment(models.Model):
    # ... autres champs
    photo = models.ImageField(upload_to='equipment/', null=True, blank=True)
```

2. **Carte interactive** (4h)
   - Installer: `npm install react-leaflet leaflet`
   - Afficher les sites sur une carte
   - Fichier à créer: `frontend/nexus-frontend/src/components/Map.jsx`

3. **Export PDF des rapports** (3h)
   - Installer côté backend: `pip install reportlab` ou `weasyprint`
   - Créer endpoint `/api/reports/{id}/pdf/`
   - Fichier: `backend/reports/views.py`

4. **Recherche globale** (2h)
   - Ajouter une barre de recherche dans le header
   - Rechercher dans sites, personnel, équipements
   - Fichier: `frontend/nexus-frontend/src/components/layout/Header.jsx`

5. **Notifications temps réel** (4h) - AVANCÉ
   - Installer Django Channels
   - WebSocket pour alertes en temps réel
   - Fichiers: Nouveau dossier `backend/notifications/`

---

### 🧑‍💻 Développeur 4 - Tests & Documentation

**Responsabilités:** Qualité, tests, documentation

#### Tâches à faire:

1. **Tests Frontend** (4h)
   - Configurer Vitest ou Jest
   - Écrire des tests pour les composants principaux
   - `npm install -D vitest @testing-library/react`

```jsx
// Exemple test
import { render, screen } from '@testing-library/react';
import SitesList from './SitesList';

test('affiche le titre', () => {
  render(<SitesList />);
  expect(screen.getByText('Sites Miniers')).toBeInTheDocument();
});
```

2. **Documentation API (Swagger)** (2h)
   - Installer: `pip install drf-spectacular`
   - Configurer dans settings.py
   - Endpoint: `/api/docs/`

3. **README principal** (1h)
   - Mettre à jour le README.md à la racine
   - Screenshots de l'application
   - Instructions d'installation simplifiées

4. **Storybook pour composants** (3h) - OPTIONNEL
   - Documenter les composants UI
   - `npx storybook@latest init`

5. **CI/CD GitHub Actions** (2h)
   - Créer `.github/workflows/ci.yml`
   - Tests automatiques à chaque push

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Backend tests
        run: |
          cd backend
          pip install -r requirements.txt
          python manage.py test
```

---

## 📊 Tableau récapitulatif

| Développeur | Tâche principale | Heures estimées |
|-------------|------------------|-----------------|
| Dev 1 | Backend/API | ~13h |
| Dev 2 | Frontend UI/UX | ~12h |
| Dev 3 | Fonctionnalités avancées | ~17h |
| Dev 4 | Tests/Documentation | ~12h |

---

## 🗓️ Planning suggéré

### Semaine 1
- Dev 1: Statistiques Dashboard + Validation Serializers
- Dev 2: Dashboard graphiques + Pagination
- Dev 3: Upload fichiers
- Dev 4: Documentation API + README

### Semaine 2
- Dev 1: Filtres avancés + Export CSV
- Dev 2: Notifications Toast + Page Profil
- Dev 3: Carte interactive + Export PDF
- Dev 4: Tests Frontend + CI/CD

### Semaine 3
- Dev 1: Tests unitaires backend
- Dev 2: Responsive design
- Dev 3: Recherche globale + Notifications temps réel
- Dev 4: Finalisation documentation

---

## 🛠️ Configuration Git pour le travail en équipe

```bash
# Chaque développeur crée sa branche
git checkout -b feature/dev1-dashboard-stats
git checkout -b feature/dev2-charts
git checkout -b feature/dev3-file-upload
git checkout -b feature/dev4-tests

# Après avoir terminé
git add .
git commit -m "feat(dashboard): ajouter endpoint stats"
git push origin feature/dev1-dashboard-stats

# Créer une Pull Request sur GitHub
```

---

## 📞 Communication

- Utiliser les issues GitHub pour suivre les tâches
- Daily standup (5-10 min) pour synchroniser
- Code review obligatoire avant merge

---

## ⚠️ Points d'attention

1. **Ne pas modifier les mêmes fichiers** - Éviter les conflits
2. **Toujours tester avant de commit**
3. **Documenter les nouvelles fonctionnalités**
4. **Suivre les conventions de code** (voir DEVELOPER_GUIDE.md)

---

*Dernière mise à jour: 21 janvier 2026*
