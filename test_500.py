import os, sys, django
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edulink_backend.settings')
django.setup()

from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()
admin = User.objects.get(email='admin@edulink.com')

refresh = RefreshToken.for_user(admin)
access_token = str(refresh.access_token)

client = APIClient()
client.credentials(HTTP_AUTHORIZATION='Bearer ' + access_token)

res1 = client.get('/api/v1/academics/grades/')
print("Grades status:", res1.status_code)

res2 = client.get('/api/v1/academics/attendance/')
print("Attendance status:", res2.status_code)

res3 = client.get('/api/v1/social/complaints/')
print("Complaints status:", res3.status_code)
