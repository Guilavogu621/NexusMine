from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Personnel
from .serializers import PersonnelSerializer, PersonnelListSerializer
from accounts.permissions import IsSupervisorOrReadOnly


class PersonnelViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion du personnel
    
    Permissions:
    - ADMIN/SUPERVISOR: CRUD complet
    - Autres: Lecture seule
    """
    queryset = Personnel.objects.select_related('site').all()
    permission_classes = [permissions.IsAuthenticated, IsSupervisorOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'site', 'position']
    search_fields = ['employee_id', 'first_name', 'last_name', 'position']
    ordering_fields = ['last_name', 'first_name', 'created_at']
    ordering = ['last_name', 'first_name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PersonnelListSerializer
        return PersonnelSerializer
