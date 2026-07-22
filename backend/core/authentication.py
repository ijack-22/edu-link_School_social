from rest_framework_simplejwt.authentication import JWTAuthentication
from .middleware import set_current_school
from users.models import School

class TenantJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        result = super().authenticate(request)
        if result is not None:
            user, token = result
            if user and hasattr(user, 'school_id') and user.school_id:
                set_current_school(user.school_id)
            elif user:
                default_school, _ = School.objects.get_or_create(name="Default School")
                user.school = default_school
                user.save(update_fields=['school'])
                set_current_school(default_school.id)
        return result
