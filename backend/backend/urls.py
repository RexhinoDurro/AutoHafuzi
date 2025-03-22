# backend/urls.py
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
] 

# Add static patterns for development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Add catch-all route - This should be the LAST item in urlpatterns
if not settings.DEBUG:
    urlpatterns += [
        re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
    ]