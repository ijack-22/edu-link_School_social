from rest_framework import serializers
from .models import Class, StudentClass, TeacherClass, ClassMaterial, MaterialReadStatus, Assignment, Submission, Grade, AttendanceRecord


class ClassSerializer(serializers.ModelSerializer):
    teacher = serializers.SerializerMethodField()
    room = serializers.CharField(source='section', read_only=True)
    students = serializers.SerializerMethodField()

    class Meta:
        model = Class
        fields = '__all__'
        read_only_fields = ['school']

    def get_teacher(self, obj):
        teacher = obj.teachers.select_related('user').first()
        if not teacher:
            return 'Unassigned'
        return teacher.user.get_full_name() or teacher.user.username

    def get_students(self, obj):
        return obj.students.count()


class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'
        read_only_fields = ['school', 'teacher']


class ClassMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassMaterial
        fields = '__all__'
        read_only_fields = ['school', 'teacher']


class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = '__all__'
        read_only_fields = ['school', 'user']


class GradeSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = Grade
        fields = '__all__'
        read_only_fields = ['school', 'approved_by', 'approved_at']

    def get_student_name(self, obj):
        return obj.student.get_full_name() or obj.student.username


class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = AttendanceRecord
        fields = '__all__'
        read_only_fields = ['school', 'marked_by']

    def get_student_name(self, obj):
        return obj.student.get_full_name() or obj.student.username


