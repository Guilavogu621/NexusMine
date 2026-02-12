from django.contrib import admin
from .models import StockLocation, StockMovement, StockSummary


@admin.register(StockLocation)
class StockLocationAdmin(admin.ModelAdmin):
	list_display = ('code', 'name', 'site', 'location_type', 'capacity', 'is_active')
	list_filter = ('site', 'location_type', 'is_active')
	search_fields = ('code', 'name')
	ordering = ('site', 'code')


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
	list_display = ('movement_code', 'movement_type', 'location', 'mineral_type', 'quantity', 'date')
	list_filter = ('movement_type', 'mineral_type', 'date')
	search_fields = ('movement_code',)
	ordering = ('-date',)


@admin.register(StockSummary)
class StockSummaryAdmin(admin.ModelAdmin):
	list_display = ('site', 'mineral_type', 'current_stock', 'last_updated')
	list_filter = ('site', 'mineral_type')
	ordering = ('-last_updated',)
