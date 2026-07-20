from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from academics.models import Grade
from users.models import School

User = get_user_model()


class GradeWorkflowTests(APITestCase):
    def setUp(self):
        self.school = School.objects.create(name='Test School')
        self.teacher = User.objects.create_user(
            username='teacher',
            email='teacher@example.com',
            password='password123',
            role='teacher',
            school=self.school,
        )
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

    def test_teacher_can_submit_grade_and_admin_can_approve_it(self):
        self.client.force_authenticate(self.teacher)
        response = self.client.post(
            reverse('grade-list'),
            {
                'student': str(self.student.id),
                'subject': 'Mathematics',
                'grade': 'A',
                'score': '90',
                'max_score': '100',
                'term': 'Term 1',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        grade_id = response.data['id']
        grade = Grade.objects.get(id=grade_id)
        self.assertEqual(grade.status, 'pending')

        self.client.force_authenticate(self.admin)
        approval_response = self.client.patch(
            reverse('grade-detail', args=[grade_id]),
            {'status': 'approved'},
            format='json',
        )

        self.assertEqual(approval_response.status_code, status.HTTP_200_OK)
        grade.refresh_from_db()
        self.assertEqual(grade.status, 'approved')
        self.assertEqual(grade.approved_by, self.admin)
