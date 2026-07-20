from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/users/', include('users.urls')),
    path('api/v1/core/', include('core.urls')),
    path('api/v1/social/', include('social.urls')),
    path('api/v1/academics/', include('academics.urls')),
]

