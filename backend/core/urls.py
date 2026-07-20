from django.urls import path
from .views import PresignedURLView

urlpatterns = [
    path('upload/presigned-url/', PresignedURLView.as_view(), name='presigned_url'),
]
