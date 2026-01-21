from django.contrib import admin
from .models import Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'report_type', 'status', 'site', 'period_start', 'period_end')
    list_filter = ('report_type', 'status', 'site')
    search_fields = ('title', 'content', 'summary')
    ordering = ('-created_at',)
