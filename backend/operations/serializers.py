from rest_framework import serializers
from .models import Operation
from personnel.serializers import PersonnelListSerializer
from equipment.serializers import EquipmentListSerializer


class OperationSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Operation"""
    operation_type_display = serializers.CharField(source='get_operation_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    site_name = serializers.CharField(source='site.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.email', read_only=True)
    personnel_details = PersonnelListSerializer(source='personnel', many=True, read_only=True)
    equipment_details = EquipmentListSerializer(source='equipment', many=True, read_only=True)
    
    class Meta:
        model = Operation
        fields = [
            'id', 'operation_code', 'operation_type', 'operation_type_display',
            'site', 'site_name', 'date', 'start_time', 'end_time',
            'status', 'status_display', 'description', 'quantity_extracted',
            'personnel', 'personnel_details', 'equipment', 'equipment_details',
            'created_by', 'created_by_name', 'validated_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class OperationListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes"""
    site_name = serializers.CharField(source='site.name', read_only=True)
    
    class Meta:
        model = Operation
        fields = ['id', 'operation_code', 'operation_type', 'site_name', 'date', 'status', 'quantity_extracted']
