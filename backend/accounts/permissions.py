"""
Permissions personnalisées basées sur les rôles NexusMine


Rôles (5 au total):
- ADMIN       : Administrateur de la plateforme (config, utilisateurs, système)
- SITE_MANAGER: Responsable de site minier (autorité légale, vision multi-sites)
- TECHNICIEN  : Technicien/Opérateur (saisie terrain, exécution technique)
- ANALYST     : Analyste (données, performance, risques, KPIs)
- MMG         : Ministère des Mines et de la Géologie (audit, conformité)

Chaîne de responsabilité:
    Terrain → TECHNICIEN
    Décision site → SITE_MANAGER
    Analyse → ANALYST
    Contrôle réglementaire → MMG
    Système → ADMIN
"""
from rest_framework import permissions


# ============================================================================
# PERMISSIONS PAR RÔLE INDIVIDUEL
# ============================================================================

class IsAdmin(permissions.BasePermission):
    """Accès réservé aux administrateurs de la plateforme"""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'ADMIN'
        )


class IsSiteManager(permissions.BasePermission):
    """Accès réservé aux responsables de site minier"""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'SITE_MANAGER'
        )





class IsAnalyst(permissions.BasePermission):
    """Accès réservé aux analystes"""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'ANALYST'
        )


class IsMMG(permissions.BasePermission):
    """Accès réservé aux autorités MMG"""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'MMG'
        )


# ============================================================================
# PERMISSIONS COMBINÉES
# ============================================================================

class IsAdminOrSiteManager(permissions.BasePermission):
    """Accès pour Admin ou Responsable de site"""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in ['ADMIN', 'SITE_MANAGER']
        )





class IsAdminOrReadOnly(permissions.BasePermission):
    """Admin: accès complet — Autres: lecture seule"""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == 'ADMIN'





# ============================================================================
# PERMISSIONS MÉTIER
# ============================================================================

class CanManageUsers(permissions.BasePermission):
    """
    Gestion des utilisateurs:
    - ADMIN: CRUD complet
    - Autres: Lecture de son propre profil uniquement
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if view.action == 'list':
            return request.user.role == 'ADMIN'
        if view.action == 'me':
            return True
        if request.method == 'POST':
            return request.user.role == 'ADMIN'
        return True

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        if request.user.role == 'ADMIN':
            return True
        return obj == request.user


class CanManageSites(permissions.BasePermission):
    """
    Gestion des sites miniers:
    - ADMIN: CRUD complet
    - SITE_MANAGER: Peut modifier son site assigné (autorité locale)
    - Autres: Lecture sites assignés
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.method == 'POST':
            return request.user.role == 'ADMIN'
        # PUT/PATCH
        return request.user.role in ['ADMIN', 'SITE_MANAGER']

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.role == 'ADMIN':
            return True
        if request.user.role == 'SITE_MANAGER':
            return obj in request.user.assigned_sites.all()
        return False


class CanManageOperations(permissions.BasePermission):
    """
    Opérations minières:
    - ADMIN: CRUD complet
    - SITE_MANAGER: Lancement officiel, validation, clôture
    - TECHNICIEN: Créer et lire (saisie terrain)
    - ANALYST / MMG: Lecture seule
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.method == 'POST':
            return request.user.role in [
                'ADMIN', 'SITE_MANAGER', 'TECHNICIEN',
            ]
        return request.user.role in ['ADMIN', 'SITE_MANAGER']

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.role in ['ADMIN', 'SITE_MANAGER']:
            return True
        if request.user.role == 'TECHNICIEN':
            if hasattr(obj, 'created_by'):
                return obj.created_by == request.user
            if hasattr(obj, 'recorded_by'):
                return obj.recorded_by == request.user
        return False


class CanManageIncidents(permissions.BasePermission):
    """
    Incidents:
    - ADMIN: Configuration système
    - SITE_MANAGER: Déclaration, gestion, clôture (premier responsable légal)
    - TECHNICIEN: Signalement (création + lecture)
    - ANALYST: Lecture + analyse post-incident
    - MMG: Lecture seule (audit incidents majeurs)
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.method == 'POST':
            return request.user.role in [
                'ADMIN', 'SITE_MANAGER', 'TECHNICIEN',
            ]
        return request.user.role in ['ADMIN', 'SITE_MANAGER']


class CanManageAlerts(permissions.BasePermission):
    """
    Alertes:
    - ADMIN: Configuration système
    - SITE_MANAGER: Déclenchement et clôture des alertes
    - Autres: Lecture seule
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role in ['ADMIN', 'SITE_MANAGER']


class CanManageReports(permissions.BasePermission):
    """
    Rapports:
    - ADMIN: CRUD complet
    - SITE_MANAGER: Validation des rapports du site
    - ANALYST: Création rapports d'analyse
    - TECHNICIEN / MMG: Lecture seule
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.method == 'POST':
            return request.user.role in [
                'ADMIN', 'SITE_MANAGER', 'ANALYST', 'TECHNICIEN',
            ]
        return request.user.role in ['ADMIN', 'SITE_MANAGER']


class CanManageStock(permissions.BasePermission):
    """
    Stocks:
    - ADMIN: Configuration système
    - SITE_MANAGER: Validation stocks et inventaires
    - TECHNICIEN: Enregistrement extraction
    - ANALYST / MMG: Lecture seule
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.method == 'POST':
            return request.user.role in [
                'ADMIN', 'TECHNICIEN',
            ]
        return request.user.role in ['ADMIN', 'SITE_MANAGER']


class CanManagePersonnel(permissions.BasePermission):
    """
    Personnel:
    - ADMIN: CRUD complet
    - SITE_MANAGER: CRUD personnel de son site
    - Autres: Lecture seule
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role in ['ADMIN', 'SITE_MANAGER']


class CanManageEquipment(permissions.BasePermission):
    """
    Équipements:
    - ADMIN: CRUD complet
    - SITE_MANAGER: CRUD équipements de son site
    - TECHNICIEN: Mise à jour statut équipement
    - Autres: Lecture seule
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.method in ['POST', 'DELETE']:
            return request.user.role in ['ADMIN', 'SITE_MANAGER']
        # PUT/PATCH: inclut TECHNICIEN pour mise à jour statut
        return request.user.role in [
            'ADMIN', 'SITE_MANAGER', 'TECHNICIEN',
        ]


class CanManageEnvironment(permissions.BasePermission):
    """
    Données environnementales:
    - ADMIN: Configuration système
    - SITE_MANAGER: Application mesures correctives
    - TECHNICIEN: Collecte terrain
    - MMG: Vérification conformité
    - Autres: Lecture
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.method == 'POST':
            return request.user.role in [
                'ADMIN', 'TECHNICIEN',
            ]
        return request.user.role in ['ADMIN', 'SITE_MANAGER']


class CanManageAnalytics(permissions.BasePermission):
    """
    Indicateurs et analyses:
    - ADMIN: Configuration système
    - ANALYST: Définition KPI, création analyses
    - SITE_MANAGER: Consultation et suivi KPIs de ses sites
    - Autres: Lecture limitée
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        # L'analyste peut créer/modifier mais PAS supprimer
        if request.method == 'DELETE':
            return request.user.role == 'ADMIN'
        return request.user.role in ['ADMIN', 'ANALYST']


# ============================================================================
# MATRICE DE RÉFÉRENCE
# ============================================================================

ROLE_PERMISSIONS = {
    'ADMIN': {
        'users': ['create', 'read', 'update', 'delete'],
        'sites': ['create', 'read', 'update', 'delete'],
        'personnel': ['create', 'read', 'update', 'delete'],
        'equipment': ['create', 'read', 'update', 'delete'],
        'operations': ['create', 'read', 'update', 'delete'],
        'incidents': ['create', 'read', 'update', 'delete'],
        'environment': ['create', 'read', 'update', 'delete'],
        'analytics': ['create', 'read', 'update', 'delete'],
        'alerts': ['create', 'read', 'update', 'delete'],
        'reports': ['create', 'read', 'update', 'delete'],
        'stock': ['create', 'read', 'update', 'delete'],
    },
    'SITE_MANAGER': {
        'users': ['read'],
        'sites': ['read', 'update'],
        'personnel': ['create', 'read', 'update'],
        'equipment': ['create', 'read', 'update'],
        'operations': ['create', 'read', 'update', 'delete', 'validate', 'launch'],
        'incidents': ['create', 'read', 'update', 'delete', 'close'],
        'environment': ['read', 'update', 'corrective_actions'],
        'analytics': ['read'],
        'alerts': ['create', 'read', 'update', 'delete', 'trigger', 'close'],
        'reports': ['create', 'read', 'validate'],
        'stock': ['read', 'update', 'validate_inventory'],
    },
    'TECHNICIEN': {
        'users': ['read'],
        'sites': ['read'],
        'personnel': ['read'],
        'equipment': ['read', 'update'],
        'operations': ['create', 'read'],
        'incidents': ['create', 'read'],
        'environment': ['create', 'read'],
        'analytics': ['read'],
        'alerts': ['read'],
        'reports': ['read'],
        'stock': ['create', 'read'],
    },
    'ANALYST': {
        'users': ['read'],
        'sites': ['read'],
        'personnel': ['read'],
        'equipment': ['read'],
        'operations': ['read'],
        'incidents': ['read'],
        'environment': ['read'],
        'analytics': ['create', 'read', 'update'],
        'alerts': ['read'],
        'reports': ['create', 'read'],
        'stock': ['read'],
    },
    'MMG': {
        'users': ['read'],
        'sites': ['read'],
        'personnel': ['read'],
        'equipment': ['read'],
        'operations': ['read'],
        'incidents': ['read'],
        'environment': ['read'],
        'analytics': ['read'],
        'alerts': ['read'],
        'reports': ['read'],
        'stock': ['read'],
    },
}
