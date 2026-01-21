from django.contrib import admin
from .models import Incident


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ('incident_code', 'incident_type', 'severity', 'site', 'date', 'status')
    list_filter = ('incident_type', 'severity', 'status', 'site')
    search_fields = ('incident_code', 'description')
    ordering = ('-date',)
