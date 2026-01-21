from django.contrib import admin
from .models import Alert


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('title', 'alert_type', 'priority', 'status', 'site', 'generated_at')
    list_filter = ('alert_type', 'priority', 'status', 'site')
    search_fields = ('title', 'message')
    ordering = ('-generated_at',)
