from rest_framework import serializers
from .models import Equipment


class EquipmentSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Equipment"""
    equipment_type_display = serializers.CharField(source='get_equipment_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    site_name = serializers.CharField(source='site.name', read_only=True)
    
    class Meta:
        model = Equipment
        fields = [
            'id', 'equipment_code', 'name', 'equipment_type', 'equipment_type_display',
            'status', 'status_display', 'site', 'site_name', 'commissioning_date',
            'manufacturer', 'model', 'serial_number', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EquipmentListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes"""
    site_name = serializers.CharField(source='site.name', read_only=True)
    
    class Meta:
        model = Equipment
        fields = ['id', 'equipment_code', 'name', 'equipment_type', 'status', 'site_name']
