from rest_framework import serializers
from .models import Alert, AlertRule, UserNotificationPreferences


class UserNotificationPreferencesSerializer(serializers.ModelSerializer):
    """Serializer pour les préférences de notification"""
    
    class Meta:
        model = UserNotificationPreferences
        fields = [
            'enabled_categories', 'enabled_severity_levels', 'enabled_alert_types',
            'max_alerts_per_hour', 'max_alerts_per_day',
            'group_by_category', 'group_by_site',
            'email_on_critical', 'push_notifications', 'sms_on_critical',
            'default_snooze_minutes', 'alerts_per_page',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


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
    """Serializer complet pour le modèle Alert"""
    alert_type_display = serializers.CharField(source='get_alert_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    site_name = serializers.CharField(source='site.name', read_only=True)
    indicator_name = serializers.CharField(source='indicator.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.email', read_only=True)
    dismissed_by_name = serializers.CharField(source='dismissed_by.email', read_only=True)
    
    class Meta:
        model = Alert
        fields = [
            'id', 'alert_type', 'alert_type_display',
            'category', 'category_display',
            'severity', 'severity_display',
            'status', 'status_display',
            'priority_order', 'is_dismissed', 'dismissed_at', 'dismissed_by', 'dismissed_by_name',
            'snoozed_until', 'expires_at', 'dedupe_key',
            'title', 'message',
            'indicator', 'indicator_name', 'site', 'site_name',
            'assigned_to', 'assigned_to_name',
            'email_sent', 'sms_sent', 'push_sent',
            'generated_at', 'read_at', 'resolved_at', 'resolved_by', 'resolution_notes'
        ]
        read_only_fields = ['id', 'generated_at', 'dedupe_key']


class AlertListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes d'alertes"""
    alert_type_display = serializers.CharField(source='get_alert_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    site_name = serializers.CharField(source='site.name', read_only=True)
    
    class Meta:
        model = Alert
        fields = [
            'id', 'alert_type', 'alert_type_display',
            'category', 'category_display',
            'severity', 'severity_display',
            'status', 'status_display',
            'priority_order', 'is_dismissed',
            'snoozed_until', 'expires_at',
            'title', 'message',
            'site', 'site_name',
            'generated_at'
        ]
        read_only_fields = ['id', 'generated_at']
