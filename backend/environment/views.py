from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import EnvironmentalData, EnvironmentalThreshold, EnvironmentalReport
from .serializers import (
    EnvironmentalDataSerializer, EnvironmentalDataListSerializer,
    EnvironmentalThresholdSerializer, EnvironmentalReportSerializer
)
from accounts.permissions import CanManageEnvironment
from accounts.mixins import SiteScopedMixin


class EnvironmentalThresholdViewSet(SiteScopedMixin, viewsets.ModelViewSet):
    """ViewSet pour la gestion des seuils environnementaux"""
    site_field = 'site'
    queryset = EnvironmentalThreshold.objects.select_related('site').all()
    permission_classes = [permissions.IsAuthenticated, CanManageEnvironment]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['data_type', 'threshold_type', 'site', 'is_active']
    search_fields = ['name', 'regulatory_reference']
    ordering_fields = ['data_type', 'name']
    ordering = ['data_type', 'name']

    def get_serializer_class(self):
        return EnvironmentalThresholdSerializer


class EnvironmentalDataViewSet(SiteScopedMixin, viewsets.ModelViewSet):
    """ViewSet pour la gestion des données environnementales
    
    Permissions:
    - ADMIN: Configuration système
    - SITE_MANAGER: Application mesures correctives
    - SUPERVISOR: Collecte et saisie
    - OPERATOR: Collecte terrain
    - MMG: Vérification conformité réglementaire
    Filtrage: Données filtrées par sites assignés
    """
    site_field = 'site'
    queryset = EnvironmentalData.objects.select_related('site', 'recorded_by', 'threshold').all()
    permission_classes = [permissions.IsAuthenticated, CanManageEnvironment]
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

    @action(detail=False, methods=['get'])
    def non_compliant(self, request):
        """Lister les mesures non conformes"""
        queryset = self.get_queryset().filter(is_compliant=False)
        serializer = EnvironmentalDataListSerializer(queryset, many=True)
        return Response(serializer.data)


class EnvironmentalReportViewSet(SiteScopedMixin, viewsets.ReadOnlyModelViewSet):
    """ViewSet pour la consultation des rapports environnementaux"""
    site_field = 'site'
    queryset = EnvironmentalReport.objects.select_related('site', 'generated_by').all()
    serializer_class = EnvironmentalReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['site', 'report_period', 'start_date', 'end_date']
    ordering = ['-end_date']
