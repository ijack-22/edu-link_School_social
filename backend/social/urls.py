from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, ClubViewSet, EventViewSet, MessageViewSet, ComplaintViewSet

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'clubs', ClubViewSet, basename='club')
router.register(r'events', EventViewSet, basename='event')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'complaints', ComplaintViewSet, basename='complaint')

urlpatterns = [
    path('', include(router.urls)),
]
