"""
URL patterns for Tasks API
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TaskViewSet,
    TaskDependencyViewSet,
    TaskAssignmentViewSet,
    CommentViewSet
)

router = DefaultRouter()
router.register(r'', TaskViewSet, basename='task')
router.register(r'dependencies', TaskDependencyViewSet, basename='task-dependency')
router.register(r'assignments', TaskAssignmentViewSet, basename='task-assignment')
router.register(r'comments', CommentViewSet, basename='comment')

urlpatterns = [
    path('', include(router.urls)),
]
