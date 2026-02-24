from rest_framework import serializers
from .models import MiningSite, DistributedNode


class MiningSiteSerializer(serializers.ModelSerializer):
    """Serializer complet pour le modèle MiningSite"""
    site_type_display = serializers.CharField(source='get_site_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    mineral_type_display = serializers.CharField(source='get_mineral_type_display', read_only=True)
    
    personnel_count = serializers.IntegerField(read_only=True)
    equipment_count = serializers.IntegerField(read_only=True)
    incidents_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = MiningSite
        fields = [
            'id', 'code', 'name', 
            'mineral_type', 'mineral_type_display',
            'region', 'prefecture', 'location',
            'latitude', 'longitude', 'concession_geojson', 'surface_area',
            'site_type', 'site_type_display', 
            'status', 'status_display',
            'operator_name', 'description',
            'geological_reserve', 'geology_risk_index',
            'license_date', 'license_expiry',
            'personnel_count', 'equipment_count', 'incidents_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DistributedNodeSerializer(serializers.ModelSerializer):
    """Serializer pour les nœuds d'intelligence locale"""
    site_name = serializers.ReadOnlyField(source='site.name')

    class Meta:
        model = DistributedNode
        fields = [
            'id', 'site', 'site_name', 'node_id', 'ip_address', 
            'status', 'last_sync', 'cpu_usage', 'memory_usage', 'ai_model_version'
        ]


class MiningSiteListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes"""
    mineral_type_display = serializers.CharField(source='get_mineral_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    personnel_count = serializers.IntegerField(read_only=True)
    equipment_count = serializers.IntegerField(read_only=True)
    incidents_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = MiningSite
        fields = [
            'id', 'code', 'name', 'region', 'prefecture',
            'mineral_type', 'mineral_type_display',
            'site_type', 'status', 'status_display',
            'operator_name', 'latitude', 'longitude',
            'personnel_count', 'equipment_count', 'incidents_count'
        ]
