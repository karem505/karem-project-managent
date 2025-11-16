"""
Serializers for Project management
"""
from rest_framework import serializers
from apps.projects.models import Project, ProjectBaseline, ActivityLog
from apps.clients.api.serializers import ClientListSerializer
from apps.resources.api.serializers import TeamMemberListSerializer


class ProjectSerializer(serializers.ModelSerializer):
    """
    Serializer for Project model
    """
    client = ClientListSerializer(read_only=True)
    team_members = TeamMemberListSerializer(many=True, read_only=True)
    cost_variance = serializers.ReadOnlyField()
    cost_performance_index = serializers.ReadOnlyField()
    progress_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Project
        fields = (
            'id', 'name', 'description', 'client', 'budget', 'actual_cost',
            'start_date', 'end_date', 'status', 'baseline_start', 'baseline_end',
            'baseline_cost', 'created_by', 'team_members', 'cost_variance',
            'cost_performance_index', 'progress_percentage',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class ProjectCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating projects
    """
    team_member_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        write_only=True
    )

    class Meta:
        model = Project
        fields = (
            'name', 'description', 'client', 'budget', 'start_date', 'end_date',
            'status', 'baseline_start', 'baseline_end', 'baseline_cost',
            'team_member_ids'
        )

    def create(self, validated_data):
        team_member_ids = validated_data.pop('team_member_ids', [])
        validated_data['created_by'] = self.context['request'].user
        project = Project.objects.create(**validated_data)

        if team_member_ids:
            from apps.resources.models import TeamMember
            team_members = TeamMember.objects.filter(id__in=team_member_ids)
            project.team_members.set(team_members)

        return project

    def update(self, instance, validated_data):
        team_member_ids = validated_data.pop('team_member_ids', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if team_member_ids is not None:
            from apps.resources.models import TeamMember
            team_members = TeamMember.objects.filter(id__in=team_member_ids)
            instance.team_members.set(team_members)

        return instance


class ProjectListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for project lists
    """
    client_name = serializers.CharField(source='client.name', read_only=True)
    progress_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Project
        fields = (
            'id', 'name', 'client_name', 'status', 'budget', 'actual_cost',
            'start_date', 'end_date', 'progress_percentage', 'created_at'
        )


class ProjectBaselineSerializer(serializers.ModelSerializer):
    """
    Serializer for ProjectBaseline model
    """
    class Meta:
        model = ProjectBaseline
        fields = (
            'id', 'project', 'name', 'baseline_number', 'baseline_data',
            'created_at', 'created_by'
        )
        read_only_fields = ('id', 'created_at')


class ActivityLogSerializer(serializers.ModelSerializer):
    """
    Serializer for ActivityLog model
    """
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = ActivityLog
        fields = (
            'id', 'project', 'user', 'user_name', 'action', 'entity_type',
            'entity_id', 'description', 'changes', 'created_at'
        )
        read_only_fields = ('id', 'created_at')
