from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Alert
from .serializers import AlertSerializer, AlertListSerializer
from accounts.permissions import CanManageAlerts


class AlertViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des alertes
    
    Permissions:
    - ADMIN/SUPERVISOR: CRUD complet
    - Autres: Lecture seule
    """
    queryset = Alert.objects.select_related('site', 'indicator', 'assigned_to').all()
    permission_classes = [permissions.IsAuthenticated, CanManageAlerts]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['alert_type', 'priority', 'status', 'site']
    search_fields = ['title', 'message']
    ordering_fields = ['generated_at', 'priority']
    ordering = ['-generated_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return AlertListSerializer
        return AlertSerializer
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Marquer une alerte comme lue"""
        alert = self.get_object()
        alert.status = 'READ'
        alert.read_at = timezone.now()
        alert.save()
        return Response({'status': 'Alerte marquée comme lue'})
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Résoudre une alerte"""
        alert = self.get_object()
        alert.status = 'RESOLVED'
        alert.resolved_at = timezone.now()
        alert.save()
        return Response({'status': 'Alerte résolue'})
