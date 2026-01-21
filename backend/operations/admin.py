from django.contrib import admin
from .models import Operation


@admin.register(Operation)
class OperationAdmin(admin.ModelAdmin):
    list_display = ('operation_code', 'operation_type', 'site', 'date', 'status', 'quantity_extracted')
    list_filter = ('operation_type', 'status', 'site', 'date')
    search_fields = ('operation_code', 'description')
    filter_horizontal = ('personnel', 'equipment')
    ordering = ('-date',)
