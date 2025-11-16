"""
Client management models
"""
import uuid
from django.db import models


class Client(models.Model):
    """
    Client/Customer Information
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    company = models.CharField(max_length=255, blank=True)
    address = models.TextField(blank=True)
    website = models.URLField(blank=True)

    # Contact person
    contact_person = models.CharField(max_length=255, blank=True)
    contact_position = models.CharField(max_length=100, blank=True)

    # Additional info
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'clients'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['email']),
        ]

    def __str__(self):
        return self.name

    @property
    def active_projects_count(self):
        return self.projects.filter(status='active').count()

    @property
    def total_projects_value(self):
        return self.projects.aggregate(
            total=models.Sum('budget')
        )['total'] or 0
