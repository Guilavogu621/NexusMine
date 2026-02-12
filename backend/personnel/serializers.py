from rest_framework import serializers
from .models import Personnel
from mining_sites.serializers import MiningSiteListSerializer


class PersonnelSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Personnel"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    approval_status_display = serializers.CharField(source='get_approval_status_display', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    site_name = serializers.CharField(source='site.name', read_only=True)
    submitted_by_name = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Personnel
        fields = [
            'id', 'employee_id', 'first_name', 'last_name', 'position',
            'role', 'role_display', 'department',
            'phone', 'email', 'emergency_contact', 'emergency_phone',
            'status', 'status_display', 'site', 'site_name',
            'hire_date', 'contract_end_date',
            'photo', 'photo_url',
            'notes',
            'approval_status', 'approval_status_display',
            'submitted_by', 'submitted_by_name',
            'approved_by', 'approved_by_name',
            'approval_date', 'rejection_reason',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at',
            'approval_status', 'submitted_by', 'approved_by',
            'approval_date', 'rejection_reason',
            'photo_url', 'role_display',
        ]

    def get_photo_url(self, obj):
        if obj.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None

    def get_submitted_by_name(self, obj):
        if obj.submitted_by:
            return f"{obj.submitted_by.first_name} {obj.submitted_by.last_name}"
        return None

    def get_approved_by_name(self, obj):
        if obj.approved_by:
            return f"{obj.approved_by.first_name} {obj.approved_by.last_name}"
        return None


class PersonnelListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes"""
    site_name = serializers.CharField(source='site.name', read_only=True)
    approval_status_display = serializers.CharField(source='get_approval_status_display', read_only=True)
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Personnel
        fields = ['id', 'employee_id', 'first_name', 'last_name', 'position',
                  'role', 'department', 'photo_url',
                  'site_name', 'status', 'approval_status', 'approval_status_display']

    def get_photo_url(self, obj):
        if obj.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None
