# ✅ Checklist de vérification - Validation des plages de dates

## 📋 Pré-déploiement

### Backend Django

- [ ] **Import validateurs**
  ```bash
  grep -n "from nexus_backend.validators import" backend/equipment/models.py
  grep -n "from nexus_backend.validators import" backend/operations/models.py
  ```

- [ ] **Modèle MaintenanceRecord**
  ```bash
  grep -n "def clean" backend/equipment/models.py
  grep -n "def save" backend/equipment/models.py
  ```

- [ ] **Modèle Operation**
  ```bash
  grep -n "def clean" backend/operations/models.py
  grep -n "def save" backend/operations/models.py
  ```

- [ ] **Serializer MaintenanceRecordSerializer**
  ```bash
  grep -n "def validate" backend/equipment/serializers.py
  ```

- [ ] **Serializer OperationSerializer**
  ```bash
  grep -n "def validate" backend/operations/serializers.py
  ```

- [ ] **Tests présents**
  ```bash
  test -f backend/tests_date_validation.py && echo "✓ Tests présents" || echo "✗ Tests manquants"
  ```

### Frontend React

- [ ] **Composant créé**
  ```bash
  test -f frontend/nexus-frontend/src/components/ui/DateRangeInput.jsx && echo "✓ Composant présent" || echo "✗ Composant manquant"
  ```

- [ ] **Import dans MaintenanceForm**
  ```bash
  grep -n "import DateRangeInput" frontend/nexus-frontend/src/pages/maintenance/MaintenanceForm.jsx
  grep -n "<DateRangeInput" frontend/nexus-frontend/src/pages/maintenance/MaintenanceForm.jsx
  ```

- [ ] **Import dans OperationsForm**
  ```bash
  grep -n "import DateRangeInput" frontend/nexus-frontend/src/pages/operations/OperationsForm.jsx
  grep -n "<DateRangeInput" frontend/nexus-frontend/src/pages/operations/OperationsForm.jsx
  ```

- [ ] **Gestion d'erreurs dans handleSubmit**
  ```bash
  grep -n "La date de fin doit être après" frontend/nexus-frontend/src/pages/maintenance/MaintenanceForm.jsx
  grep -n "L'heure de fin doit être après" frontend/nexus-frontend/src/pages/operations/OperationsForm.jsx
  ```

---

## 🧪 Tests locaux

### 1. Backend - Tests unitaires

```bash
cd backend

# Exécuter tous les tests de validation
python manage.py test tests_date_validation -v 2

# Résultat attendu:
# ✓ test_valid_maintenance_dates
# ✓ test_invalid_maintenance_dates_same
# ✓ test_invalid_maintenance_dates_end_before_start
# ✓ test_valid_operation_times
# ✓ test_invalid_operation_times_same
# ✓ test_invalid_operation_times_end_before_start
```

### 2. Backend - Validations manuelles

```bash
# Test 1: Créer une maintenance avec dates valides
python manage.py shell
from equipment.models import MaintenanceRecord
from django.utils import timezone
from datetime import timedelta, date

site = Site.objects.first()
equipment = Equipment.objects.create(equipment_code="TEST", name="Test", site=site)
start = timezone.now()
end = start + timedelta(hours=2)

m = MaintenanceRecord(
    equipment=equipment,
    maintenance_code="TEST-001",
    scheduled_date=date.today(),
    start_date=start,
    end_date=end,
    description="Test"
)
m.save()  # Doit fonctionner ✓
print(m.id)  # Affiche l'ID si succès

# Test 2: Créer une maintenance avec dates invalides
end_invalid = start - timedelta(hours=1)
m2 = MaintenanceRecord(
    equipment=equipment,
    maintenance_code="TEST-002",
    scheduled_date=date.today(),
    start_date=start,
    end_date=end_invalid,
    description="Test"
)
try:
    m2.save()  # Doit lever ValidationError ✗
except ValidationError as e:
    print(f"Validation error (attendu): {e}")  # ✓
```

### 3. Frontend - Test manuel

```bash
cd frontend/nexus-frontend

# Démarrer le serveur de développement
npm run dev

# Ouvrir http://localhost:5173/maintenance/create
# Tester:
# 1. Remplir les deux dates avec fin > début → Indicateur vert ✓
# 2. Remplir les deux dates avec fin < début → Indicateur rouge + erreur ✓
# 3. Remplir une seule date → Message "Remplissez les deux champs" ✓
# 4. Cliquer "Enregistrer" avec dates invalides → Erreur affichée ✓
```

### 4. API REST - Tests avec cURL

```bash
# Test 1: POST maintenance avec dates invalides
curl -X POST http://localhost:8000/api/maintenance/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "equipment": 1,
    "maintenance_code": "TEST-001",
    "scheduled_date": "2026-02-20",
    "start_date": "2026-02-20T17:00:00Z",
    "end_date": "2026-02-20T08:00:00Z",
    "description": "Test"
  }'
# Résultat attendu: 400 Bad Request avec erreur "La date de fin doit être après..."

# Test 2: POST maintenance avec dates valides
curl -X POST http://localhost:8000/api/maintenance/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "equipment": 1,
    "maintenance_code": "TEST-002",
    "scheduled_date": "2026-02-20",
    "start_date": "2026-02-20T08:00:00Z",
    "end_date": "2026-02-20T17:00:00Z",
    "description": "Test"
  }'
# Résultat attendu: 201 Created

# Test 3: POST operation avec horaires invalides
curl -X POST http://localhost:8000/api/operations/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "operation_code": "OP-2026-001",
    "operation_type": "EXTRACTION",
    "site": 1,
    "date": "2026-02-20",
    "start_time": "17:00:00",
    "end_time": "08:00:00",
    "description": "Test"
  }'
# Résultat attendu: 400 Bad Request
```

### 5. Intégration E2E

```bash
# Scénario complet:
# 1. Se connecter à http://localhost:3000 (frontend)
# 2. Naviguer vers /maintenance/create
# 3. Remplir le formulaire avec:
#    - Début: 2026-02-20 08:00
#    - Fin: 2026-02-20 07:00 (invalide)
# 4. Vérifier: ✓ Erreur affichée sous le champ
#             ✓ Indicateur rouge
#             ✓ Bouton "Enregistrer" désactivé
# 5. Corriger: Fin: 2026-02-20 17:00
# 6. Vérifier: ✓ Erreur disparue
#             ✓ Indicateur vert
#             ✓ "Durée: 9 heures" affiché
#             ✓ Bouton "Enregistrer" activé
# 7. Soumettre et vérifier succès
```

---

## 📊 Métriques de couverture

```bash
# Génerer rapport de couverture des tests
cd backend
coverage run --source='.' manage.py test tests_date_validation
coverage report

# Résultat attendu:
# Name                              Stmts   Miss  Cover
# ---------------------------------------------------
# equipment/models.py                 XX     X    95%+
# equipment/serializers.py            XX     X    95%+
# operations/models.py                XX     X    95%+
# operations/serializers.py           XX     X    95%+
# nexus_backend/validators.py         XX     X    100%
```

---

## 🐛 Dépannage

### Problème: `ImportError: cannot import name 'validate_date_range'`
```
Solution:
1. Vérifier que validators.py existe: backend/nexus_backend/validators.py
2. Vérifier l'import: from nexus_backend.validators import validate_date_range
3. Redémarrer le serveur Django
```

### Problème: Composant DateRangeInput non trouvé
```
Solution:
1. Vérifier le fichier existe: frontend/nexus-frontend/src/components/ui/DateRangeInput.jsx
2. Vérifier l'import: import DateRangeInput from '../../components/ui/DateRangeInput'
3. Vérifier le chemin relatif est correct
```

### Problème: Validation ne fonctionne pas au frontend
```
Solution:
1. Ouvrir DevTools (F12)
2. Vérifier Console pour erreurs React
3. Vérifier que les props sont passées correctement
4. Vérifier que onStartChange et onEndChange sont implémentés
```

### Problème: Validation ne fonctionne pas au backend
```
Solution:
1. Vérifier que model.clean() est appelé dans save()
2. Vérifier que serializer.validate() est implémenté
3. Tester directement: python manage.py shell
4. Vérifier les logs: tail -f /var/log/django.log
```

---

## 📋 Déploiement

### Before deployment

- [ ] Tous les tests passent: `python manage.py test tests_date_validation`
- [ ] Pas d'erreurs de linting: `cd frontend && npm run lint`
- [ ] Documentation à jour: [VALIDATION_DATES_SUMMARY.md](./VALIDATION_DATES_SUMMARY.md)
- [ ] Rollback plan préparé

### Deployment steps

```bash
# 1. Backend
cd backend
python manage.py migrate  # Si nouvelles migrations
python manage.py collectstatic --noinput
systemctl restart gunicorn  # ou votre serveur

# 2. Frontend
cd frontend/nexus-frontend
npm run build
# Déployer le contenu de dist/
```

### After deployment

- [ ] API responded correctly: Tester endpoints /maintenance/ et /operations/
- [ ] Frontend loads: Vérifier https://votre-domaine.com/maintenance/create
- [ ] Validation fonctionne: Tester avec dates invalides
- [ ] Logs sans erreurs: Vérifier console et logs serveur

---

## 📞 Support & Escalade

| Problème | Contact | Priorité |
|----------|---------|----------|
| Validation ne fonctionne pas | Dev Backend | P1 |
| UI cassée | Dev Frontend | P1 |
| Tests échouent | Tech Lead | P2 |
| Documentation manquante | Product Owner | P3 |

---

## ✨ Points de fierté

✅ **Robustesse:** 3 niveaux de validation (Frontend + API + Modèle)  
✅ **Réutilisabilité:** Composant et validateurs utilisables partout  
✅ **UX:** Feedback immédiat et indicateurs visuels clairs  
✅ **Testabilité:** Suite complète de tests unitaires  
✅ **Localisation:** Tous les textes en français  
✅ **Accessibilité:** Conforme aux standards

---

**Date de vérification:** 20 février 2026  
**Version:** 1.0  
**Statut:** ✅ Prêt pour déploiement
