from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Operation
from .serializers import OperationSerializer, OperationListSerializer
from accounts.permissions import CanManageOperations


class OperationViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des opérations
    
    Permissions:
    - ADMIN/SUPERVISOR: CRUD complet
    - OPERATOR: Créer et lire
    - ANALYST/REGULATOR: Lecture seule
    """
    queryset = Operation.objects.select_related('site', 'created_by', 'validated_by').prefetch_related('personnel', 'equipment').all()
    permission_classes = [permissions.IsAuthenticated, CanManageOperations]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['operation_type', 'status', 'site', 'date']
    search_fields = ['operation_code', 'description']
    ordering_fields = ['date', 'created_at', 'operation_code']
    ordering = ['-date']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return OperationListSerializer
        return OperationSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
