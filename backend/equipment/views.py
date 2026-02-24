from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from django.utils import timezone
from .models import Equipment, MaintenanceRecord, EquipmentTracking
from .serializers import (
    EquipmentSerializer, EquipmentListSerializer,
    EquipmentStatusUpdateSerializer,
    MaintenanceRecordSerializer, MaintenanceRecordListSerializer,
    EquipmentTrackingSerializer
)
from accounts.permissions import CanManageEquipment
from accounts.mixins import SiteScopedMixin


class EquipmentViewSet(SiteScopedMixin, viewsets.ModelViewSet):
    """ViewSet pour la gestion des équipements

    Permissions:
    - ADMIN: CRUD complet
    - SITE_MANAGER: CRUD sur équipements de son site
    - TECHNICIEN (ingénieur terrain): Mise à jour statut équipement
    - Autres: Lecture seule
    Filtrage: Données filtrées par sites assignés
    """
    site_field = 'site'
    queryset = Equipment.objects.select_related('site').all()
    permission_classes = [permissions.IsAuthenticated, CanManageEquipment]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['equipment_type', 'status', 'site']
    search_fields = ['equipment_code', 'name', 'manufacturer', 'serial_number', 'qr_code']
    ordering_fields = ['equipment_code', 'name', 'created_at', 'next_maintenance_date']
    ordering = ['equipment_code']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EquipmentListSerializer
        if self.action == 'update_status':
            return EquipmentStatusUpdateSerializer
        if self.action == 'update_tracking':
            return EquipmentTrackingSerializer
        return EquipmentSerializer
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Mise à jour rapide du statut d'un équipement"""
        equipment = self.get_object()
        serializer = EquipmentStatusUpdateSerializer(
            equipment, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(EquipmentSerializer(equipment).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def update_tracking(self, request, pk=None):
        """Mise à jour de la position GPS en temps réel"""
        equipment = self.get_object()
        lat = request.data.get('latitude')
        lon = request.data.get('longitude')
        speed = request.data.get('speed', 0.0)

        if lat is None or lon is None:
            return Response(
                {"error": "Latitude et Longitude sont requises"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mettre à jour l'équipement
        equipment.last_latitude = lat
        equipment.last_longitude = lon
        equipment.current_speed = speed
        equipment.last_position_update = timezone.now()
        equipment.save()

        # Enregistrer dans l'historique
        tracking = EquipmentTracking.objects.create(
            equipment=equipment,
            latitude=lat,
            longitude=lon,
            speed=speed
        )
        
        # BROADCASH REAL-TIME (Simulé ou via Channels si configuré)
        # self.broadcast_position(equipment)

        return Response(EquipmentTrackingSerializer(tracking).data)
    
    @action(detail=True, methods=['get'])
    def maintenance_history(self, request, pk=None):
        """Récupère l'historique de maintenance d'un équipement"""
        equipment = self.get_object()
        records = equipment.maintenance_records.all()
        serializer = MaintenanceRecordListSerializer(records, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def needing_maintenance(self, request):
        """Liste les équipements nécessitant une maintenance prochaine"""
        from django.utils import timezone
        from datetime import timedelta
        
        today = timezone.now().date()
        threshold = today + timedelta(days=7)  # Maintenance dans les 7 jours
        
        equipment = Equipment.objects.filter(
            next_maintenance_date__lte=threshold,
            status__in=['OPERATIONAL', 'MAINTENANCE']
        ).order_by('next_maintenance_date')
        
        serializer = EquipmentListSerializer(equipment, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_qr_code(self, request):
        """Recherche un équipement par QR code"""
        qr_code = request.query_params.get('code')
        if not qr_code:
            return Response(
                {"error": "Le paramètre 'code' est requis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            equipment = Equipment.objects.get(qr_code=qr_code)
            serializer = EquipmentSerializer(equipment)
            return Response(serializer.data)
        except Equipment.DoesNotExist:
            return Response(
                {"error": "Équipement non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def status_summary(self, request):
        """Résumé des équipements par statut (pour dashboard)"""
        counts = (
            Equipment.objects.values('status')
            .annotate(total=Count('id'))
        )
        return Response(list(counts))


class MaintenanceRecordViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des enregistrements de maintenance"""
    queryset = MaintenanceRecord.objects.select_related(
        'equipment', 'performed_by'
    ).all()
    permission_classes = [permissions.IsAuthenticated, CanManageEquipment]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['equipment', 'maintenance_type', 'status']
    search_fields = ['maintenance_code', 'description']
    ordering_fields = ['scheduled_date', 'created_at']
    ordering = ['-scheduled_date']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MaintenanceRecordListSerializer
        return MaintenanceRecordSerializer
    
    def perform_create(self, serializer):
        # Mettre à jour la date de dernière maintenance sur l'équipement
        maintenance = serializer.save()
        if maintenance.status == 'COMPLETED' and maintenance.end_date:
            equipment = maintenance.equipment
            equipment.last_maintenance_date = maintenance.end_date.date()
            equipment.save(update_fields=['last_maintenance_date'])
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Marquer une maintenance comme terminée"""
        from django.utils import timezone
        
        record = self.get_object()
        record.status = 'COMPLETED'
        record.end_date = timezone.now()
        record.performed_by = request.user
        
        if 'findings' in request.data:
            record.findings = request.data['findings']
        if 'actions_taken' in request.data:
            record.actions_taken = request.data['actions_taken']
        if 'parts_replaced' in request.data:
            record.parts_replaced = request.data['parts_replaced']
        if 'cost' in request.data:
            record.cost = request.data['cost']
        
        record.save()
        
        # Mettre à jour l'équipement
        equipment = record.equipment
        equipment.last_maintenance_date = record.end_date.date()
        if equipment.status == 'MAINTENANCE':
            equipment.status = 'OPERATIONAL'
        equipment.save()
        
        return Response(MaintenanceRecordSerializer(record).data)
