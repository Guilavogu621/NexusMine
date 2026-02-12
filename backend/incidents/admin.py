from django.contrib import admin
from .models import Incident, IncidentPhoto, IncidentFollowUp


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ('incident_code', 'incident_type', 'severity', 'site', 'date', 'status')
    list_filter = ('incident_type', 'severity', 'status', 'site')
    search_fields = ('incident_code', 'description')
    ordering = ('-date',)


@admin.register(IncidentPhoto)
class IncidentPhotoAdmin(admin.ModelAdmin):
    list_display = ('incident', 'caption', 'taken_at', 'created_at')
    list_filter = ('incident',)
    search_fields = ('caption',)
    ordering = ('-created_at',)


@admin.register(IncidentFollowUp)
class IncidentFollowUpAdmin(admin.ModelAdmin):
    list_display = ('incident', 'status', 'due_date', 'completed_date')
    list_filter = ('status',)
    search_fields = ('action_description',)
    ordering = ('due_date',)
