"""
Serializers for TeamMember management
"""
from rest_framework import serializers
from apps.resources.models import TeamMember
from apps.accounts.api.serializers import UserSerializer


class TeamMemberSerializer(serializers.ModelSerializer):
    """
    Serializer for TeamMember model
    """
    user = UserSerializer(read_only=True)
    full_name = serializers.ReadOnlyField()
    email = serializers.ReadOnlyField()

    class Meta:
        model = TeamMember
        fields = (
            'id', 'user', 'full_name', 'email', 'role', 'department',
            'hourly_rate', 'capacity_hours_per_week', 'skills',
            'is_active', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class TeamMemberCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating team members
    """
    user_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = TeamMember
        fields = (
            'user_id', 'role', 'department', 'hourly_rate',
            'capacity_hours_per_week', 'skills', 'is_active'
        )

    def validate_user_id(self, value):
        from django.contrib.auth import get_user_model
        User = get_user_model()

        try:
            user = User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")

        # Check if team member already exists for this user
        if TeamMember.objects.filter(user=user).exists():
            raise serializers.ValidationError("Team member already exists for this user")

        return value

    def create(self, validated_data):
        from django.contrib.auth import get_user_model
        User = get_user_model()

        user_id = validated_data.pop('user_id')
        user = User.objects.get(id=user_id)
        team_member = TeamMember.objects.create(user=user, **validated_data)
        return team_member


class TeamMemberListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for team member lists
    """
    full_name = serializers.ReadOnlyField()
    email = serializers.ReadOnlyField()

    class Meta:
        model = TeamMember
        fields = (
            'id', 'full_name', 'email', 'role', 'department',
            'is_active', 'created_at'
        )
