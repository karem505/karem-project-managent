from django.contrib import admin
from .models import Project, ProjectBaseline, ActivityLog


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'client', 'status', 'budget', 'actual_cost', 'start_date', 'end_date', 'created_at')
    list_filter = ('status', 'created_at', 'start_date')
    search_fields = ('name', 'description', 'client__name')
    readonly_fields = ('id', 'created_at', 'updated_at')
    filter_horizontal = ('team_members',)
    ordering = ('-created_at',)

    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'name', 'description', 'client', 'status')
        }),
        ('Financial', {
            'fields': ('budget', 'actual_cost')
        }),
        ('Dates', {
            'fields': ('start_date', 'end_date')
        }),
        ('Baseline', {
            'fields': ('baseline_start', 'baseline_end', 'baseline_cost'),
            'classes': ('collapse',)
        }),
        ('Team', {
            'fields': ('created_by', 'team_members')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(ProjectBaseline)
class ProjectBaselineAdmin(admin.ModelAdmin):
    list_display = ('project', 'name', 'baseline_number', 'created_by', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('project__name', 'name')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('project', 'action', 'entity_type', 'user', 'created_at')
    list_filter = ('action', 'entity_type', 'created_at')
    search_fields = ('project__name', 'description', 'user__username')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)
