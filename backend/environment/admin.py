from django.contrib import admin
from .models import EnvironmentalData, EnvironmentalThreshold, EnvironmentalReport


@admin.register(EnvironmentalData)
class EnvironmentalDataAdmin(admin.ModelAdmin):
    list_display = ('data_type', 'value', 'unit', 'site', 'measurement_date')
    list_filter = ('data_type', 'site', 'measurement_date')
    search_fields = ('location_details', 'notes')
    ordering = ('-measurement_date',)


@admin.register(EnvironmentalThreshold)
class EnvironmentalThresholdAdmin(admin.ModelAdmin):
    list_display = ('name', 'data_type', 'threshold_type', 'site', 'is_active')
    list_filter = ('data_type', 'threshold_type', 'site', 'is_active')
    search_fields = ('name', 'regulatory_reference')
    ordering = ('data_type', 'name')


@admin.register(EnvironmentalReport)
class EnvironmentalReportAdmin(admin.ModelAdmin):
    list_display = ('site', 'report_period', 'start_date', 'end_date', 'created_at')
    list_filter = ('report_period', 'site')
    ordering = ('-end_date',)
