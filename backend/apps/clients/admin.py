from django.contrib import admin
from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'company', 'contact_person', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'email', 'company', 'contact_person')
    readonly_fields = ('id', 'created_at', 'updated_at')
    ordering = ('-created_at',)

    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'name', 'email', 'phone', 'company', 'website')
        }),
        ('Contact Person', {
            'fields': ('contact_person', 'contact_position')
        }),
        ('Additional Information', {
            'fields': ('address', 'notes', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
