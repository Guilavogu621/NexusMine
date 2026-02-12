from django.contrib import admin
from .models import Operation, WorkZone, Shift, OperationPhoto


@admin.register(Operation)
class OperationAdmin(admin.ModelAdmin):
    list_display = ('operation_code', 'operation_type', 'site', 'date', 'status', 'quantity_extracted')
    list_filter = ('operation_type', 'status', 'site', 'date')
    search_fields = ('operation_code', 'description')
    filter_horizontal = ('personnel', 'equipment')
    ordering = ('-date',)


@admin.register(WorkZone)
class WorkZoneAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'site', 'is_active')
    list_filter = ('site', 'is_active')
    search_fields = ('code', 'name')
    ordering = ('site', 'code')


@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ('site', 'date', 'shift_type', 'start_time', 'end_time')
    list_filter = ('site', 'shift_type', 'date')
    ordering = ('-date', 'shift_type')


@admin.register(OperationPhoto)
class OperationPhotoAdmin(admin.ModelAdmin):
    list_display = ('operation', 'caption', 'created_at')
    list_filter = ('operation',)
    ordering = ('-created_at',)
