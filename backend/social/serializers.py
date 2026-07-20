from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Post, Club, Event, Message, Complaint
from academics.models import StudentClass

User = get_user_model()


class PostSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    role = serializers.CharField(source='user.role', read_only=True)
    avatar = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    likes = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'user', 'user_name', 'role', 'avatar', 'title', 'content', 'privacy', 'createdAt', 'likes', 'comments', 'target_class']
        read_only_fields = ['user', 'school']

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_avatar(self, obj):
        return getattr(getattr(obj.user, 'profile', None), 'profile_picture', None) or '/favicon.svg'

    def get_likes(self, obj):
        return 0

    def get_comments(self, obj):
        return 0


class ClubSerializer(serializers.ModelSerializer):
    class Meta:
        model = Club
        fields = '__all__'
        read_only_fields = ['school']


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ['organizer', 'school']


class MessageSerializer(serializers.ModelSerializer):
    receiver_email = serializers.EmailField(write_only=True, required=True)
    sender = serializers.PrimaryKeyRelatedField(read_only=True)
    receiver = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'text', 'created_at', 'receiver_email']
        read_only_fields = ['id', 'sender', 'receiver', 'created_at']

    def validate_receiver_email(self, value):
        sender = self.context['request'].user
        try:
            receiver = User.objects.get(email=value, school=sender.school)
        except User.DoesNotExist as exc:
            raise serializers.ValidationError('No user found with that email in your school.') from exc

        if receiver == sender:
            raise serializers.ValidationError('You cannot send a message to yourself.')

        if sender.role == User.Role.TEACHER or receiver.role == User.Role.TEACHER:
            raise serializers.ValidationError('Teachers cannot use direct messaging.')

        if sender.role == User.Role.STUDENT:
            if receiver.role == User.Role.ADMINISTRATION:
                return value
            if receiver.role == User.Role.STUDENT and self._students_share_class(sender, receiver):
                return value
            raise serializers.ValidationError('Students can only message administration or classmates.')

        if sender.role == User.Role.PARENT:
            if receiver.role == User.Role.ADMINISTRATION:
                return value
            raise serializers.ValidationError('Parents can only message administration.')

        if sender.role == User.Role.REGISTRAR:
            if receiver.role == User.Role.ADMINISTRATION:
                return value
            raise serializers.ValidationError('Registrar can only message administration.')

        if sender.role == User.Role.ADMINISTRATION:
            if receiver.role in {User.Role.STUDENT, User.Role.PARENT, User.Role.REGISTRAR, User.Role.ADMINISTRATION}:
                return value

        raise serializers.ValidationError('You are not allowed to message that account.')

    def _students_share_class(self, sender, receiver):
        sender_class_id = StudentClass.objects.filter(user=sender).values_list('enrolled_class_id', flat=True).first()
        receiver_class_id = StudentClass.objects.filter(user=receiver).values_list('enrolled_class_id', flat=True).first()
        return sender_class_id is not None and sender_class_id == receiver_class_id

    def create(self, validated_data):
        receiver_email = validated_data.pop('receiver_email')
        receiver = User.objects.get(email=receiver_email, school=self.context['request'].user.school)
        return Message.objects.create(
            sender=self.context['request'].user,
            receiver=receiver,
            **validated_data,
        )


class ComplaintSerializer(serializers.ModelSerializer):
    submitted_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ['school', 'student']

    def get_submitted_by_name(self, obj):
        return obj.student.get_full_name() or obj.student.username



