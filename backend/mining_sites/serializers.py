from rest_framework import serializers
from .models import MiningSite


class MiningSiteSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle MiningSite"""
    site_type_display = serializers.CharField(source='get_site_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = MiningSite
        fields = [
            'id', 'name', 'location', 'latitude', 'longitude',
            'site_type', 'site_type_display', 'status', 'status_display',
            'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MiningSiteListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes"""
    
    class Meta:
        model = MiningSite
        fields = ['id', 'name', 'location', 'site_type', 'status']
