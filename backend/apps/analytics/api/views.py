"""
API views for Analytics and Reports
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import timedelta
from apps.projects.models import Project
from apps.tasks.models import Task
from apps.resources.models import TeamMember


class DashboardView(APIView):
    """
    Dashboard overview statistics
    """
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        # Project statistics
        total_projects = Project.objects.count()
        active_projects = Project.objects.filter(status='active').count()
        completed_projects = Project.objects.filter(status='completed').count()

        # Task statistics
        total_tasks = Task.objects.count()
        completed_tasks = Task.objects.filter(status='done').count()
        in_progress_tasks = Task.objects.filter(status='in_progress').count()
        overdue_tasks = Task.objects.filter(
            end_date__lt=timezone.now().date(),
            status__in=['todo', 'in_progress']
        ).count()

        # Financial statistics
        total_budget = Project.objects.aggregate(total=Sum('budget'))['total'] or 0
        total_actual_cost = Project.objects.aggregate(total=Sum('actual_cost'))['total'] or 0

        # Team statistics
        total_team_members = TeamMember.objects.filter(is_active=True).count()

        # Recent activity
        recent_projects = Project.objects.order_by('-created_at')[:5]
        recent_tasks = Task.objects.order_by('-created_at')[:10]

        dashboard_data = {
            'projects': {
                'total': total_projects,
                'active': active_projects,
                'completed': completed_projects,
            },
            'tasks': {
                'total': total_tasks,
                'completed': completed_tasks,
                'in_progress': in_progress_tasks,
                'overdue': overdue_tasks,
            },
            'financial': {
                'total_budget': float(total_budget),
                'total_actual_cost': float(total_actual_cost),
                'variance': float(total_budget - total_actual_cost),
            },
            'team': {
                'total_members': total_team_members,
            },
            'recent_projects': [
                {
                    'id': str(p.id),
                    'name': p.name,
                    'status': p.status,
                    'created_at': p.created_at
                } for p in recent_projects
            ],
            'recent_tasks': [
                {
                    'id': str(t.id),
                    'title': t.title,
                    'project': t.project.name,
                    'status': t.status,
                    'created_at': t.created_at
                } for t in recent_tasks
            ],
        }

        return Response(dashboard_data)


class ProjectAnalyticsView(APIView):
    """
    Detailed analytics for a specific project
    """
    permission_classes = (IsAuthenticated,)

    def get(self, request, project_id):
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({"error": "Project not found"}, status=404)

        tasks = project.tasks.all()

        # Task status distribution
        status_distribution = tasks.values('status').annotate(count=Count('id'))

        # Priority distribution
        priority_distribution = tasks.values('priority').annotate(count=Count('id'))

        # Progress analytics
        avg_progress = tasks.aggregate(avg=Avg('progress'))['avg'] or 0

        # Cost analytics
        total_estimated_cost = tasks.aggregate(total=Sum('estimated_cost'))['total'] or 0
        total_actual_cost = tasks.aggregate(total=Sum('actual_cost'))['total'] or 0

        # Critical path tasks
        critical_tasks = tasks.filter(is_critical=True).count()

        # Team member workload
        team_workload = []
        for member in project.team_members.all():
            assigned_tasks = tasks.filter(assigned_to=member).count()
            team_workload.append({
                'member_id': str(member.id),
                'name': member.full_name,
                'role': member.role,
                'assigned_tasks': assigned_tasks
            })

        analytics_data = {
            'project': {
                'id': str(project.id),
                'name': project.name,
                'status': project.status,
                'budget': float(project.budget),
                'actual_cost': float(project.actual_cost),
                'cost_variance': float(project.cost_variance),
            },
            'tasks': {
                'total': tasks.count(),
                'status_distribution': list(status_distribution),
                'priority_distribution': list(priority_distribution),
                'average_progress': round(avg_progress, 2),
                'critical_tasks': critical_tasks,
            },
            'costs': {
                'estimated': float(total_estimated_cost),
                'actual': float(total_actual_cost),
                'variance': float(total_estimated_cost - total_actual_cost),
            },
            'team_workload': team_workload,
        }

        return Response(analytics_data)


class PortfolioOverviewView(APIView):
    """
    Portfolio-level overview of all projects
    """
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        projects = Project.objects.all()

        # Status distribution
        status_distribution = projects.values('status').annotate(count=Count('id'))

        # Financial overview
        financial_data = []
        for project in projects:
            financial_data.append({
                'project_id': str(project.id),
                'name': project.name,
                'budget': float(project.budget),
                'actual_cost': float(project.actual_cost),
                'variance': float(project.cost_variance),
                'progress': project.progress_percentage,
            })

        # Timeline overview
        upcoming_projects = projects.filter(
            start_date__gte=timezone.now().date(),
            start_date__lte=timezone.now().date() + timedelta(days=30)
        )

        portfolio_data = {
            'total_projects': projects.count(),
            'status_distribution': list(status_distribution),
            'total_budget': float(projects.aggregate(total=Sum('budget'))['total'] or 0),
            'total_actual_cost': float(projects.aggregate(total=Sum('actual_cost'))['total'] or 0),
            'financial_breakdown': financial_data,
            'upcoming_projects': [
                {
                    'id': str(p.id),
                    'name': p.name,
                    'start_date': p.start_date,
                    'client': p.client.name if p.client else None
                } for p in upcoming_projects
            ],
        }

        return Response(portfolio_data)
