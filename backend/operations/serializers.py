from rest_framework import serializers
from .models import Operation, WorkZone, Shift, OperationPhoto
from personnel.serializers import PersonnelListSerializer
from equipment.serializers import EquipmentListSerializer


class WorkZoneSerializer(serializers.ModelSerializer):
    """Serializer pour les zones de chantier"""
    site_name = serializers.CharField(source='site.name', read_only=True)
    
    class Meta:
        model = WorkZone
        fields = [
            'id', 'code', 'name', 'site', 'site_name',
            'gps_latitude', 'gps_longitude', 'zone_geojson',
            'description', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class WorkZoneListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes de zones"""
    class Meta:
        model = WorkZone
        fields = ['id', 'code', 'name', 'is_active']


class ShiftSerializer(serializers.ModelSerializer):
    """Serializer pour les rotations"""
    shift_type_display = serializers.CharField(
        source='get_shift_type_display', read_only=True
    )
    site_name = serializers.CharField(source='site.name', read_only=True)
    # 'supervisor' ici = chef de poste (champ de modèle, pas un rôle RBAC)
    supervisor_name = serializers.CharField(
        source='supervisor.full_name', read_only=True
    )
    personnel_count = serializers.IntegerField(
        source='personnel.count', read_only=True
    )
    
    class Meta:
        model = Shift
        fields = [
            'id', 'site', 'site_name', 'date',
            'shift_type', 'shift_type_display',
            'start_time', 'end_time',
            'supervisor', 'supervisor_name',
            'personnel', 'personnel_count',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class OperationPhotoSerializer(serializers.ModelSerializer):
    """Serializer pour les photos d'opération"""
    uploaded_by_name = serializers.CharField(
        source='uploaded_by.email', read_only=True
    )
    
    class Meta:
        model = OperationPhoto
        fields = [
            'id', 'operation', 'photo', 'caption',
            'taken_at', 'gps_latitude', 'gps_longitude',
            'uploaded_by', 'uploaded_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class OperationSerializer(serializers.ModelSerializer):
    """Serializer complet pour le modèle Operation"""
    operation_type_display = serializers.CharField(
        source='get_operation_type_display', read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )
    validation_status_display = serializers.CharField(
        source='get_validation_status_display', read_only=True
    )
    site_name = serializers.CharField(source='site.name', read_only=True)
    work_zone_name = serializers.CharField(
        source='work_zone.name', read_only=True
    )
    shift_info = serializers.CharField(
        source='shift.__str__', read_only=True
    )
    created_by_name = serializers.CharField(
        source='created_by.email', read_only=True
    )
    validated_by_name = serializers.CharField(
        source='validated_by.email', read_only=True
    )
    personnel_details = PersonnelListSerializer(
        source='personnel', many=True, read_only=True
    )
    equipment_details = EquipmentListSerializer(
        source='equipment', many=True, read_only=True
    )
    photos = OperationPhotoSerializer(many=True, read_only=True)
    
    class Meta:
        model = Operation
        fields = [
            'id', 'operation_code', 'operation_type', 'operation_type_display',
            'site', 'site_name', 'work_zone', 'work_zone_name',
            'shift', 'shift_info',
            'date', 'start_time', 'end_time',
            'status', 'status_display',
            'validation_status', 'validation_status_display',
            'validation_date', 'rejection_reason',
            'description',
            'quantity_extracted', 'quantity_transported', 'quantity_processed',
            'gps_latitude', 'gps_longitude', 'photo', 'photos',
            'personnel', 'personnel_details',
            'equipment', 'equipment_details',
            'created_by', 'created_by_name',
            'validated_by', 'validated_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'validation_date', 'validated_by',
            'created_at', 'updated_at'
        ]
    
    def validate(self, data):
        """Validation au niveau du serializer"""
        date = data.get('date')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        
        # Cas 1: Les deux horaires sont fournis
        if start_time and end_time:
            if start_time >= end_time:
                raise serializers.ValidationError({
                    'end_time': 'L\'heure de fin doit être après l\'heure de début.'
                })
        
        return data


class OperationListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes"""
    site_name = serializers.CharField(source='site.name', read_only=True)
    work_zone_name = serializers.CharField(source='work_zone.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    validation_status_display = serializers.CharField(
        source='get_validation_status_display', read_only=True
    )
    
    class Meta:
        model = Operation
        fields = [
            'id', 'operation_code', 'operation_type', 'site_name',
            'work_zone_name', 'date', 'status', 'status_display',
            'validation_status', 'validation_status_display',
            'quantity_extracted'
        ]


class OperationValidationSerializer(serializers.Serializer):
    """Serializer pour l'action de validation/rejet"""
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    rejection_reason = serializers.CharField(required=False, allow_blank=True)
