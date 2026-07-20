from django.db import models
from core.models import SchoolScopedMixin
from django.conf import settings
import uuid


class Class(SchoolScopedMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    section = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('school', 'name', 'section')
        verbose_name_plural = 'classes'

    def __str__(self):
        return f"{self.name} - {self.section}"


class StudentClass(SchoolScopedMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_class')
    enrolled_class = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='students')
    assigned_at = models.DateTimeField(auto_now_add=True)


class TeacherClass(SchoolScopedMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='teacher_classes')
    teaching_class = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='teachers')
    assigned_at = models.DateTimeField(auto_now_add=True)


class ClassMaterial(SchoolScopedMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='materials')
    classes = models.ManyToManyField(Class, related_name='materials')
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True, null=True)
    subject = models.CharField(max_length=255, blank=True, null=True)
    file_url = models.URLField(max_length=500, blank=True, null=True)
    file = models.FileField(upload_to='class_materials/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class MaterialReadStatus(SchoolScopedMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    material = models.ForeignKey(ClassMaterial, on_delete=models.CASCADE)
    read_at = models.DateTimeField(auto_now_add=True)


class Assignment(SchoolScopedMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assignments')
    classes = models.ManyToManyField(Class, related_name='assignments')
    title = models.CharField(max_length=255)
    instructions = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='assignments/', blank=True, null=True)
    subject = models.CharField(max_length=255, default='General')
    due_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Submission(SchoolScopedMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='submissions')
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    submission_text = models.TextField(blank=True, null=True)
    file_url = models.URLField(max_length=500, blank=True, null=True)
    grade = models.CharField(max_length=50, blank=True, null=True)
    score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    feedback = models.JSONField(blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)


class Grade(SchoolScopedMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='grades')
    subject = models.CharField(max_length=255)
    grade = models.CharField(max_length=50, blank=True, null=True)
    score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    max_score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    term = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, default='pending')
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_grades')
    approved_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class AttendanceRecord(SchoolScopedMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    status = models.CharField(max_length=20, default='present')
    marked_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='marked_attendance')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('school', 'student', 'date')



