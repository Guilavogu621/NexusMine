"""
Serializers pour audit logs
"""

from rest_framework import serializers
from .audit import AuditLog, LockedStatus


class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer pour les journaux d'audit"""
    
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'action', 'action_display',
            'user', 'user_email', 'user_name',
            'content_type', 'object_id', 'object_label',
            'field_changed', 'old_value', 'new_value',
            'reason', 'timestamp', 'ip_address'
        ]
        read_only_fields = fields


class LockedStatusSerializer(serializers.ModelSerializer):
    """Serializer pour les statuts verrouillés"""
    
    locked_by_email = serializers.CharField(source='locked_by.email', read_only=True)
    locked_by_name = serializers.CharField(source='locked_by.get_full_name', read_only=True)
    
    class Meta:
        model = LockedStatus
        fields = [
            'id', 'content_type', 'object_id',
            'locked_status', 'reason',
            'locked_by', 'locked_by_email', 'locked_by_name',
            'locked_at'
        ]
        read_only_fields = fields
