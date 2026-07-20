from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from .models import Post, Club, Event, Message, Complaint
from .serializers import PostSerializer, ClubSerializer, EventSerializer, MessageSerializer, ComplaintSerializer


class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Post.objects.filter(school=self.request.user.school).order_by('-created_at')

    def perform_create(self, serializer):
        if self.request.user.role != 'administration':
            raise PermissionDenied('Only administrators can post announcements.')
        serializer.save(user=self.request.user, school=self.request.user.school)


class ClubViewSet(viewsets.ModelViewSet):
    serializer_class = ClubSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Club.objects.filter(school=self.request.user.school)

    def perform_create(self, serializer):
        serializer.save(school=self.request.user.school)


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Event.objects.filter(school=self.request.user.school).order_by('date')

    def perform_create(self, serializer):
        if self.request.user.role != 'administration':
            raise PermissionDenied('Only administrators can post upcoming events.')
        serializer.save(organizer=self.request.user, school=self.request.user.school)


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return (Message.objects.filter(sender=user) | Message.objects.filter(receiver=user)).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)


class ComplaintViewSet(viewsets.ModelViewSet):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'administration':
            return Complaint.objects.filter(school=user.school).order_by('-created_at')
        return Complaint.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role not in {'student', 'parent'}:
            raise PermissionDenied('Only parents and students can submit complaints.')
        serializer.save(student=self.request.user, school=self.request.user.school)

    def perform_update(self, serializer):
        if self.request.user.role != 'administration':
            raise PermissionDenied('Only administrators can update complaints.')
        serializer.save(school=self.request.user.school)

