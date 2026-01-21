from django.contrib import admin
from .models import EnvironmentalData


@admin.register(EnvironmentalData)
class EnvironmentalDataAdmin(admin.ModelAdmin):
    list_display = ('data_type', 'value', 'unit', 'site', 'measurement_date')
    list_filter = ('data_type', 'site', 'measurement_date')
    search_fields = ('location_details', 'notes')
    ordering = ('-measurement_date',)
