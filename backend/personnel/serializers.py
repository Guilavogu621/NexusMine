from rest_framework import serializers
from .models import Personnel
from mining_sites.serializers import MiningSiteListSerializer


class PersonnelSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Personnel"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    site_name = serializers.CharField(source='site.name', read_only=True)
    
    class Meta:
        model = Personnel
        fields = [
            'id', 'employee_id', 'first_name', 'last_name', 'position',
            'phone', 'email', 'status', 'status_display', 'site', 'site_name',
            'hire_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PersonnelListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes"""
    site_name = serializers.CharField(source='site.name', read_only=True)
    
    class Meta:
        model = Personnel
        fields = ['id', 'employee_id', 'first_name', 'last_name', 'position', 'site_name', 'status']
