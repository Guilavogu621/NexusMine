from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Equipment
from .serializers import EquipmentSerializer, EquipmentListSerializer
from accounts.permissions import IsSupervisorOrReadOnly


class EquipmentViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des équipements
    
    Permissions:
    - ADMIN/SUPERVISOR: CRUD complet
    - Autres: Lecture seule
    """
    queryset = Equipment.objects.select_related('site').all()
    permission_classes = [permissions.IsAuthenticated, IsSupervisorOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['equipment_type', 'status', 'site']
    search_fields = ['equipment_code', 'name', 'manufacturer', 'serial_number']
    ordering_fields = ['equipment_code', 'name', 'created_at']
    ordering = ['equipment_code']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EquipmentListSerializer
        return EquipmentSerializer
