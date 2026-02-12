from django.contrib import admin
from .models import Equipment, MaintenanceRecord


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ('equipment_code', 'name', 'equipment_type', 'status', 'site')
    list_filter = ('equipment_type', 'status', 'site')
    search_fields = ('equipment_code', 'name', 'manufacturer', 'serial_number')
    ordering = ('equipment_code',)


@admin.register(MaintenanceRecord)
class MaintenanceRecordAdmin(admin.ModelAdmin):
    list_display = ('maintenance_code', 'equipment', 'maintenance_type', 'status', 'scheduled_date')
    list_filter = ('maintenance_type', 'status')
    search_fields = ('maintenance_code', 'description')
    ordering = ('-scheduled_date',)
