from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ClassViewSet,
    AssignmentViewSet,
    ClassMaterialViewSet,
    SubmissionViewSet,
    GradeViewSet,
    AttendanceRecordViewSet,
    AttendanceSummaryView,
)

router = DefaultRouter()
router.register(r'classes', ClassViewSet, basename='class')
router.register(r'assignments', AssignmentViewSet, basename='assignment')
router.register(r'materials', ClassMaterialViewSet, basename='classmaterial')
router.register(r'submissions', SubmissionViewSet, basename='submission')
router.register(r'grades', GradeViewSet, basename='grade')
router.register(r'attendance', AttendanceRecordViewSet, basename='attendance')

urlpatterns = [
    path('attendance/summary/', AttendanceSummaryView.as_view(), name='attendance-summary'),
    path('', include(router.urls)),
]
