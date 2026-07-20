from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import School

User = get_user_model()


class UserManagementTests(APITestCase):
    def setUp(self):
        self.school = School.objects.create(name='Test School')
        self.admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='password123',
            role='administration',
            school=self.school,
        )
        self.student = User.objects.create_user(
            username='student',
            email='student@example.com',
            password='password123',
            role='student',
            school=self.school,
        )

    def test_admin_can_create_user_and_password_change_works(self):
        self.client.force_authenticate(self.admin)
        create_response = self.client.post(
            reverse('user-create'),
            {
                'username': 'teacher1',
                'email': 'teacher1@example.com',
                'role': 'teacher',
            },
            format='json',
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        teacher = User.objects.get(email='teacher1@example.com')
        self.assertTrue(teacher.check_password(create_response.data['temporary_password']))

        self.client.force_authenticate(teacher)
        password_response = self.client.post(
            reverse('change-password'),
            {
                'current_password': create_response.data['temporary_password'],
                'new_password': 'NewSecurePass123!',
            },
            format='json',
        )

        self.assertEqual(password_response.status_code, status.HTTP_200_OK)
        teacher.refresh_from_db()
        self.assertTrue(teacher.check_password('NewSecurePass123!'))
