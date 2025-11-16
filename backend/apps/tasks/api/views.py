"""
API views for Task management
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from apps.tasks.models import Task, TaskDependency, TaskAssignment, Comment
from .serializers import (
    TaskSerializer,
    TaskCreateSerializer,
    TaskListSerializer,
    TaskKanbanSerializer,
    TaskGanttSerializer,
    TaskDependencySerializer,
    TaskAssignmentSerializer,
    CommentSerializer
)


class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Task CRUD operations
    """
    queryset = Task.objects.select_related('project', 'parent_task').prefetch_related('assigned_to').all()
    permission_classes = (IsAuthenticated,)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ('project', 'status', 'priority', 'is_critical', 'assigned_to')
    search_fields = ('title', 'description')
    ordering_fields = ('title', 'start_date', 'end_date', 'priority', 'kanban_order')
    ordering = ('start_date',)

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TaskCreateSerializer
        elif self.action == 'list':
            return TaskListSerializer
        elif self.action == 'kanban':
            return TaskKanbanSerializer
        elif self.action == 'gantt':
            return TaskGanttSerializer
        return TaskSerializer

    @action(detail=False, methods=['get'])
    def kanban(self, request):
        """
        Get tasks organized for Kanban board view
        """
        project_id = request.query_params.get('project')
        if not project_id:
            return Response(
                {"error": "project parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        tasks = self.queryset.filter(project_id=project_id).order_by('kanban_order')
        serializer = self.get_serializer(tasks, many=True)

        # Organize by status
        kanban_data = {
            'backlog': [],
            'todo': [],
            'in_progress': [],
            'review': [],
            'done': []
        }

        for task_data in serializer.data:
            status_key = task_data['status']
            if status_key in kanban_data:
                kanban_data[status_key].append(task_data)

        return Response(kanban_data)

    @action(detail=False, methods=['get'])
    def gantt(self, request):
        """
        Get tasks in DHTMLX Gantt format
        """
        project_id = request.query_params.get('project')
        if not project_id:
            return Response(
                {"error": "project parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        tasks = self.queryset.filter(project_id=project_id).order_by('start_date')
        task_serializer = self.get_serializer(tasks, many=True)

        # Get dependencies
        dependencies = TaskDependency.objects.filter(
            predecessor__project_id=project_id
        )
        dependency_data = []
        for dep in dependencies:
            dependency_data.append({
                'id': str(dep.id),
                'source': str(dep.predecessor.id),
                'target': str(dep.successor.id),
                'type': dep.dependency_type.lower().replace('-', '_'),
                'lag': dep.lag
            })

        gantt_data = {
            'data': task_serializer.data,
            'links': dependency_data
        }

        return Response(gantt_data)

    @action(detail=True, methods=['patch'])
    def update_progress(self, request, pk=None):
        """
        Update task progress
        """
        task = self.get_object()
        progress = request.data.get('progress')

        if progress is None or not (0 <= progress <= 100):
            return Response(
                {"error": "Progress must be between 0 and 100"},
                status=status.HTTP_400_BAD_REQUEST
            )

        task.progress = progress
        task.save()

        serializer = self.get_serializer(task)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """
        Update task status
        """
        task = self.get_object()
        new_status = request.data.get('status')

        valid_statuses = ['backlog', 'todo', 'in_progress', 'review', 'done']
        if new_status not in valid_statuses:
            return Response(
                {"error": f"Status must be one of {valid_statuses}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        task.status = new_status
        task.save()

        serializer = self.get_serializer(task)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def move_kanban(self, request, pk=None):
        """
        Move task in Kanban board (update status and order)
        """
        task = self.get_object()
        new_status = request.data.get('status')
        new_order = request.data.get('order', 0)

        if new_status:
            task.status = new_status
        task.kanban_order = new_order
        task.save()

        serializer = self.get_serializer(task)
        return Response(serializer.data)


class TaskDependencyViewSet(viewsets.ModelViewSet):
    """
    ViewSet for TaskDependency CRUD operations
    """
    queryset = TaskDependency.objects.select_related('predecessor', 'successor').all()
    serializer_class = TaskDependencySerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = (DjangoFilterBackend,)
    filterset_fields = ('predecessor', 'successor', 'dependency_type')


class TaskAssignmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for TaskAssignment CRUD operations
    """
    queryset = TaskAssignment.objects.select_related('task', 'team_member').all()
    serializer_class = TaskAssignmentSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = (DjangoFilterBackend,)
    filterset_fields = ('task', 'team_member')


class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Comment CRUD operations
    """
    queryset = Comment.objects.select_related('task', 'author').prefetch_related('mentions').all()
    serializer_class = CommentSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = (DjangoFilterBackend, filters.OrderingFilter)
    filterset_fields = ('task',)
    ordering = ('-created_at',)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
