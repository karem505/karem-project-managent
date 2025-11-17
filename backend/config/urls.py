"""
URL configuration for Project Management System
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


def health_check(request):
    """Simple health check endpoint"""
    return JsonResponse({
        'status': 'healthy',
        'message': 'Project Management API is running',
        'endpoints': {
            'admin': '/admin/',
            'api_docs': '/api/docs/',
            'api_v1': '/api/v1/',
        }
    })


urlpatterns = [
    path('', health_check, name='health'),
    path('admin/', admin.site.urls),

    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # API v1
    path('api/v1/auth/', include('apps.accounts.api.urls')),
    path('api/v1/clients/', include('apps.clients.api.urls')),
    path('api/v1/projects/', include('apps.projects.api.urls')),
    path('api/v1/tasks/', include('apps.tasks.api.urls')),
    path('api/v1/team-members/', include('apps.resources.api.urls')),
    path('api/v1/analytics/', include('apps.analytics.api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
