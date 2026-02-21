# 📋 Spécification: Conformité MMG (Ministère des Mines et de la Géologie)

**Date:** 21 février 2026  
**Statut:** Architecture de conformité réglementaire

---

## 🎯 Rôle MMG: Audit & Conformité

La MMG est un rôle d'**audit et de contrôle réglementaire** - **Lecture seule** sur toutes les données.

### Permissions MMG
```
✔ READ (Lecture)
✔ EXPORT (Téléchargement/PDF)
✔ AUDIT TRAIL (Historique)
✘ CREATE (Aucune création)
✘ UPDATE (Aucune modification)
✘ DELETE (Aucune suppression)
```

---

## 📊 Données critiques accessibles à MMG

### 1️⃣ Informations administratives
- [x] Identification exploitation (permis, licence, GPS)
- [x] Responsable légal et contact officiel
- [x] Responsable sécurité/environnement

### 2️⃣ Données de production
- [x] Quantité extraite (jour/mois/année)
- [x] Type de minerai et teneur
- [x] Volume transporté
- [x] Stock déclaré
- [x] Traçabilité du minerai

### 3️⃣ Fiscalité & Redevances
- [x] Volume déclaré
- [x] Valeur marchande
- [x] Redevances minières dues
- [x] Taxes payées
- [x] Historique des paiements
- [x] Factures/documents justificatifs

### 4️⃣ Sécurité & Santé (HSE)
- [x] Accidents déclarés
- [x] Registre des incidents
- [x] Nombre d'employés sur site
- [x] Heures travaillées
- [x] Formations sécurité
- [x] Équipements de protection
- [x] Rapports d'inspection interne

### 5️⃣ Environnement
- [x] Étude d'impact environnemental
- [x] Plan de gestion environnementale
- [x] Gestion des déchets
- [x] Gestion des eaux usées
- [x] Émissions
- [x] Réhabilitation du site
- [x] Suivi de pollution

### 6️⃣ Conformité opérationnelle
- [x] Journal des opérations
- [x] Historique des validations
- [x] Audit trail complet
- [x] Horodatage automatique
- [x] Identification utilisateur

### 7️⃣ Traçabilité & Anti-fraude
- [x] Numéro de lot
- [x] Origine du minerai
- [x] Destination
- [x] Transporteur
- [x] Autorisation de transport
- [x] Chaîne de custody

---

## 🔐 Sécurité & Immuabilité

### ✅ Implémenté
- [x] MMG en **lecture seule** sur tous les endpoints
- [x] Permissions backend strictes (SAFE_METHODS uniquement)
- [x] Aucune route de création/édition pour MMG

### ⏳ À implémenter
- [ ] **Audit Trail Immutable**: Historique de chaque modification
  - Qui a modifié
  - Quand (horodatage)
  - Quoi (champ modifié)
  - Pourquoi (raison)
  - Avant/Après (versioning)

- [ ] **Statuts Verrouillés**: Certains statuts = non-modifiables
  - `APPROVED` → locked
  - `VALIDATED` → locked
  - `PUBLISHED` → locked
  - Seul ADMIN peut déverrouiller

- [ ] **Versioning**: Historique complet des modifications
  - Pas de suppression de données
  - Version n précédente toujours accessible
  - Comparaison avant/après

- [ ] **Endpoints d'Export**: Pour audit
  - `GET /reports/{id}/export_pdf/` → PDF audit
  - `GET /operations/{id}/export_pdf/` → PDF opération
  - `GET /incidents/{id}/export_pdf/` → PDF incident
  - `GET /personnel/{id}/export_pdf/` → PDF personnel
  - `GET /equipment/{id}/export_pdf/` → PDF équipement
  - `GET /environment/{id}/export_pdf/` → PDF données env
  - Tous les exports incluent l'audit trail

- [ ] **Signature Numérique** (Phase 2)
  - Documents signés par responsable
  - Empreinte (hash) pour détection de modification
  - Certificat d'authenticité

- [ ] **Rapport d'Audit Automatisé** (Phase 2)
  - Dashboard MMG avec violations détectées
  - Alertes incohérences (production vs fiscalité)
  - Alertes modifications suspectes

---

## 📋 Checklist d'implémentation

### Priority 1: Immédiat (Semaine 1)
- [ ] Créer model `AuditLog` pour historique immutable
- [ ] Ajouter signal Django pour tracer CHAQUE modification
- [ ] Créer endpoint `/audit-logs/` (MMG + ADMIN uniquement)
- [ ] Ajouter champs `created_by`, `updated_by`, `updated_at` à tous les modèles critiques

### Priority 2: Court terme (Semaine 2)
- [ ] Implémenter `status_locked` sur Report, Operation, Incident
- [ ] Créer endpoint export PDF pour chaque modèle
- [ ] Ajouter versioning (via `django-reversion`)
- [ ] Frontend: Afficher audit trail pour MMG

### Priority 3: Moyen terme (Semaine 3-4)
- [ ] Dashboard MMG avec statistiques d'audit
- [ ] Comparaison avant/après modifications
- [ ] Rapport d'incohérence (production vs taxes)
- [ ] Intégration signature numérique

---

## 🎯 Bénéfices

✅ **Conformité réglementaire** - MMG a l'audit trail complet  
✅ **Anti-fraude** - Historique immutable impossible à modifier  
✅ **Responsabilité** - Identification claire de qui a fait quoi  
✅ **Audit facile** - Export PDF automatique avec horodatage  
✅ **Transparence** - Données cohérentes et traçables  

---

## 🚀 Prochaines étapes

1. ✅ Permissions backend: **DONE**
2. ✅ Routes protégées frontend: **DONE**
3. ⏳ **AuditLog model + signals Django**
4. ⏳ **Endpoints export PDF**
5. ⏳ **Dashboard MMG**
6. ⏳ **Signature numérique**

