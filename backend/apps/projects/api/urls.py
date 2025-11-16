"""
URL patterns for Projects API
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, ProjectBaselineViewSet, ActivityLogViewSet

router = DefaultRouter()
router.register(r'', ProjectViewSet, basename='project')
router.register(r'baselines', ProjectBaselineViewSet, basename='project-baseline')
router.register(r'activity-logs', ActivityLogViewSet, basename='activity-log')

urlpatterns = [
    path('', include(router.urls)),
]
