from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from decimal import Decimal

from .models import StockLocation, StockMovement, StockSummary
from .serializers import (
    StockLocationSerializer, StockLocationListSerializer,
    StockMovementSerializer, StockMovementListSerializer,
    StockSummarySerializer
)
from accounts.permissions import CanManageStock
from accounts.mixins import SiteScopedMixin


class StockLocationViewSet(SiteScopedMixin, viewsets.ModelViewSet):
    """ViewSet pour la gestion des emplacements de stockage

    Permissions:
    - ADMIN: Configuration système
    - SITE_MANAGER: Validation inventaires
    - TECHNICIEN (ingénieur terrain): Enregistrement extraction
    - Autres: Lecture seule
    """
    site_field = 'site'
    queryset = StockLocation.objects.all()
    permission_classes = [IsAuthenticated, CanManageStock]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return StockLocationListSerializer
        return StockLocationSerializer


class StockMovementViewSet(SiteScopedMixin, viewsets.ModelViewSet):
    """ViewSet pour la gestion des mouvements de stock"""
    site_field = 'location__site'
    queryset = StockMovement.objects.all()
    permission_classes = [IsAuthenticated, CanManageStock]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return StockMovementListSerializer
        return StockMovementSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtres
        site_id = self.request.query_params.get('site')
        if site_id:
            queryset = queryset.filter(location__site_id=site_id)
        
        location_id = self.request.query_params.get('location')
        if location_id:
            queryset = queryset.filter(location_id=location_id)
        
        movement_type = self.request.query_params.get('type')
        if movement_type:
            queryset = queryset.filter(movement_type=movement_type)
        
        mineral_type = self.request.query_params.get('mineral')
        if mineral_type:
            queryset = queryset.filter(mineral_type=mineral_type)
        
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        
        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def by_site(self, request):
        """Récupère les mouvements agrégés par site"""
        from django.db.models import Q
        
        site_id = request.query_params.get('site')
        if not site_id:
            return Response(
                {"error": "Le paramètre 'site' est requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        movements = StockMovement.objects.filter(location__site_id=site_id)
        
        # Agrégation par type de minerai
        result = {}
        for mineral in StockMovement.MineralType.choices:
            mineral_code = mineral[0]
            mineral_movements = movements.filter(mineral_type=mineral_code)
            
            initial = mineral_movements.filter(
                movement_type='INITIAL'
            ).aggregate(total=Sum('quantity'))['total'] or Decimal('0')
            
            extracted = mineral_movements.filter(
                movement_type='EXTRACTION'
            ).aggregate(total=Sum('quantity'))['total'] or Decimal('0')
            
            expedited = mineral_movements.filter(
                movement_type='EXPEDITION'
            ).aggregate(total=Sum('quantity'))['total'] or Decimal('0')
            
            current = initial + extracted - expedited
            
            if current > 0 or extracted > 0:
                result[mineral_code] = {
                    'mineral_type': mineral_code,
                    'mineral_name': mineral[1],
                    'initial_stock': float(initial),
                    'total_extracted': float(extracted),
                    'total_expedited': float(expedited),
                    'current_stock': float(current)
                }
        
        return Response(list(result.values()))


class StockSummaryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet lecture seule pour les synthèses de stock"""
    queryset = StockSummary.objects.all()
    serializer_class = StockSummarySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        site_id = self.request.query_params.get('site')
        if site_id:
            queryset = queryset.filter(site_id=site_id)
        return queryset
    
    @action(detail=False, methods=['post'])
    def recalculate_all(self, request):
        """Recalcule toutes les synthèses de stock (ADMIN uniquement)"""
        if request.user.role != 'ADMIN':
            return Response(
                {'error': 'Seul l\'administrateur peut recalculer les synthèses.'},
                status=status.HTTP_403_FORBIDDEN
            )
        for summary in StockSummary.objects.all():
            summary.recalculate()
        return Response({"message": "Synthèses recalculées"})
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Données pour le dashboard des stocks"""
        from mining_sites.models import MiningSite
        
        result = []
        for site in MiningSite.objects.filter(status='ACTIVE'):
            for mineral in StockMovement.MineralType.choices:
                summary, created = StockSummary.objects.get_or_create(
                    site=site,
                    mineral_type=mineral[0],
                    defaults={
                        'initial_stock': 0,
                        'total_extracted': 0,
                        'total_expedited': 0,
                        'current_stock': 0
                    }
                )
                if summary.current_stock > 0 or summary.total_extracted > 0:
                    result.append({
                        'site_id': site.id,
                        'site_name': site.name,
                        'mineral_type': mineral[0],
                        'mineral_name': mineral[1],
                        'initial_stock': float(summary.initial_stock),
                        'total_extracted': float(summary.total_extracted),
                        'total_expedited': float(summary.total_expedited),
                        'current_stock': float(summary.current_stock)
                    })
        
        return Response(result)
