import os
import sys
import django

# Setup django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edulink_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from users.views import UserCreateView

User = get_user_model()

admin_user = User.objects.filter(role='administration').first()
if not admin_user:
    print("No admin user found")
    sys.exit(1)

factory = APIRequestFactory()

import uuid
random_suffix = str(uuid.uuid4())[:8]

payload = {
    'username': f'teststudent_{random_suffix}',
    'email': f'test_{random_suffix}@example.com',
    'first_name': 'Test',
    'last_name': 'Student',
    'role': 'student',
    'class_name': 'Grade 10',
    'section': 'A',
    'parent_name': 'Test Parent',
    'parent_email': f'testparent_{random_suffix}@example.com',
}

from rest_framework.test import force_authenticate
from core.middleware import set_current_school

request = factory.post('/api/v1/users/create/', payload, format='json')
force_authenticate(request, user=admin_user)
set_current_school(admin_user.school_id)

view = UserCreateView.as_view()
response = view(request)

print(f"Status Code: {response.status_code}")
print(f"Response Data: {response.data}")
