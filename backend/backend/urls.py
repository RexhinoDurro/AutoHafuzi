# urls.py
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.http import FileResponse, Http404
import os

# Define the media serving function first, before using it in urlpatterns
def serve_media_in_production(request, path):
    """Custom view to serve media files in production"""
    full_path = os.path.join(settings.MEDIA_ROOT, path)
    if os.path.exists(full_path):
        return FileResponse(open(full_path, 'rb'))
    raise Http404("Media file not found")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    # Serve media files (make this work in production too)
    path('media/<path:path>', serve_media_in_production, name='serve_media'),
] 

# Add static and media patterns regardless of DEBUG setting
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Add catch-all route - This should be the LAST item in urlpatterns
if not settings.DEBUG:
    urlpatterns += [
        re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
    ]