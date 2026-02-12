from rest_framework import serializers
from .models import MiningSite


class MiningSiteSerializer(serializers.ModelSerializer):
    """Serializer complet pour le modèle MiningSite"""
    site_type_display = serializers.CharField(source='get_site_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    mineral_type_display = serializers.CharField(source='get_mineral_type_display', read_only=True)
    
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
            'license_date', 'license_expiry',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MiningSiteListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes"""
    mineral_type_display = serializers.CharField(source='get_mineral_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = MiningSite
        fields = [
            'id', 'code', 'name', 'region', 'prefecture',
            'mineral_type', 'mineral_type_display',
            'site_type', 'status', 'status_display',
            'operator_name', 'latitude', 'longitude'
        ]
