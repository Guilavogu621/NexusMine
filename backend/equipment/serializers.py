from rest_framework import serializers
from .models import Equipment, MaintenanceRecord, EquipmentTracking
from django.core.exceptions import ValidationError


class MaintenanceRecordSerializer(serializers.ModelSerializer):
    """Serializer pour l'historique de maintenance"""
    maintenance_type_display = serializers.CharField(
        source='get_maintenance_type_display', read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )
    equipment_code = serializers.CharField(
        source='equipment.equipment_code', read_only=True
    )
    performed_by_name = serializers.CharField(
        source='performed_by.email', read_only=True
    )
    
    class Meta:
        model = MaintenanceRecord
        fields = [
            'id', 'equipment', 'equipment_code', 'maintenance_code',
            'maintenance_type', 'maintenance_type_display',
            'status', 'status_display',
            'scheduled_date', 'start_date', 'end_date',
            'description', 'findings', 'actions_taken',
            'parts_replaced', 'cost', 'hours_at_maintenance',
            'performed_by', 'performed_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validation au niveau du serializer"""
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date:
            if start_date >= end_date:
                raise serializers.ValidationError({
                    'end_date': 'La date de fin doit être après la date de début.'
                })
        
        return data


class MaintenanceRecordListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes de maintenance"""
    equipment_code = serializers.CharField(source='equipment.equipment_code', read_only=True)
    maintenance_type_display = serializers.CharField(
        source='get_maintenance_type_display', read_only=True
    )
    
    class Meta:
        model = MaintenanceRecord
        fields = [
            'id', 'maintenance_code', 'equipment_code',
            'maintenance_type', 'maintenance_type_display',
            'status', 'scheduled_date', 'cost'
        ]


class EquipmentTrackingSerializer(serializers.ModelSerializer):
    """Serializer pour le suivi GPS en temps réel"""
    class Meta:
        model = EquipmentTracking
        fields = ['id', 'equipment', 'latitude', 'longitude', 'speed', 'timestamp']


class EquipmentSerializer(serializers.ModelSerializer):
    """Serializer complet pour le modèle Equipment"""
    equipment_type_display = serializers.CharField(
        source='get_equipment_type_display', read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )
    site_name = serializers.CharField(source='site.name', read_only=True)
    maintenance_records = MaintenanceRecordListSerializer(
        many=True, read_only=True
    )
    last_maintenance = serializers.SerializerMethodField()
    
    class Meta:
        model = Equipment
        fields = [
            'id', 'equipment_code', 'qr_code', 'name',
            'equipment_type', 'equipment_type_display',
            'status', 'status_display',
            'site', 'site_name',
            'manufacturer', 'model', 'serial_number', 'year_of_manufacture',
            'commissioning_date', 'last_maintenance_date', 'next_maintenance_date',
            'hours_operated', 'fuel_consumption_rate',
            'capacity', 'capacity_unit',
            'photo', 'notes',
            'last_latitude', 'last_longitude', 'current_speed', 'last_position_update',
            'maintenance_records', 'last_maintenance',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'qr_code', 'created_at', 'updated_at']
    
    def get_last_maintenance(self, obj):
        """Retourne la dernière maintenance effectuée"""
        last = obj.maintenance_records.filter(
            status='COMPLETED'
        ).order_by('-end_date').first()
        if last:
            return {
                'id': last.id,
                'code': last.maintenance_code,
                'type': last.maintenance_type,
                'date': last.end_date
            }
        return None


class EquipmentListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes"""
    site_name = serializers.CharField(source='site.name', read_only=True)
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )
    
    class Meta:
        model = Equipment
        fields = [
            'id', 'equipment_code', 'name', 'equipment_type',
            'status', 'status_display', 'site_name',
            'last_latitude', 'last_longitude', 'current_speed',
            'next_maintenance_date', 'hours_operated'
        ]


class EquipmentStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour mise à jour rapide du statut"""
    class Meta:
        model = Equipment
        fields = ['status', 'notes']
