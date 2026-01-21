from django.contrib import admin
from .models import Personnel


@admin.register(Personnel)
class PersonnelAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'last_name', 'first_name', 'position', 'site', 'status')
    list_filter = ('status', 'site', 'position')
    search_fields = ('employee_id', 'first_name', 'last_name', 'position')
    ordering = ('last_name', 'first_name')
