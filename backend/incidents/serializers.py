from rest_framework import serializers
from .models import Incident


class IncidentSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Incident"""
    incident_type_display = serializers.CharField(source='get_incident_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    site_name = serializers.CharField(source='site.name', read_only=True)
    reported_by_name = serializers.CharField(source='reported_by.email', read_only=True)
    
    class Meta:
        model = Incident
        fields = [
            'id', 'incident_code', 'incident_type', 'incident_type_display',
            'site', 'site_name', 'date', 'time', 'severity', 'severity_display',
            'status', 'status_display', 'description', 'actions_taken',
            'reported_by', 'reported_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class IncidentListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes"""
    site_name = serializers.CharField(source='site.name', read_only=True)
    
    class Meta:
        model = Incident
        fields = ['id', 'incident_code', 'incident_type', 'severity', 'site_name', 'date', 'status']
