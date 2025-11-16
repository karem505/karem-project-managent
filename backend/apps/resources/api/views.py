"""
API views for TeamMember management
"""
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from apps.resources.models import TeamMember
from .serializers import (
    TeamMemberSerializer,
    TeamMemberCreateSerializer,
    TeamMemberListSerializer
)


class TeamMemberViewSet(viewsets.ModelViewSet):
    """
    ViewSet for TeamMember CRUD operations
    """
    queryset = TeamMember.objects.select_related('user').all()
    permission_classes = (IsAuthenticated,)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ('is_active', 'role', 'department')
    search_fields = ('user__first_name', 'user__last_name', 'user__email', 'role', 'department')
    ordering_fields = ('user__first_name', 'role', 'created_at')
    ordering = ('user__first_name',)

    def get_serializer_class(self):
        if self.action == 'create':
            return TeamMemberCreateSerializer
        elif self.action == 'list':
            return TeamMemberListSerializer
        return TeamMemberSerializer
