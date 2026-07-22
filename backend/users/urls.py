from django.urls import path
from .views import (
    CookieTokenObtainPairView,
    EmailTokenObtainPairView,
    CookieTokenRefreshView,
    MeView,
    UserListView,
    UserCreateView,
    ChangePasswordView,
    AdminStatsView,
)

urlpatterns = [
    path('auth/login/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='current-user'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('', UserListView.as_view(), name='user-list'),
    path('create/', UserCreateView.as_view(), name='user-create'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
]
