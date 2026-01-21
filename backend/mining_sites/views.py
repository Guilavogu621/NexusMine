from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import MiningSite
from .serializers import MiningSiteSerializer, MiningSiteListSerializer
from accounts.permissions import IsAdminOrReadOnly


class MiningSiteViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des sites miniers
    
    Permissions:
    - ADMIN: CRUD complet
    - Autres: Lecture seule
    """
    queryset = MiningSite.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['site_type', 'status']
    search_fields = ['name', 'location']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MiningSiteListSerializer
        return MiningSiteSerializer
