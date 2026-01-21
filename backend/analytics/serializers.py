from rest_framework import serializers
from .models import Indicator


class IndicatorSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Indicator"""
    indicator_type_display = serializers.CharField(source='get_indicator_type_display', read_only=True)
    site_name = serializers.CharField(source='site.name', read_only=True)
    
    class Meta:
        model = Indicator
        fields = [
            'id', 'name', 'indicator_type', 'indicator_type_display',
            'description', 'site', 'site_name', 'calculated_value',
            'target_value', 'unit', 'threshold_warning', 'threshold_critical',
            'calculation_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class IndicatorListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes"""
    site_name = serializers.CharField(source='site.name', read_only=True)
    
    class Meta:
        model = Indicator
        fields = ['id', 'name', 'indicator_type', 'site_name', 'calculated_value', 'target_value', 'unit']
