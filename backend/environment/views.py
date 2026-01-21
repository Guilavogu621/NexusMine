from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import EnvironmentalData
from .serializers import EnvironmentalDataSerializer, EnvironmentalDataListSerializer
from accounts.permissions import CanManageOperations


class EnvironmentalDataViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des données environnementales
    
    Permissions:
    - ADMIN/SUPERVISOR: CRUD complet
    - OPERATOR: Créer et lire
    - ANALYST/REGULATOR: Lecture seule
    """
    queryset = EnvironmentalData.objects.select_related('site', 'recorded_by').all()
    permission_classes = [permissions.IsAuthenticated, CanManageOperations]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['data_type', 'site', 'measurement_date']
    search_fields = ['location_details', 'notes']
    ordering_fields = ['measurement_date', 'created_at']
    ordering = ['-measurement_date']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EnvironmentalDataListSerializer
        return EnvironmentalDataSerializer
    
    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)
