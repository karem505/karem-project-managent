"""
Task management models with Gantt and Kanban support
"""
import uuid
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Task(models.Model):
    """
    Tasks with Gantt and Kanban support
    """
    STATUS_CHOICES = [
        ('backlog', 'Backlog'),
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('review', 'Review'),
        ('done', 'Done'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='tasks'
    )

    # Basic info
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    # Kanban fields
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    kanban_order = models.IntegerField(default=0)

    # Gantt fields
    start_date = models.DateField()
    end_date = models.DateField()
    duration = models.IntegerField(help_text="Duration in days")

    # Progress
    progress = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

    # Resource allocation
    estimated_hours = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    actual_hours = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    # Cost tracking
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    actual_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Baseline tracking
    baseline_start = models.DateField(null=True, blank=True)
    baseline_end = models.DateField(null=True, blank=True)
    baseline_duration = models.IntegerField(null=True, blank=True)
    baseline_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # Assignments
    assigned_to = models.ManyToManyField(
        'resources.TeamMember',
        through='TaskAssignment',
        related_name='assigned_tasks'
    )

    # Critical path
    is_critical = models.BooleanField(default=False)
    slack = models.IntegerField(
        default=0,
        help_text="Total float in days"
    )

    # Scheduling (calculated fields)
    early_start = models.DateField(null=True, blank=True)
    early_finish = models.DateField(null=True, blank=True)
    late_start = models.DateField(null=True, blank=True)
    late_finish = models.DateField(null=True, blank=True)

    # Priority
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')

    # Parent task for subtasks
    parent_task = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subtasks'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tasks'
        ordering = ['kanban_order', 'start_date']
        indexes = [
            models.Index(fields=['project', 'status']),
            models.Index(fields=['project', 'start_date']),
            models.Index(fields=['is_critical']),
            models.Index(fields=['kanban_order']),
            models.Index(fields=['priority']),
        ]

    def __str__(self):
        return f"{self.project.name} - {self.title}"

    @property
    def cost_variance(self):
        """Calculate cost variance (estimated - actual)"""
        return float(self.estimated_cost - self.actual_cost)

    @property
    def schedule_variance_days(self):
        """Calculate schedule variance in days"""
        if self.baseline_end and self.end_date:
            return (self.end_date - self.baseline_end).days
        return 0


class TaskDependency(models.Model):
    """
    Task Dependencies for Gantt Chart
    """
    DEPENDENCY_TYPES = [
        ('FS', 'Finish-to-Start'),
        ('SS', 'Start-to-Start'),
        ('FF', 'Finish-to-Finish'),
        ('SF', 'Start-to-Finish'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    predecessor = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='successors'
    )
    successor = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='predecessors'
    )

    dependency_type = models.CharField(
        max_length=2,
        choices=DEPENDENCY_TYPES,
        default='FS'
    )

    # Lag time (positive) or lead time (negative) in days
    lag = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'task_dependencies'
        unique_together = ('predecessor', 'successor')
        verbose_name_plural = 'Task Dependencies'
        indexes = [
            models.Index(fields=['predecessor']),
            models.Index(fields=['successor']),
        ]

    def __str__(self):
        return f"{self.predecessor.title} ({self.get_dependency_type_display()}) {self.successor.title}"

    def clean(self):
        """Validate that a task cannot depend on itself and no circular dependencies"""
        from django.core.exceptions import ValidationError

        if self.predecessor == self.successor:
            raise ValidationError("A task cannot depend on itself")

        # Check for circular dependencies
        if self._has_circular_dependency():
            raise ValidationError("This dependency creates a circular reference")

    def _has_circular_dependency(self, visited=None):
        """Check for circular dependencies using DFS"""
        if visited is None:
            visited = set()

        if self.successor.id in visited:
            return True

        visited.add(self.successor.id)

        for dependency in TaskDependency.objects.filter(predecessor=self.successor):
            if dependency._has_circular_dependency(visited.copy()):
                return True

        return False


class TaskAssignment(models.Model):
    """
    Many-to-Many through table for Task-TeamMember assignments
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    team_member = models.ForeignKey('resources.TeamMember', on_delete=models.CASCADE)

    # Resource allocation
    allocated_hours = models.DecimalField(max_digits=8, decimal_places=2)
    allocation_percentage = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

    assigned_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'task_assignments'
        unique_together = ('task', 'team_member')

    def __str__(self):
        return f"{self.task.title} -> {self.team_member.full_name}"


class Comment(models.Model):
    """
    Task comments and collaboration
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    content = models.TextField()

    # Mentions
    mentions = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='mentioned_in_comments',
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'comments'
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment by {self.author.username} on {self.task.title}"
