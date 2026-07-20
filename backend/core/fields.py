from django.db import models
from cryptography.fernet import Fernet
from django.conf import settings
import base64
import os

def get_fernet():
    key = getattr(settings, 'FIELD_ENCRYPTION_KEY', None)
    if not key:
        # Fallback to a dummy key during tests/migrations if missing
        key = base64.urlsafe_b64encode(b'dummy_key_for_dev_must_be_32_bytes_long!')
    return Fernet(key)

class EncryptedCharField(models.CharField):
    """Custom encrypted CharField using Fernet."""
    def get_prep_value(self, value):
        value = super().get_prep_value(value)
        if value is None:
            return None
        return get_fernet().encrypt(value.encode('utf-8')).decode('utf-8')

    def from_db_value(self, value, expression, connection):
        if value is None:
            return None
        try:
            return get_fernet().decrypt(value.encode('utf-8')).decode('utf-8')
        except Exception:
            return value

class EncryptedTextField(models.TextField):
    """Custom encrypted TextField using Fernet."""
    def get_prep_value(self, value):
        value = super().get_prep_value(value)
        if value is None:
            return None
        return get_fernet().encrypt(value.encode('utf-8')).decode('utf-8')

    def from_db_value(self, value, expression, connection):
        if value is None:
            return None
        try:
            return get_fernet().decrypt(value.encode('utf-8')).decode('utf-8')
        except Exception:
            return value
