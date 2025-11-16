"""
URL patterns for Analytics API
"""
from django.urls import path
from .views import DashboardView, ProjectAnalyticsView, PortfolioOverviewView

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('project/<uuid:project_id>/', ProjectAnalyticsView.as_view(), name='project-analytics'),
    path('portfolio/', PortfolioOverviewView.as_view(), name='portfolio-overview'),
]
