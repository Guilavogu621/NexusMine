from rest_framework import serializers
from .models import Alert, AlertRule


class AlertRuleSerializer(serializers.ModelSerializer):
    """Serializer pour les règles d'alerte"""
    alert_type_display = serializers.CharField(source='get_alert_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)

    class Meta:
        model = AlertRule
        fields = [
            'id', 'name', 'description',
            'alert_type', 'alert_type_display',
            'severity', 'severity_display',
            'conditions', 'sites', 'notify_users', 'notify_roles',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AlertSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Alert"""
    alert_type_display = serializers.CharField(source='get_alert_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    site_name = serializers.CharField(source='site.name', read_only=True)
    indicator_name = serializers.CharField(source='indicator.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.email', read_only=True)
    related_incident_code = serializers.CharField(source='related_incident.incident_code', read_only=True)
    related_environmental_id = serializers.IntegerField(source='related_environmental_data.id', read_only=True)
    related_equipment_code = serializers.CharField(source='related_equipment.equipment_code', read_only=True)
    
    class Meta:
        model = Alert
        fields = [
            'id', 'alert_type', 'alert_type_display', 'severity', 'severity_display',
            'status', 'status_display', 'title', 'message',
            'indicator', 'indicator_name', 'site', 'site_name',
            'related_incident', 'related_incident_code',
            'related_environmental_data', 'related_environmental_id',
            'related_equipment', 'related_equipment_code',
            'assigned_to', 'assigned_to_name',
            'email_sent', 'sms_sent', 'push_sent',
            'generated_at', 'read_at', 'resolved_at', 'resolved_by', 'resolution_notes'
        ]
        read_only_fields = ['id', 'generated_at']


class AlertListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes"""
    site_name = serializers.CharField(source='site.name', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    
    class Meta:
        model = Alert
        fields = [
            'id', 'title', 'alert_type',
            'severity', 'severity_display',
            'status', 'site_name', 'generated_at'
        ]
