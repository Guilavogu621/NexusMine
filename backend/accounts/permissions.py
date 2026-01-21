"""
Permissions personnalisées basées sur les rôles NexusMine

Rôles et permissions:
- ADMIN: Accès complet (CRUD sur tout)
- SUPERVISOR: Gestion sites assignés, validation opérations
- OPERATOR: Saisie données (create/read), modification limitée
- ANALYST: Lecture seule + rapports
- REGULATOR: Lecture seule (audit/conformité)
"""
from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Accès réservé aux administrateurs"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role == 'ADMIN'
        )


class IsSupervisor(permissions.BasePermission):
    """Accès réservé aux superviseurs"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role == 'SUPERVISOR'
        )


class IsOperator(permissions.BasePermission):
    """Accès réservé aux opérateurs"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role == 'OPERATOR'
        )


class IsAnalyst(permissions.BasePermission):
    """Accès réservé aux analystes"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role == 'ANALYST'
        )


class IsRegulator(permissions.BasePermission):
    """Accès réservé aux autorités/gouvernement"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role == 'REGULATOR'
        )


class IsAdminOrSupervisor(permissions.BasePermission):
    """Accès pour Admin ou Superviseur"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role in ['ADMIN', 'SUPERVISOR']
        )


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Admin: accès complet
    Autres: lecture seule
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return request.user.role == 'ADMIN'


class IsSupervisorOrReadOnly(permissions.BasePermission):
    """
    Admin/Supervisor: accès complet
    Autres: lecture seule
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return request.user.role in ['ADMIN', 'SUPERVISOR']


class CanManageOperations(permissions.BasePermission):
    """
    Permissions pour les opérations minières:
    - ADMIN/SUPERVISOR: CRUD complet
    - OPERATOR: Créer et lire, modifier ses propres entrées
    - ANALYST/REGULATOR: Lecture seule
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Lecture pour tous les utilisateurs authentifiés
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Création pour Admin, Supervisor, Operator
        if request.method == 'POST':
            return request.user.role in ['ADMIN', 'SUPERVISOR', 'OPERATOR']
        
        # Modification/Suppression pour Admin et Supervisor
        return request.user.role in ['ADMIN', 'SUPERVISOR']
    
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        # Lecture pour tous
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Admin et Supervisor peuvent tout modifier
        if request.user.role in ['ADMIN', 'SUPERVISOR']:
            return True
        
        # Operator peut modifier ses propres entrées (si created_by existe)
        if request.user.role == 'OPERATOR':
            if hasattr(obj, 'created_by'):
                return obj.created_by == request.user
            if hasattr(obj, 'recorded_by'):
                return obj.recorded_by == request.user
        
        return False


class CanManageIncidents(permissions.BasePermission):
    """
    Permissions pour les incidents:
    - ADMIN/SUPERVISOR: CRUD complet
    - OPERATOR: Créer et signaler
    - ANALYST/REGULATOR: Lecture seule
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Tous sauf REGULATOR peuvent créer des incidents
        if request.method == 'POST':
            return request.user.role in ['ADMIN', 'SUPERVISOR', 'OPERATOR', 'ANALYST']
        
        # Modification/Suppression pour Admin et Supervisor uniquement
        return request.user.role in ['ADMIN', 'SUPERVISOR']


class CanManageReports(permissions.BasePermission):
    """
    Permissions pour les rapports:
    - ADMIN: CRUD complet
    - SUPERVISOR/ANALYST: Créer et lire
    - OPERATOR/REGULATOR: Lecture seule
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if request.method == 'POST':
            return request.user.role in ['ADMIN', 'SUPERVISOR', 'ANALYST']
        
        return request.user.role == 'ADMIN'


class CanManageAlerts(permissions.BasePermission):
    """
    Permissions pour les alertes:
    - ADMIN/SUPERVISOR: CRUD complet
    - Autres: Lecture seule
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return request.user.role in ['ADMIN', 'SUPERVISOR']


class CanManageUsers(permissions.BasePermission):
    """
    Permissions pour la gestion des utilisateurs:
    - ADMIN: CRUD complet
    - Autres: Lecture de son propre profil uniquement
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Seul l'admin peut lister tous les utilisateurs
        if view.action == 'list':
            return request.user.role == 'ADMIN'
        
        # L'action 'me' est accessible à tous
        if view.action == 'me':
            return True
        
        # Création d'utilisateur réservée à l'admin
        if request.method == 'POST':
            return request.user.role == 'ADMIN'
        
        return True
    
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        # Admin peut tout faire
        if request.user.role == 'ADMIN':
            return True
        
        # Les autres ne peuvent voir/modifier que leur propre profil
        return obj == request.user


# Dictionnaire des permissions par modèle pour référence rapide
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
    },
    'OPERATOR': {
        'users': ['read'],  # Son profil uniquement
        'sites': ['read'],
        'personnel': ['read'],
        'equipment': ['read', 'update'],  # État équipement
        'operations': ['create', 'read'],
        'incidents': ['create', 'read'],
        'environment': ['create', 'read'],
        'analytics': ['read'],
        'alerts': ['read'],
        'reports': ['read'],
    },
    'ANALYST': {
        'users': ['read'],  # Son profil uniquement
        'sites': ['read'],
        'personnel': ['read'],
        'equipment': ['read'],
        'operations': ['read'],
        'incidents': ['read'],
        'environment': ['read'],
        'analytics': ['create', 'read', 'update'],
        'alerts': ['read'],
        'reports': ['create', 'read'],
    },
    'REGULATOR': {
        'users': ['read'],  # Son profil uniquement
        'sites': ['read'],
        'personnel': ['read'],
        'equipment': ['read'],
        'operations': ['read'],
        'incidents': ['read'],
        'environment': ['read'],
        'analytics': ['read'],
        'alerts': ['read'],
        'reports': ['read'],
    },
}
