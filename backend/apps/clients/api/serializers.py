"""
Serializers for Client management
"""
from rest_framework import serializers
from apps.clients.models import Client


class ClientSerializer(serializers.ModelSerializer):
    """
    Serializer for Client model
    """
    active_projects_count = serializers.ReadOnlyField()
    total_projects_value = serializers.ReadOnlyField()

    class Meta:
        model = Client
        fields = (
            'id', 'name', 'email', 'phone', 'company', 'address', 'website',
            'contact_person', 'contact_position', 'notes', 'is_active',
            'active_projects_count', 'total_projects_value',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class ClientCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating clients
    """
    class Meta:
        model = Client
        fields = (
            'name', 'email', 'phone', 'company', 'address', 'website',
            'contact_person', 'contact_position', 'notes', 'is_active'
        )


class ClientListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for client lists
    """
    active_projects_count = serializers.ReadOnlyField()

    class Meta:
        model = Client
        fields = (
            'id', 'name', 'email', 'company', 'contact_person',
            'is_active', 'active_projects_count', 'created_at'
        )
