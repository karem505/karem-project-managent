"""
Project management models
"""
import uuid
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class Project(models.Model):
    """
    Project Information
    """
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('active', 'Active'),
        ('on_hold', 'On Hold'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    client = models.ForeignKey(
        'clients.Client',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='projects'
    )

    # Financial tracking
    budget = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    actual_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )

    # Dates
    start_date = models.DateField()
    end_date = models.DateField()

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')

    # Baseline support
    baseline_start = models.DateField(null=True, blank=True)
    baseline_end = models.DateField(null=True, blank=True)
    baseline_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )

    # Project manager
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_projects'
    )

    # Team members
    team_members = models.ManyToManyField(
        'resources.TeamMember',
        related_name='projects',
        blank=True
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'projects'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['start_date']),
            models.Index(fields=['end_date']),
        ]

    def __str__(self):
        return self.name

    @property
    def cost_variance(self):
        """Calculate cost variance (budget - actual)"""
        return self.budget - self.actual_cost

    @property
    def cost_performance_index(self):
        """Calculate CPI (budget / actual)"""
        if self.actual_cost > 0:
            return float(self.budget / self.actual_cost)
        return 0

    @property
    def progress_percentage(self):
        """Calculate overall project progress based on tasks"""
        tasks = self.tasks.all()
        if not tasks:
            return 0
        total_progress = sum(task.progress for task in tasks)
        return round(total_progress / len(tasks))


class ProjectBaseline(models.Model):
    """
    Multiple baselines per project
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='baselines'
    )

    name = models.CharField(max_length=100, default="Baseline")
    baseline_number = models.IntegerField(default=1)

    # Snapshot data (JSONField for flexibility)
    baseline_data = models.JSONField(
        help_text="Complete snapshot of project state"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )

    class Meta:
        db_table = 'project_baselines'
        unique_together = ('project', 'baseline_number')
        ordering = ['baseline_number']

    def __str__(self):
        return f"{self.project.name} - {self.name}"


class ActivityLog(models.Model):
    """
    Audit trail for project activities
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='activity_logs'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )

    action = models.CharField(max_length=50)
    entity_type = models.CharField(max_length=50)
    entity_id = models.UUIDField()
    description = models.TextField()

    # Store old and new values for changes
    changes = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activity_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['project', '-created_at']),
            models.Index(fields=['entity_type', 'entity_id']),
        ]

    def __str__(self):
        return f"{self.action} - {self.entity_type} - {self.created_at}"
