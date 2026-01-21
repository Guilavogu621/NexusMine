from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Incident
from .serializers import IncidentSerializer, IncidentListSerializer
from accounts.permissions import CanManageIncidents


class IncidentViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des incidents
    
    Permissions:
    - ADMIN/SUPERVISOR: CRUD complet
    - OPERATOR/ANALYST: Créer et lire
    - REGULATOR: Lecture seule
    """
    queryset = Incident.objects.select_related('site', 'reported_by').all()
    permission_classes = [permissions.IsAuthenticated, CanManageIncidents]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['incident_type', 'severity', 'status', 'site', 'date']
    search_fields = ['incident_code', 'description']
    ordering_fields = ['date', 'severity', 'created_at']
    ordering = ['-date']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return IncidentListSerializer
        return IncidentSerializer
    
    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)
