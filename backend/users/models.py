from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
import uuid


class School(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Role(models.TextChoices):
        STUDENT = 'student', _('Student')
        TEACHER = 'teacher', _('Teacher')
        PARENT = 'parent', _('Parent')
        ADMINISTRATION = 'administration', _('Administration')
        REGISTRAR = 'registrar', _('Registrar')

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
    )
    school = models.ForeignKey(School, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.username


class ParentStudentLink(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='children_links')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='parent_links')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('parent', 'student')


from core.fields import EncryptedCharField, EncryptedTextField


class Profile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_picture = models.URLField(max_length=500, blank=True, null=True)

    # Using custom cryptography to encrypt highly sensitive fields at rest
    emergency_contact_phone = EncryptedCharField(max_length=255, blank=True, null=True)
    medical_notes = EncryptedTextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"


