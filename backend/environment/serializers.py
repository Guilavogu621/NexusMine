from rest_framework import serializers
from .models import EnvironmentalData, EnvironmentalThreshold, EnvironmentalReport


class EnvironmentalThresholdSerializer(serializers.ModelSerializer):
    """Serializer pour les seuils environnementaux"""
    data_type_display = serializers.CharField(source='get_data_type_display', read_only=True)
    threshold_type_display = serializers.CharField(source='get_threshold_type_display', read_only=True)
    site_name = serializers.CharField(source='site.name', read_only=True)

    class Meta:
        model = EnvironmentalThreshold
        fields = [
            'id', 'name', 'data_type', 'data_type_display',
            'threshold_type', 'threshold_type_display',
            'site', 'site_name',
            'min_value', 'max_value', 'warning_min', 'warning_max',
            'unit', 'regulatory_reference', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EnvironmentalDataSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle EnvironmentalData"""
    data_type_display = serializers.CharField(source='get_data_type_display', read_only=True)
    site_name = serializers.CharField(source='site.name', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.email', read_only=True)
    threshold_info = EnvironmentalThresholdSerializer(source='threshold', read_only=True)
    
    class Meta:
        model = EnvironmentalData
        fields = [
            'id', 'data_type', 'data_type_display', 'site', 'site_name',
            'gps_latitude', 'gps_longitude',
            'value', 'unit', 'measurement_date', 'measurement_time',
            'location_details',
            'threshold', 'threshold_info',
            'is_compliant', 'alert_generated',
            'notes', 'recorded_by', 'recorded_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EnvironmentalDataListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes"""
    site_name = serializers.CharField(source='site.name', read_only=True)
    data_type_display = serializers.CharField(source='get_data_type_display', read_only=True)
    
    class Meta:
        model = EnvironmentalData
        fields = [
            'id', 'data_type', 'data_type_display', 'value', 'unit',
            'site_name', 'measurement_date', 'is_compliant'
        ]


class EnvironmentalReportSerializer(serializers.ModelSerializer):
    """Serializer pour les rapports environnementaux"""
    site_name = serializers.CharField(source='site.name', read_only=True)
    report_period_display = serializers.CharField(source='get_report_period_display', read_only=True)
    generated_by_name = serializers.CharField(source='generated_by.email', read_only=True)

    class Meta:
        model = EnvironmentalReport
        fields = [
            'id', 'site', 'site_name', 'report_period', 'report_period_display',
            'start_date', 'end_date',
            'total_measurements', 'compliant_count', 'non_compliant_count',
            'summary', 'recommendations', 'report_file',
            'generated_by', 'generated_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
