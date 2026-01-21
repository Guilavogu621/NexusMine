from django.contrib import admin
from .models import MiningSite


@admin.register(MiningSite)
class MiningSiteAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'site_type', 'status', 'created_at')
    list_filter = ('site_type', 'status')
    search_fields = ('name', 'location')
    ordering = ('name',)
