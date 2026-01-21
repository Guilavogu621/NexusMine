from django.contrib import admin
from .models import Indicator


@admin.register(Indicator)
class IndicatorAdmin(admin.ModelAdmin):
    list_display = ('name', 'indicator_type', 'site', 'calculated_value', 'target_value', 'unit')
    list_filter = ('indicator_type', 'site')
    search_fields = ('name', 'description')
    ordering = ('site', 'name')
