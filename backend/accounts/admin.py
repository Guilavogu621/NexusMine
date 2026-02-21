from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User
from .audit import AuditLog, LockedStatus


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'phone', 'is_active', 'is_staff')
    list_filter = ('role', 'is_active', 'is_staff', 'assigned_sites')
    search_fields = ('email', 'first_name', 'last_name', 'phone')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informations personnelles', {'fields': ('first_name', 'last_name', 'phone', 'profile_photo')}),
        ('Rôle et affectation', {'fields': ('role', 'assigned_sites')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Dates', {'fields': ('created_at', 'updated_at')}),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'phone', 'role', 'assigned_sites', 'password1', 'password2'),
        }),
    )
    
    filter_horizontal = ('assigned_sites', 'groups', 'user_permissions')


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'action', 'content_type', 'object_label', 'user', 'timestamp')
    list_filter = ('action', 'content_type', 'timestamp', 'user')
    search_fields = ('object_label', 'reason', 'user__email')
    readonly_fields = ('id', 'timestamp', 'user', 'action', 'content_type', 'object_id', 'object_label', 'field_changed', 'old_value', 'new_value', 'reason', 'ip_address')
    ordering = ('-timestamp',)
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


@admin.register(LockedStatus)
class LockedStatusAdmin(admin.ModelAdmin):
    list_display = ('content_type', 'object_id', 'locked_status', 'locked_by', 'locked_at')
    list_filter = ('content_type', 'locked_status', 'locked_at')
    readonly_fields = ('locked_at', 'locked_by')
    
    def has_add_permission(self, request):
        return request.user.role == 'ADMIN'
    
    def has_delete_permission(self, request, obj=None):
        return request.user.role == 'ADMIN'
