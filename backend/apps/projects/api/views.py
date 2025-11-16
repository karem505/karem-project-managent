"""
API views for Project management
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from apps.projects.models import Project, ProjectBaseline, ActivityLog
from .serializers import (
    ProjectSerializer,
    ProjectCreateSerializer,
    ProjectListSerializer,
    ProjectBaselineSerializer,
    ActivityLogSerializer
)


class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Project CRUD operations
    """
    queryset = Project.objects.select_related('client', 'created_by').prefetch_related('team_members').all()
    permission_classes = (IsAuthenticated,)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ('status', 'client')
    search_fields = ('name', 'description', 'client__name')
    ordering_fields = ('name', 'created_at', 'start_date', 'end_date')
    ordering = ('-created_at',)

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProjectCreateSerializer
        elif self.action == 'list':
            return ProjectListSerializer
        return ProjectSerializer

    @action(detail=True, methods=['post'])
    def set_baseline(self, request, pk=None):
        """
        Create a baseline snapshot for the project
        """
        project = self.get_object()

        # Get the latest baseline number
        latest_baseline = project.baselines.order_by('-baseline_number').first()
        baseline_number = (latest_baseline.baseline_number + 1) if latest_baseline else 1

        # Create baseline data snapshot
        baseline_data = {
            'name': project.name,
            'budget': float(project.budget),
            'start_date': str(project.start_date),
            'end_date': str(project.end_date),
            'tasks': []
        }

        # Add task snapshots
        for task in project.tasks.all():
            baseline_data['tasks'].append({
                'id': str(task.id),
                'title': task.title,
                'start_date': str(task.start_date),
                'end_date': str(task.end_date),
                'duration': task.duration,
                'estimated_cost': float(task.estimated_cost)
            })

        # Create baseline
        baseline = ProjectBaseline.objects.create(
            project=project,
            name=request.data.get('name', f'Baseline {baseline_number}'),
            baseline_number=baseline_number,
            baseline_data=baseline_data,
            created_by=request.user
        )

        serializer = ProjectBaselineSerializer(baseline)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def baselines(self, request, pk=None):
        """
        Get all baselines for the project
        """
        project = self.get_object()
        baselines = project.baselines.all()
        serializer = ProjectBaselineSerializer(baselines, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def activity_logs(self, request, pk=None):
        """
        Get activity logs for the project
        """
        project = self.get_object()
        logs = project.activity_logs.select_related('user').all()
        serializer = ActivityLogSerializer(logs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """
        Get project statistics
        """
        project = self.get_object()
        tasks = project.tasks.all()

        statistics = {
            'total_tasks': tasks.count(),
            'completed_tasks': tasks.filter(status='done').count(),
            'in_progress_tasks': tasks.filter(status='in_progress').count(),
            'overdue_tasks': tasks.filter(end_date__lt=project.end_date, status__in=['todo', 'in_progress']).count(),
            'budget': float(project.budget),
            'actual_cost': float(project.actual_cost),
            'cost_variance': float(project.cost_variance),
            'progress_percentage': project.progress_percentage,
        }

        return Response(statistics)


class ProjectBaselineViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing project baselines
    """
    queryset = ProjectBaseline.objects.select_related('project', 'created_by').all()
    serializer_class = ProjectBaselineSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = (DjangoFilterBackend,)
    filterset_fields = ('project',)


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing activity logs
    """
    queryset = ActivityLog.objects.select_related('project', 'user').all()
    serializer_class = ActivityLogSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = (DjangoFilterBackend, filters.OrderingFilter)
    filterset_fields = ('project', 'action', 'entity_type')
    ordering = ('-created_at',)
