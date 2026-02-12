from django.contrib import admin
from .models import Alert, AlertRule


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('title', 'alert_type', 'severity', 'status', 'site', 'generated_at')
    list_filter = ('alert_type', 'severity', 'status', 'site')
    search_fields = ('title', 'message')
    ordering = ('-generated_at',)
    readonly_fields = ('generated_at', 'read_at', 'resolved_at')


@admin.register(AlertRule)
class AlertRuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'alert_type', 'severity', 'is_active')
    list_filter = ('alert_type', 'severity', 'is_active')
    search_fields = ('name', 'description')
    filter_horizontal = ('sites', 'notify_users')
