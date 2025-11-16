from django.contrib import admin
from .models import Task, TaskDependency, TaskAssignment, Comment


class TaskAssignmentInline(admin.TabularInline):
    model = TaskAssignment
    extra = 1


class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'status', 'priority', 'progress', 'start_date', 'end_date', 'is_critical')
    list_filter = ('status', 'priority', 'is_critical', 'created_at')
    search_fields = ('title', 'description', 'project__name')
    readonly_fields = ('id', 'created_at', 'updated_at')
    inlines = [TaskAssignmentInline, CommentInline]
    ordering = ('-created_at',)

    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'project', 'title', 'description', 'parent_task')
        }),
        ('Kanban', {
            'fields': ('status', 'kanban_order', 'priority')
        }),
        ('Gantt & Scheduling', {
            'fields': (
                'start_date', 'end_date', 'duration',
                'early_start', 'early_finish',
                'late_start', 'late_finish',
                'is_critical', 'slack'
            )
        }),
        ('Progress & Resources', {
            'fields': ('progress', 'estimated_hours', 'actual_hours')
        }),
        ('Cost', {
            'fields': ('estimated_cost', 'actual_cost')
        }),
        ('Baseline', {
            'fields': ('baseline_start', 'baseline_end', 'baseline_duration', 'baseline_cost'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(TaskDependency)
class TaskDependencyAdmin(admin.ModelAdmin):
    list_display = ('predecessor', 'dependency_type', 'successor', 'lag', 'created_at')
    list_filter = ('dependency_type', 'created_at')
    search_fields = ('predecessor__title', 'successor__title')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)


@admin.register(TaskAssignment)
class TaskAssignmentAdmin(admin.ModelAdmin):
    list_display = ('task', 'team_member', 'allocated_hours', 'allocation_percentage', 'assigned_date')
    list_filter = ('assigned_date',)
    search_fields = ('task__title', 'team_member__user__first_name', 'team_member__user__last_name')
    readonly_fields = ('id', 'assigned_date')
    ordering = ('-assigned_date',)


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('task', 'author', 'content_preview', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('task__title', 'author__username', 'content')
    readonly_fields = ('id', 'created_at', 'updated_at')
    filter_horizontal = ('mentions',)
    ordering = ('-created_at',)

    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'
