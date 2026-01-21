from rest_framework import serializers
from .models import EnvironmentalData


class EnvironmentalDataSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle EnvironmentalData"""
    data_type_display = serializers.CharField(source='get_data_type_display', read_only=True)
    site_name = serializers.CharField(source='site.name', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.email', read_only=True)
    
    class Meta:
        model = EnvironmentalData
        fields = [
            'id', 'data_type', 'data_type_display', 'site', 'site_name',
            'value', 'unit', 'measurement_date', 'measurement_time',
            'location_details', 'notes', 'recorded_by', 'recorded_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EnvironmentalDataListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes"""
    site_name = serializers.CharField(source='site.name', read_only=True)
    
    class Meta:
        model = EnvironmentalData
        fields = ['id', 'data_type', 'value', 'unit', 'site_name', 'measurement_date']
