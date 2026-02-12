from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Alert, AlertRule
from .serializers import AlertSerializer, AlertListSerializer, AlertRuleSerializer
from accounts.permissions import CanManageAlerts
from accounts.mixins import SiteScopedMixin


class AlertRuleViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des règles d'alertes"""
    queryset = AlertRule.objects.prefetch_related('sites', 'notify_users').all()
    permission_classes = [permissions.IsAuthenticated, CanManageAlerts]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['alert_type', 'severity', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name']
    ordering = ['name']

    def get_serializer_class(self):
        return AlertRuleSerializer


class AlertViewSet(SiteScopedMixin, viewsets.ModelViewSet):
    """ViewSet pour la gestion des alertes
    
    Permissions:
    - ADMIN: Configuration système
    - SITE_MANAGER: Déclenchement, clôture (autorité décisionnelle)
    - SUPERVISOR: Gestion alertes de ses sites
    - Autres: Lecture seule
    Filtrage: Données filtrées par sites assignés
    """
    site_field = 'site'
    queryset = Alert.objects.select_related(
        'site', 'indicator', 'assigned_to',
        'related_incident', 'related_environmental_data', 'related_equipment'
    ).all()
    permission_classes = [permissions.IsAuthenticated, CanManageAlerts]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['alert_type', 'severity', 'status', 'site']
    search_fields = ['title', 'message']
    ordering_fields = ['generated_at', 'severity']
    ordering = ['-generated_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return AlertListSerializer
        return AlertSerializer
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Marquer une alerte comme lue"""
        alert = self.get_object()
        alert.mark_as_read(user=request.user)
        return Response({'status': 'Alerte marquée comme lue'})
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Résoudre une alerte (ADMIN, SITE_MANAGER, SUPERVISOR uniquement)"""
        if request.user.role not in ['ADMIN', 'SITE_MANAGER', 'SUPERVISOR']:
            return Response(
                {'error': 'Permission insuffisante pour résoudre cette alerte.'},
                status=status.HTTP_403_FORBIDDEN
            )
        alert = self.get_object()
        notes = request.data.get('notes', '')
        alert.resolve(user=request.user, notes=notes)
        return Response({'status': 'Alerte résolue'})

    @action(detail=True, methods=['post'])
    def send_notifications(self, request, pk=None):
        """Déclencher l'envoi des notifications"""
        alert = self.get_object()
        alert.send_notifications()
        return Response({'status': 'Notifications envoyées'})
