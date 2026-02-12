from rest_framework import serializers
from .models import StockLocation, StockMovement, StockSummary


class StockLocationSerializer(serializers.ModelSerializer):
    """Serializer pour les emplacements de stockage"""
    site_name = serializers.CharField(source='site.name', read_only=True)
    location_type_display = serializers.CharField(
        source='get_location_type_display', read_only=True
    )
    current_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = StockLocation
        fields = [
            'id', 'code', 'name', 'site', 'site_name',
            'location_type', 'location_type_display',
            'capacity', 'current_stock',
            'gps_latitude', 'gps_longitude',
            'description', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_current_stock(self, obj):
        return float(obj.get_current_stock())


class StockLocationListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes"""
    site_name = serializers.CharField(source='site.name', read_only=True)
    current_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = StockLocation
        fields = [
            'id', 'code', 'name', 'site_name',
            'location_type', 'capacity', 'current_stock', 'is_active'
        ]
    
    def get_current_stock(self, obj):
        return float(obj.get_current_stock())


class StockMovementSerializer(serializers.ModelSerializer):
    """Serializer pour les mouvements de stock"""
    movement_type_display = serializers.CharField(
        source='get_movement_type_display', read_only=True
    )
    mineral_type_display = serializers.CharField(
        source='get_mineral_type_display', read_only=True
    )
    location_name = serializers.CharField(
        source='location.name', read_only=True
    )
    destination_location_name = serializers.CharField(
        source='destination_location.name', read_only=True
    )
    operation_code = serializers.CharField(
        source='operation.operation_code', read_only=True
    )
    created_by_name = serializers.CharField(
        source='created_by.email', read_only=True
    )
    
    class Meta:
        model = StockMovement
        fields = [
            'id', 'movement_code', 'movement_type', 'movement_type_display',
            'location', 'location_name',
            'destination_location', 'destination_location_name',
            'mineral_type', 'mineral_type_display',
            'quantity', 'grade', 'date',
            'operation', 'operation_code',
            'destination', 'transport_reference',
            'notes', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class StockMovementListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes"""
    location_name = serializers.CharField(source='location.name', read_only=True)
    movement_type_display = serializers.CharField(
        source='get_movement_type_display', read_only=True
    )
    
    class Meta:
        model = StockMovement
        fields = [
            'id', 'movement_code', 'movement_type', 'movement_type_display',
            'location_name', 'mineral_type', 'quantity', 'date'
        ]


class StockSummarySerializer(serializers.ModelSerializer):
    """Serializer pour la synthèse des stocks"""
    site_name = serializers.CharField(source='site.name', read_only=True)
    mineral_type_display = serializers.CharField(
        source='get_mineral_type_display', read_only=True
    )
    
    class Meta:
        model = StockSummary
        fields = [
            'id', 'site', 'site_name',
            'mineral_type', 'mineral_type_display',
            'initial_stock', 'total_extracted', 'total_expedited',
            'current_stock', 'last_updated'
        ]
        read_only_fields = ['id', 'last_updated']


class StockDashboardSerializer(serializers.Serializer):
    """Serializer pour le dashboard des stocks"""
    site_id = serializers.IntegerField()
    site_name = serializers.CharField()
    mineral_type = serializers.CharField()
    initial_stock = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_extracted = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_expedited = serializers.DecimalField(max_digits=14, decimal_places=2)
    current_stock = serializers.DecimalField(max_digits=14, decimal_places=2)
