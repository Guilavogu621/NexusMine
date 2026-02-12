"""
Permissions personnalisées basées sur les rôles NexusMine

Rôles (6 au total):
- ADMIN       : Administrateur de la plateforme (config, utilisateurs, système)
- SITE_MANAGER: Responsable de site minier (autorité légale, vision multi-sites)
- SUPERVISOR  : Gestionnaire de Site (supervision opérationnelle quotidienne)
- OPERATOR    : Technicien/Opérateur (saisie terrain, exécution technique)
- ANALYST     : Analyste (données, performance, risques, KPIs)
- MMG         : Ministère des Mines et de la Géologie (audit, conformité)

Chaîne de responsabilité:
  Terrain → OPERATOR
  Décision site → SITE_MANAGER
  Supervision quotidienne → SUPERVISOR
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


class IsSupervisor(permissions.BasePermission):
    """Accès réservé aux gestionnaires de site"""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'SUPERVISOR'
        )


class IsOperator(permissions.BasePermission):
    """Accès réservé aux techniciens/opérateurs"""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'OPERATOR'
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


class IsAdminOrSupervisor(permissions.BasePermission):
    """Accès pour Admin ou Superviseur"""

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in ['ADMIN', 'SUPERVISOR']
        )


class IsAdminOrReadOnly(permissions.BasePermission):
    """Admin: accès complet — Autres: lecture seule"""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == 'ADMIN'


class IsSiteManagerOrSupervisorOrReadOnly(permissions.BasePermission):
    """
    ADMIN / SITE_MANAGER / SUPERVISOR : accès complet
    Autres : lecture seule
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role in ['ADMIN', 'SITE_MANAGER', 'SUPERVISOR']


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
    - SUPERVISOR: Lecture + mise à jour limitée
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
        return request.user.role in ['ADMIN', 'SITE_MANAGER', 'SUPERVISOR']

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.role == 'ADMIN':
            return True
        if request.user.role in ['SITE_MANAGER', 'SUPERVISOR']:
            return obj in request.user.assigned_sites.all()
        return False


class CanManageOperations(permissions.BasePermission):
    """
    Opérations minières:
    - ADMIN: CRUD complet
    - SITE_MANAGER: Lancement officiel, validation, clôture
    - SUPERVISOR: CRUD opérations de ses sites
    - OPERATOR: Créer et lire (saisie terrain)
    - ANALYST / MMG: Lecture seule
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.method == 'POST':
            return request.user.role in [
                'ADMIN', 'SITE_MANAGER', 'SUPERVISOR', 'OPERATOR',
            ]
        return request.user.role in ['ADMIN', 'SITE_MANAGER', 'SUPERVISOR']

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.role in ['ADMIN', 'SITE_MANAGER', 'SUPERVISOR']:
            return True
        if request.user.role == 'OPERATOR':
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
    - SUPERVISOR: Gestion incidents de ses sites
    - OPERATOR: Signalement (création + lecture)
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
                'ADMIN', 'SITE_MANAGER', 'SUPERVISOR', 'OPERATOR',
            ]
        return request.user.role in ['ADMIN', 'SITE_MANAGER', 'SUPERVISOR']


class CanManageAlerts(permissions.BasePermission):
    """
    Alertes:
    - ADMIN: Configuration système
    - SITE_MANAGER: Déclenchement et clôture des alertes
    - SUPERVISOR: Gestion alertes de ses sites
    - Autres: Lecture seule
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role in ['ADMIN', 'SITE_MANAGER', 'SUPERVISOR']


class CanManageReports(permissions.BasePermission):
    """
    Rapports:
    - ADMIN: CRUD complet
    - SITE_MANAGER: Validation des rapports du site
    - SUPERVISOR: Création + lecture
    - ANALYST: Création rapports d'analyse
    - OPERATOR / MMG: Lecture seule
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.method == 'POST':
            return request.user.role in [
                'ADMIN', 'SITE_MANAGER', 'SUPERVISOR', 'ANALYST',
            ]
        return request.user.role in ['ADMIN', 'SITE_MANAGER']


class CanManageStock(permissions.BasePermission):
    """
    Stocks:
    - ADMIN: Configuration système
    - SITE_MANAGER: Validation stocks et inventaires
    - SUPERVISOR: Enregistrement entrées/sorties, inventaires
    - OPERATOR: Enregistrement extraction
    - ANALYST / MMG: Lecture seule
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.method == 'POST':
            return request.user.role in [
                'ADMIN', 'SUPERVISOR', 'OPERATOR',
            ]
        return request.user.role in ['ADMIN', 'SITE_MANAGER', 'SUPERVISOR']


class CanManagePersonnel(permissions.BasePermission):
    """
    Personnel:
    - ADMIN: CRUD complet
    - SITE_MANAGER: CRUD personnel de son site
    - SUPERVISOR: CRUD personnel de son site
    - Autres: Lecture seule
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role in ['ADMIN', 'SITE_MANAGER', 'SUPERVISOR']


class CanManageEquipment(permissions.BasePermission):
    """
    Équipements:
    - ADMIN: CRUD complet
    - SITE_MANAGER: CRUD équipements de son site
    - SUPERVISOR: CRUD équipements de son site
    - OPERATOR: Mise à jour statut équipement
    - Autres: Lecture seule
    """

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.method in ['POST', 'DELETE']:
            return request.user.role in ['ADMIN', 'SITE_MANAGER', 'SUPERVISOR']
        # PUT/PATCH: inclut OPERATOR pour mise à jour statut
        return request.user.role in [
            'ADMIN', 'SITE_MANAGER', 'SUPERVISOR', 'OPERATOR',
        ]


class CanManageEnvironment(permissions.BasePermission):
    """
    Données environnementales:
    - ADMIN: Configuration système
    - SITE_MANAGER: Application mesures correctives
    - SUPERVISOR: Collecte et saisie
    - OPERATOR: Collecte terrain
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
                'ADMIN', 'SUPERVISOR', 'OPERATOR',
            ]
        return request.user.role in ['ADMIN', 'SITE_MANAGER', 'SUPERVISOR']


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
    'SUPERVISOR': {
        'users': ['read'],
        'sites': ['read', 'update'],
        'personnel': ['create', 'read', 'update'],
        'equipment': ['create', 'read', 'update'],
        'operations': ['create', 'read', 'update', 'delete'],
        'incidents': ['create', 'read', 'update', 'delete'],
        'environment': ['create', 'read', 'update'],
        'analytics': ['read'],
        'alerts': ['create', 'read', 'update', 'delete'],
        'reports': ['create', 'read'],
        'stock': ['create', 'read', 'update'],
    },
    'OPERATOR': {
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
