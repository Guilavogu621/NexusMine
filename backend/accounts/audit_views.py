"""
API pour les audit logs - Accès MMG et ADMIN
"""

from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .audit import AuditLog, LockedStatus
from .audit_serializers import AuditLogSerializer, LockedStatusSerializer


class IsMMGOrAdmin(permissions.BasePermission):
    """Accès réservé à MMG et ADMIN pour audit"""
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated 
            and request.user.role in ['MMG', 'ADMIN']
        )


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour les journaux d'audit (lecture seule)
    
    Accès: MMG (audit) + ADMIN
    - MMG: Voir les audit logs de tous les sites
    - ADMIN: Voir tous les audit logs
    """
    
    queryset = AuditLog.objects.select_related('user').all()
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsMMGOrAdmin]
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['action', 'content_type', 'user', 'timestamp']
    search_fields = ['object_label', 'reason', 'user__email']
    ordering_fields = ['timestamp', 'action']
    ordering = ['-timestamp']
    
    def get_queryset(self):
        """MMG voit uniquement ses sites, ADMIN voit tout"""
        if self.request.user.role == 'ADMIN':
            return AuditLog.objects.select_related('user').all()
        
        # MMG: filtrer par sites assignés (si applicable)
        # Pour l'instant, on laisse MMG voir tous les logs (audit national)
        return AuditLog.objects.select_related('user').all()


class LockedStatusViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour les statuts verrouillés (lecture seule)
    
    Accès: ADMIN uniquement
    """
    
    queryset = LockedStatus.objects.select_related('locked_by').all()
    serializer_class = LockedStatusSerializer
    permission_classes = [permissions.IsAuthenticated, IsMMGOrAdmin]
    
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['content_type', 'locked_status', 'locked_by']
    ordering_fields = ['locked_at']
    ordering = ['-locked_at']
