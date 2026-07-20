from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from social.models import Message
from users.models import School

User = get_user_model()


class MessageAPITests(APITestCase):
    def setUp(self):
        self.school = School.objects.create(name='Test School')
        self.sender = User.objects.create_user(
            username='sender',
            email='sender@example.com',
            password='password123',
            role='teacher',
            school=self.school,
        )
        self.receiver = User.objects.create_user(
            username='receiver',
            email='receiver@example.com',
            password='password123',
            role='student',
            school=self.school,
        )
        self.client.force_authenticate(self.sender)

    def test_create_message_with_receiver_email(self):
        response = self.client.post(
            reverse('message-list'),
            {'receiver_email': self.receiver.email, 'text': 'Hello there'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['receiver'], str(self.receiver.id))
        self.assertEqual(Message.objects.count(), 1)

    def test_list_messages_for_authenticated_user(self):
        Message.objects.create(sender=self.sender, receiver=self.receiver, text='Welcome')

        response = self.client.get(reverse('message-list'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
