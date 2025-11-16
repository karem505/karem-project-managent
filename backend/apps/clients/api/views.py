"""
API views for Client management
"""
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from apps.clients.models import Client
from .serializers import ClientSerializer, ClientCreateSerializer, ClientListSerializer


class ClientViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Client CRUD operations
    """
    queryset = Client.objects.all()
    permission_classes = (IsAuthenticated,)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ('is_active',)
    search_fields = ('name', 'email', 'company', 'contact_person')
    ordering_fields = ('name', 'created_at', 'company')
    ordering = ('-created_at',)

    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'update':
            return ClientCreateSerializer
        elif self.action == 'list':
            return ClientListSerializer
        return ClientSerializer
