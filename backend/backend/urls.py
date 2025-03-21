from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    # Serve static files if needed
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Add a catch-all route - This should be the LAST item in urlpatterns
# This will serve index.html for any route not matched above
if not settings.DEBUG:
    urlpatterns += [
        re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
    ]