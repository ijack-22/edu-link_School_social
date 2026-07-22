import secrets
import string

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework.response import Response
from rest_framework import serializers, status
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from .models import ParentStudentLink
from academics.models import Class, StudentClass, TeacherClass

User = get_user_model()


class EmailTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email', '').strip()
        password = request.data.get('password')

        if email and password:
            try:
                user = User.objects.get(email__iexact=email)
                # request.data might be immutable, make a mutable copy
                if hasattr(request.data, 'copy'):
                    data = request.data.copy()
                else:
                    data = dict(request.data)
                data['username'] = user.username
                data['password'] = password
                
                # Pass modified data to the serializer manually
                serializer = self.get_serializer(data=data)
                serializer.is_valid(raise_exception=True)
                return Response(serializer.validated_data, status=200)
            except User.DoesNotExist:
                pass

        return super().post(request, *args, **kwargs)


class CurrentUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'full_name', 'role']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class UserListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'full_name', 'role']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class UserCreateSerializer(serializers.ModelSerializer):
    temporary_password = serializers.SerializerMethodField(read_only=True)
    parent_temporary_password = serializers.SerializerMethodField(read_only=True)
    parent_email = serializers.EmailField(write_only=True, required=False, allow_blank=True)
    parent_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    class_names = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)
    class_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    section = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'school', 'temporary_password', 'parent_temporary_password', 'parent_email', 'parent_name', 'class_names', 'class_name', 'section']
        read_only_fields = ['id', 'school', 'temporary_password', 'parent_temporary_password']
        extra_kwargs = {'password': {'write_only': True}}

    def get_temporary_password(self, obj):
        return getattr(obj, '_temporary_password', None)

    def get_parent_temporary_password(self, obj):
        return getattr(obj, '_parent_temporary_password', None)

    def create(self, validated_data):
        parent_email = validated_data.pop('parent_email', None)
        parent_name = validated_data.pop('parent_name', '')
        class_names = validated_data.pop('class_names', [])
        class_name = validated_data.pop('class_name', '')
        section = validated_data.pop('section', '')
        school = self.context['request'].user.school
        role = validated_data['role']
        temp_password = ''.join(secrets.choice(string.ascii_letters + string.digits + '!@#$%^&*') for _ in range(12))
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=temp_password,
            role=role,
            school=school,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        user._temporary_password = temp_password

        if role == User.Role.STUDENT and class_name and section:
            enrolled_class, _ = Class.objects.get_or_create(school=school, name=class_name, section=section)
            StudentClass.objects.update_or_create(user=user, defaults={'school': school, 'enrolled_class': enrolled_class})

        if role == User.Role.TEACHER:
            for name in class_names:
                clean_name = name.strip()
                if clean_name and section:
                    teaching_class, _ = Class.objects.get_or_create(school=school, name=clean_name, section=section)
                    TeacherClass.objects.get_or_create(user=user, teaching_class=teaching_class, defaults={'school': school})

        if role == User.Role.STUDENT and parent_email:
            parent = User.objects.filter(email=parent_email, role=User.Role.PARENT, school=school).first()
            if parent is None:
                parent_username = parent_email.split('@')[0]
                parent_password = ''.join(secrets.choice(string.ascii_letters + string.digits + '!@#$%^&*') for _ in range(12))
                parent = User.objects.create_user(
                    username=parent_username,
                    email=parent_email,
                    password=parent_password,
                    role=User.Role.PARENT,
                    school=school,
                    first_name=parent_name,
                )
                user._parent_temporary_password = parent_password
            ParentStudentLink.objects.get_or_create(parent=parent, student=user)

        return user


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)


class MeView(RetrieveAPIView):
    serializer_class = CurrentUserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.role == 'administration':
            users = User.objects.filter(school=request.user.school).order_by('username')
        elif request.user.role == 'teacher':
            users = User.objects.filter(school=request.user.school, role=User.Role.STUDENT).order_by('username')
        else:
            return Response({'detail': 'Only administrators and teachers can view accounts.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = UserListSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if request.user.role != 'administration':
            return Response({'detail': 'Only administrators can create accounts.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = UserCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserCreateSerializer(user, context={'request': request}).data, status=status.HTTP_201_CREATED)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not request.user.check_password(serializer.validated_data['current_password']):
            return Response({'detail': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'detail': 'Password updated successfully.'}, status=status.HTTP_200_OK)


class CookieTokenObtainPairView(TokenObtainPairView):
    """
    Authenticates the user and returns an access token in the JSON body,
    while setting the refresh token securely in an HttpOnly cookie.
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            refresh_token = response.data.get('refresh')
            if refresh_token:
                del response.data['refresh']

            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=not settings.DEBUG,
                samesite='Lax' if settings.DEBUG else 'Strict',
                max_age=7 * 24 * 60 * 60,
            )
        return response


class CookieTokenRefreshView(TokenRefreshView):
    """
    Refreshes the access token using the HttpOnly refresh token cookie.
    """
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')

        if refresh_token:
            request.data['refresh'] = refresh_token

        try:
            response = super().post(request, *args, **kwargs)
        except InvalidToken as e:
            return Response({'detail': str(e)}, status=status.HTTP_401_UNAUTHORIZED)

        if response.status_code == 200:
            new_refresh_token = response.data.get('refresh')
            if new_refresh_token:
                del response.data['refresh']
                response.set_cookie(
                    key='refresh_token',
                    value=new_refresh_token,
                    httponly=True,
                    secure=not settings.DEBUG,
                    samesite='Lax' if settings.DEBUG else 'Strict',
                    max_age=7 * 24 * 60 * 60,
                )
        return response


class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.role not in {'administration', 'admin'}:
            return Response({'detail': 'Only administrators can access stats.'}, status=status.HTTP_403_FORBIDDEN)

        school = request.user.school
        total_users = User.objects.filter(school=school).count()

        from academics.models import Class, AttendanceRecord
        from social.models import Complaint

        active_classes = Class.objects.filter(school=school).count()

        records = AttendanceRecord.objects.filter(school=school)
        total_records = records.count()
        present_records = records.filter(status='present').count()
        avg_attendance = round((present_records / total_records * 100), 1) if total_records > 0 else 100.0

        pending_issues = Complaint.objects.filter(school=school, status='pending').count()

        return Response({
            'total_users': total_users,
            'active_classes': active_classes,
            'avg_attendance': f"{avg_attendance}%",
            'pending_issues': pending_issues,
        })






