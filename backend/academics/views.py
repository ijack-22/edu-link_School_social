from django.utils import timezone
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from .models import Class, ClassMaterial, Assignment, Submission, Grade, AttendanceRecord, StudentClass
from .serializers import ClassSerializer, ClassMaterialSerializer, AssignmentSerializer, SubmissionSerializer, GradeSerializer, AttendanceRecordSerializer


ADMIN_ROLES = {'administration'}
REGISTRAR_ROLES = {'registrar'}
SCHOOL_STAFF_ROLES = ADMIN_ROLES | REGISTRAR_ROLES


def teacher_class_ids(user):
    return user.teacher_classes.values_list('teaching_class_id', flat=True)


def teacher_student_ids(user):
    return StudentClass.objects.filter(enrolled_class_id__in=teacher_class_ids(user)).values_list('user_id', flat=True)


def ensure_teacher_owns_students(user, student_ids):
    allowed_ids = {str(student_id) for student_id in teacher_student_ids(user)}
    requested_ids = {str(student_id) for student_id in student_ids if student_id}
    if not requested_ids.issubset(allowed_ids):
        raise PermissionDenied('Teachers can only work with students in their assigned classes.')


def ensure_teacher_owns_classes(user, class_ids):
    allowed_ids = {str(class_id) for class_id in teacher_class_ids(user)}
    requested_ids = {str(class_id) for class_id in class_ids if class_id}
    if not requested_ids or not requested_ids.issubset(allowed_ids):
        raise PermissionDenied('Teachers can only send work to their assigned classes.')


class ClassViewSet(viewsets.ModelViewSet):
    serializer_class = ClassSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Class.objects.filter(school=user.school)
        if user.role == 'teacher':
            return qs.filter(id__in=teacher_class_ids(user))
        if user.role == 'student' and hasattr(user, 'student_class'):
            return qs.filter(id=user.student_class.enrolled_class_id)
        if user.role == 'parent':
            child_class_ids = StudentClass.objects.filter(user_id__in=user.children_links.values_list('student_id', flat=True)).values_list('enrolled_class_id', flat=True)
            return qs.filter(id__in=child_class_ids)
        return qs

    def perform_create(self, serializer):
        if self.request.user.role not in ADMIN_ROLES:
            raise PermissionDenied('Only administrators can create classes.')
        serializer.save(school=self.request.user.school)


class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Assignment.objects.filter(school=user.school)
        if user.role == 'teacher':
            return qs.filter(classes__id__in=teacher_class_ids(user)).distinct()
        if user.role == 'student' and hasattr(user, 'student_class'):
            return qs.filter(classes=user.student_class.enrolled_class)
        if user.role == 'parent':
            child_class_ids = StudentClass.objects.filter(user_id__in=user.children_links.values_list('student_id', flat=True)).values_list('enrolled_class_id', flat=True)
            return qs.filter(classes__id__in=child_class_ids).distinct()
        return qs

    def perform_create(self, serializer):
        if self.request.user.role != 'teacher':
            raise PermissionDenied('Only teachers can create assignments.')
        class_ids = self.request.data.get('classes', [])
        ensure_teacher_owns_classes(self.request.user, class_ids)
        serializer.save(teacher=self.request.user, school=self.request.user.school)


class ClassMaterialViewSet(viewsets.ModelViewSet):
    serializer_class = ClassMaterialSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = ClassMaterial.objects.filter(school=user.school)
        if user.role == 'teacher':
            return qs.filter(classes__id__in=teacher_class_ids(user)).distinct()
        if user.role == 'student' and hasattr(user, 'student_class'):
            return qs.filter(classes=user.student_class.enrolled_class)
        if user.role == 'parent':
            child_class_ids = StudentClass.objects.filter(user_id__in=user.children_links.values_list('student_id', flat=True)).values_list('enrolled_class_id', flat=True)
            return qs.filter(classes__id__in=child_class_ids).distinct()
        return qs

    def perform_create(self, serializer):
        if self.request.user.role != 'teacher':
            raise PermissionDenied('Only teachers can create class materials.')
        class_ids = self.request.data.get('classes', [])
        ensure_teacher_owns_classes(self.request.user, class_ids)
        serializer.save(teacher=self.request.user, school=self.request.user.school)


class SubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Submission.objects.filter(school=user.school)
        if user.role == 'student':
            return qs.filter(user=user)
        if user.role == 'teacher':
            return qs.filter(assignment__classes__id__in=teacher_class_ids(user)).distinct()
        return qs

    def perform_create(self, serializer):
        if self.request.user.role != 'student':
            raise PermissionDenied('Only students can submit assignments.')
        serializer.save(user=self.request.user, school=self.request.user.school)


class GradeViewSet(viewsets.ModelViewSet):
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Grade.objects.filter(school=user.school)
        if user.role == 'student':
            return qs.filter(student=user, status='approved')
        if user.role == 'parent':
            child_ids = user.children_links.values_list('student_id', flat=True)
            return qs.filter(student_id__in=child_ids, status='approved')
        if user.role == 'teacher':
            return qs.filter(student_id__in=teacher_student_ids(user))
        if user.role in SCHOOL_STAFF_ROLES:
            return qs
        return qs.none()

    def perform_create(self, serializer):
        if self.request.user.role != 'teacher':
            raise PermissionDenied('Only teachers can send grades.')
        student = serializer.validated_data.get('student')
        ensure_teacher_owns_students(self.request.user, [student.id if student else None])
        serializer.save(school=self.request.user.school, status='pending')

    def perform_update(self, serializer):
        incoming_status = serializer.validated_data.get('status')
        if incoming_status in {'approved', 'rejected'}:
            if self.request.user.role not in REGISTRAR_ROLES:
                raise PermissionDenied('Only the registrar can approve or reject grades.')
            serializer.save(school=self.request.user.school, approved_by=self.request.user, approved_at=timezone.now())
            return

        if self.request.user.role != 'teacher':
            raise PermissionDenied('Only teachers can edit submitted grade details.')
        student = serializer.validated_data.get('student') or self.get_object().student
        ensure_teacher_owns_students(self.request.user, [student.id])
        serializer.save(school=self.request.user.school)


class AttendanceRecordViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = AttendanceRecord.objects.filter(school=user.school)
        if user.role == 'student':
            return qs.filter(student=user)
        if user.role == 'parent':
            child_ids = user.children_links.values_list('student_id', flat=True)
            return qs.filter(student_id__in=child_ids)
        if user.role == 'teacher':
            return qs.filter(student_id__in=teacher_student_ids(user))
        if user.role in {'administration', 'registrar'}:
            return qs
        return qs.none()

    def perform_create(self, serializer):
        if self.request.user.role != 'teacher':
            raise PermissionDenied('Only teachers can mark attendance.')
        student = serializer.validated_data.get('student')
        ensure_teacher_owns_students(self.request.user, [student.id if student else None])
        serializer.save(school=self.request.user.school, marked_by=self.request.user)

    def perform_update(self, serializer):
        if self.request.user.role != 'teacher':
            raise PermissionDenied('Only teachers can update attendance.')
        student = serializer.validated_data.get('student') or self.get_object().student
        ensure_teacher_owns_students(self.request.user, [student.id])
        serializer.save(school=self.request.user.school, marked_by=self.request.user)


from rest_framework.views import APIView
from rest_framework.response import Response

class AttendanceSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.role not in {'administration', 'admin', 'registrar', 'teacher'}:
            raise PermissionDenied('Only administrators and staff can view attendance summaries.')

        school = request.user.school
        class_id = request.query_params.get('class_id')

        student_classes = StudentClass.objects.filter(school=school)
        if class_id:
            student_classes = student_classes.filter(enrolled_class_id=class_id)

        summary = []
        for sc in student_classes.select_related('user', 'enrolled_class'):
            records = AttendanceRecord.objects.filter(student=sc.user)
            total = records.count()
            present = records.filter(status='present').count()
            pct = round((present / total * 100), 1) if total > 0 else 100.0

            summary.append({
                'student_id': str(sc.user.id),
                'student_name': sc.user.get_full_name() or sc.user.username,
                'email': sc.user.email,
                'class_id': str(sc.enrolled_class.id),
                'class_name': f"{sc.enrolled_class.name} - {sc.enrolled_class.section}",
                'total_records': total,
                'present_records': present,
                'attendance_percentage': pct,
            })

        return Response(summary)

