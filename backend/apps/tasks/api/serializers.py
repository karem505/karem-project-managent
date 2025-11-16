"""
Serializers for Task management
"""
from rest_framework import serializers
from apps.tasks.models import Task, TaskDependency, TaskAssignment, Comment
from apps.resources.api.serializers import TeamMemberListSerializer


class TaskAssignmentSerializer(serializers.ModelSerializer):
    """
    Serializer for TaskAssignment
    """
    team_member = TeamMemberListSerializer(read_only=True)

    class Meta:
        model = TaskAssignment
        fields = (
            'id', 'task', 'team_member', 'allocated_hours',
            'allocation_percentage', 'assigned_date'
        )
        read_only_fields = ('id', 'assigned_date')


class TaskDependencySerializer(serializers.ModelSerializer):
    """
    Serializer for TaskDependency
    """
    predecessor_title = serializers.CharField(source='predecessor.title', read_only=True)
    successor_title = serializers.CharField(source='successor.title', read_only=True)

    class Meta:
        model = TaskDependency
        fields = (
            'id', 'predecessor', 'predecessor_title', 'successor',
            'successor_title', 'dependency_type', 'lag', 'created_at'
        )
        read_only_fields = ('id', 'created_at')


class CommentSerializer(serializers.ModelSerializer):
    """
    Serializer for Comment
    """
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)

    class Meta:
        model = Comment
        fields = (
            'id', 'task', 'author', 'author_name', 'content',
            'mentions', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'author', 'created_at', 'updated_at')


class TaskSerializer(serializers.ModelSerializer):
    """
    Serializer for Task model
    """
    assigned_to_list = TeamMemberListSerializer(source='assigned_to', many=True, read_only=True)
    cost_variance = serializers.ReadOnlyField()
    schedule_variance_days = serializers.ReadOnlyField()
    assignments = TaskAssignmentSerializer(source='taskassignment_set', many=True, read_only=True)
    dependencies = TaskDependencySerializer(source='predecessors', many=True, read_only=True)

    class Meta:
        model = Task
        fields = (
            'id', 'project', 'title', 'description', 'status', 'kanban_order',
            'start_date', 'end_date', 'duration', 'progress', 'estimated_hours',
            'actual_hours', 'estimated_cost', 'actual_cost', 'baseline_start',
            'baseline_end', 'baseline_duration', 'baseline_cost', 'assigned_to_list',
            'is_critical', 'slack', 'early_start', 'early_finish', 'late_start',
            'late_finish', 'priority', 'parent_task', 'cost_variance',
            'schedule_variance_days', 'assignments', 'dependencies',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class TaskCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating tasks
    """
    assigned_to_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        write_only=True
    )

    class Meta:
        model = Task
        fields = (
            'project', 'title', 'description', 'status', 'kanban_order',
            'start_date', 'end_date', 'duration', 'progress', 'estimated_hours',
            'estimated_cost', 'priority', 'parent_task', 'assigned_to_ids'
        )

    def create(self, validated_data):
        assigned_to_ids = validated_data.pop('assigned_to_ids', [])
        task = Task.objects.create(**validated_data)

        if assigned_to_ids:
            from apps.resources.models import TeamMember
            for team_member_id in assigned_to_ids:
                try:
                    team_member = TeamMember.objects.get(id=team_member_id)
                    TaskAssignment.objects.create(
                        task=task,
                        team_member=team_member,
                        allocated_hours=0,
                        allocation_percentage=0
                    )
                except TeamMember.DoesNotExist:
                    pass

        return task

    def update(self, instance, validated_data):
        assigned_to_ids = validated_data.pop('assigned_to_ids', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if assigned_to_ids is not None:
            # Clear existing assignments
            instance.taskassignment_set.all().delete()

            # Create new assignments
            from apps.resources.models import TeamMember
            for team_member_id in assigned_to_ids:
                try:
                    team_member = TeamMember.objects.get(id=team_member_id)
                    TaskAssignment.objects.create(
                        task=instance,
                        team_member=team_member,
                        allocated_hours=0,
                        allocation_percentage=0
                    )
                except TeamMember.DoesNotExist:
                    pass

        return instance


class TaskListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for task lists
    """
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = Task
        fields = (
            'id', 'project', 'project_name', 'title', 'status', 'priority',
            'start_date', 'end_date', 'progress', 'is_critical', 'created_at'
        )


class TaskKanbanSerializer(serializers.ModelSerializer):
    """
    Serializer for Kanban view
    """
    assigned_to_list = TeamMemberListSerializer(source='assigned_to', many=True, read_only=True)

    class Meta:
        model = Task
        fields = (
            'id', 'title', 'description', 'status', 'kanban_order',
            'priority', 'progress', 'assigned_to_list', 'due_date'
        )

    due_date = serializers.DateField(source='end_date')


class TaskGanttSerializer(serializers.ModelSerializer):
    """
    Serializer for Gantt view (DHTMLX Gantt format)
    """
    text = serializers.CharField(source='title')
    start_date = serializers.DateField(format='%Y-%m-%d')
    end_date = serializers.DateField(format='%Y-%m-%d')
    parent = serializers.UUIDField(source='parent_task.id', allow_null=True)

    class Meta:
        model = Task
        fields = (
            'id', 'text', 'start_date', 'duration', 'progress', 'parent',
            'end_date', 'is_critical'
        )
