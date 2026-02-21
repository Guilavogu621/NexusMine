from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum
from django.db.models.functions import TruncMonth, TruncDate
from django.utils import timezone
from datetime import date, timedelta
from .models import Operation, WorkZone, Shift, OperationPhoto
from .serializers import (
    OperationSerializer, OperationListSerializer, OperationValidationSerializer,
    WorkZoneSerializer, WorkZoneListSerializer,
    ShiftSerializer, OperationPhotoSerializer
)
from accounts.permissions import CanManageOperations
from accounts.mixins import SiteScopedMixin


class WorkZoneViewSet(SiteScopedMixin, viewsets.ModelViewSet):
    """ViewSet pour la gestion des zones de chantier"""
    site_field = 'site'
    queryset = WorkZone.objects.select_related('site').all()
    permission_classes = [permissions.IsAuthenticated, CanManageOperations]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['site', 'is_active']
    search_fields = ['code', 'name']
    ordering = ['site', 'code']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return WorkZoneListSerializer
        return WorkZoneSerializer


class ShiftViewSet(SiteScopedMixin, viewsets.ModelViewSet):
    """ViewSet pour la gestion des rotations"""
    site_field = 'site'
    queryset = Shift.objects.select_related('site', 'supervisor').all()
    permission_classes = [permissions.IsAuthenticated, CanManageOperations]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['site', 'date', 'shift_type']
    ordering = ['-date', 'shift_type']
    
    def get_serializer_class(self):
        return ShiftSerializer
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Récupère les rotations du jour"""
        from django.utils import timezone
        today = timezone.now().date()
        shifts = self.get_queryset().filter(date=today)
        serializer = ShiftSerializer(shifts, many=True)
        return Response(serializer.data)


class OperationViewSet(SiteScopedMixin, viewsets.ModelViewSet):
    """ViewSet pour la gestion des opérations

    Permissions:
    - ADMIN: CRUD complet (config technique)
    - SITE_MANAGER: Lancement officiel, validation, clôture
    - TECHNICIEN (ingénieur terrain): Création et lecture (saisie terrain)
    - ANALYST / MMG: Lecture seule
    Filtrage: Données filtrées par sites assignés
    """
    site_field = 'site'
    queryset = Operation.objects.select_related(
        'site', 'work_zone', 'shift', 'created_by', 'validated_by'
    ).prefetch_related('personnel', 'equipment', 'photos').all()
    permission_classes = [permissions.IsAuthenticated, CanManageOperations]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['operation_type', 'status', 'validation_status', 'site', 'work_zone', 'date']
    search_fields = ['operation_code', 'description']
    ordering_fields = ['date', 'created_at', 'operation_code']
    ordering = ['-date']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return OperationListSerializer
        if self.action == 'validate':
            return OperationValidationSerializer
        return OperationSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def validate(self, request, pk=None):
        """Valider ou rejeter une opération
        
        Seuls ADMIN et SITE_MANAGER peuvent valider/rejeter.
        SITE_MANAGER a l'autorité de lancement et validation.
        """
        if request.user.role not in ['ADMIN', 'SITE_MANAGER']:
            return Response(
                {'error': 'Seuls les administrateurs et responsables de site peuvent valider les opérations.'},
                status=status.HTTP_403_FORBIDDEN
            )
        operation = self.get_object()
        serializer = OperationValidationSerializer(data=request.data)
        
        if serializer.is_valid():
            action_type = serializer.validated_data['action']
            
            if action_type == 'approve':
                operation.approve(validated_by=request.user)
                return Response({
                    'status': 'approved',
                    'message': 'Opération approuvée'
                })
            elif action_type == 'reject':
                reason = serializer.validated_data.get('rejection_reason', '')
                if not reason:
                    return Response(
                        {'error': 'Le motif de rejet est requis'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                operation.reject(validated_by=request.user, reason=reason)
                return Response({
                    'status': 'rejected',
                    'message': 'Opération rejetée'
                })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def pending_validation(self, request):
        """Liste les opérations en attente de validation"""
        operations = self.get_queryset().filter(
            validation_status='PENDING',
            status='COMPLETED'
        )
        serializer = OperationListSerializer(operations, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_photo(self, request, pk=None):
        """Ajouter une photo à l'opération"""
        operation = self.get_object()
        
        photo_data = {
            'operation': operation.id,
            'photo': request.FILES.get('photo'),
            'caption': request.data.get('caption', ''),
            'gps_latitude': request.data.get('gps_latitude'),
            'gps_longitude': request.data.get('gps_longitude'),
        }
        
        serializer = OperationPhotoSerializer(data=photo_data)
        if serializer.is_valid():
            serializer.save(uploaded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def daily_summary(self, request):
        """Résumé quotidien des opérations"""
        from django.db.models import Sum, Count
        from django.utils import timezone
        
        date = request.query_params.get('date', timezone.now().date())
        site_id = request.query_params.get('site')
        
        queryset = self.get_queryset().filter(date=date)
        if site_id:
            queryset = queryset.filter(site_id=site_id)
        
        summary = queryset.aggregate(
            total_operations=Count('id'),
            total_extracted=Sum('quantity_extracted'),
            total_transported=Sum('quantity_transported'),
            total_processed=Sum('quantity_processed')
        )
        
        by_type = queryset.values('operation_type').annotate(
            count=Count('id'),
            quantity=Sum('quantity_extracted')
        )
        
        by_status = queryset.values('status').annotate(count=Count('id'))
        
        return Response({
            'date': str(date),
            'summary': summary,
            'by_type': list(by_type),
            'by_status': list(by_status)
        })

    @action(detail=False, methods=['get'])
    def dashboard_summary(self, request):
        """Résumé agrégé pour le dashboard (7 mois + 7 jours)"""
        today = timezone.now().date()

        # 7 derniers mois (incluant le mois courant)
        months = []
        for i in range(6, -1, -1):
            month = today.month - i
            year = today.year
            while month <= 0:
                month += 12
                year -= 1
            months.append((year, month))

        oldest_year, oldest_month = months[0]
        oldest_date = date(oldest_year, oldest_month, 1)

        monthly = (
            Operation.objects.filter(date__gte=oldest_date)
            .annotate(month=TruncMonth('date'))
            .values('month')
            .annotate(total=Sum('quantity_extracted'))
        )
        monthly_map = {m['month'].date(): (m['total'] or 0) for m in monthly}

        production_data = []
        for year, month in months:
            label = date(year, month, 1).strftime('%b')
            production_data.append({
                'name': label,
                'production': float(monthly_map.get(date(year, month, 1), 0)),
                'objectif': 1000,
            })

        # 7 derniers jours
        start_date = today - timedelta(days=6)
        daily = (
            Operation.objects.filter(date__gte=start_date, date__lte=today)
            .annotate(day=TruncDate('date'))
            .values('day')
            .annotate(
                extraction=Sum('quantity_extracted'),
                traitement=Sum('quantity_processed'),
                transport=Sum('quantity_transported')
            )
        )
        daily_map = {
            d['day']: {
                'extraction': float(d['extraction'] or 0),
                'traitement': float(d['traitement'] or 0),
                'transport': float(d['transport'] or 0),
            }
            for d in daily
        }

        weekly_operations = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            label = day.strftime('%a')
            values = daily_map.get(day, {'extraction': 0, 'traitement': 0, 'transport': 0})
            weekly_operations.append({
                'name': label,
                **values,
            })

        return Response({
            'production_data': production_data,
            'weekly_operations': weekly_operations,
        })
