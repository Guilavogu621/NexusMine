from rest_framework import serializers
from .models import Alert


class AlertSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Alert"""
    alert_type_display = serializers.CharField(source='get_alert_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    site_name = serializers.CharField(source='site.name', read_only=True)
    indicator_name = serializers.CharField(source='indicator.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.email', read_only=True)
    
    class Meta:
        model = Alert
        fields = [
            'id', 'alert_type', 'alert_type_display', 'priority', 'priority_display',
            'status', 'status_display', 'title', 'message',
            'indicator', 'indicator_name', 'site', 'site_name',
            'assigned_to', 'assigned_to_name', 'generated_at', 'read_at', 'resolved_at'
        ]
        read_only_fields = ['id', 'generated_at']


class AlertListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes"""
    site_name = serializers.CharField(source='site.name', read_only=True)
    
    class Meta:
        model = Alert
        fields = ['id', 'title', 'alert_type', 'priority', 'status', 'site_name', 'generated_at']
