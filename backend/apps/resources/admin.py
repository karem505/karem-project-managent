from django.contrib import admin
from .models import TeamMember


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'department', 'hourly_rate', 'is_active', 'created_at')
    list_filter = ('is_active', 'role', 'department', 'created_at')
    search_fields = ('user__first_name', 'user__last_name', 'user__email', 'role', 'department')
    readonly_fields = ('id', 'created_at', 'updated_at')
    ordering = ('user__first_name',)

    fieldsets = (
        ('User', {
            'fields': ('id', 'user')
        }),
        ('Role Information', {
            'fields': ('role', 'department')
        }),
        ('Resource Allocation', {
            'fields': ('hourly_rate', 'capacity_hours_per_week')
        }),
        ('Skills & Status', {
            'fields': ('skills', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
