from django.contrib import admin
from .models import Equipment


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ('equipment_code', 'name', 'equipment_type', 'status', 'site')
    list_filter = ('equipment_type', 'status', 'site')
    search_fields = ('equipment_code', 'name', 'manufacturer', 'serial_number')
    ordering = ('equipment_code',)
