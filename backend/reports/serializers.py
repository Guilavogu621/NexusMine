from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Report"""
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    site_name = serializers.CharField(source='site.name', read_only=True)
    generated_by_name = serializers.CharField(source='generated_by.email', read_only=True)
    validated_by_name = serializers.CharField(source='validated_by.email', read_only=True)
    
    class Meta:
        model = Report
        fields = [
            'id', 'title', 'report_type', 'report_type_display',
            'status', 'status_display', 'site', 'site_name',
            'period_start', 'period_end', 'content', 'summary', 'file',
            'generated_by', 'generated_by_name', 'validated_by', 'validated_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ReportListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes"""
    site_name = serializers.CharField(source='site.name', read_only=True)
    
    class Meta:
        model = Report
        fields = ['id', 'title', 'report_type', 'status', 'site_name', 'period_start', 'period_end']
