from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Indicator
from .serializers import IndicatorSerializer, IndicatorListSerializer
from accounts.permissions import IsAdminOrReadOnly


class IndicatorViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des indicateurs (KPIs)
    
    Permissions:
    - ADMIN: CRUD complet
    - Autres: Lecture seule
    """
    queryset = Indicator.objects.select_related('site').all()
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['indicator_type', 'site']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return IndicatorListSerializer
        return IndicatorSerializer
