"""
Team Members and Resource management models
"""
import uuid
from django.db import models
from django.conf import settings


class TeamMember(models.Model):
    """
    Team Members / Resources
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='team_member'
    )

    # Role and department
    role = models.CharField(max_length=100)
    department = models.CharField(max_length=100, blank=True)

    # Resource allocation
    hourly_rate = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        help_text="Hourly rate in USD"
    )
    capacity_hours_per_week = models.IntegerField(
        default=40,
        help_text="Available hours per week"
    )

    # Skills
    skills = models.JSONField(
        default=list,
        blank=True,
        help_text="List of skills"
    )

    # Status
    is_active = models.BooleanField(default=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'team_members'
        ordering = ['user__first_name', 'user__last_name']

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.role}"

    @property
    def full_name(self):
        return self.user.get_full_name()

    @property
    def email(self):
        return self.user.email
