from django.db import models
from .middleware import get_current_school
from .exceptions import MissingTenantContextError
import logging

logger = logging.getLogger(__name__)

class SchoolScopedManager(models.Manager):
    """
    A custom manager that automatically filters all queries by the current
    school_id stored in the ContextVar.
    """
    def get_queryset(self):
        qs = super().get_queryset()
        school_id = get_current_school()
        
        # Explicit exception if context is missing. Protects against leaky background jobs.
        if school_id is None:
            raise MissingTenantContextError(
                "CRITICAL SECURITY: School context is missing! All queries on SchoolScoped models must "
                "be run within a valid school context. If running a background job (Celery) "
                "or management command, explicitly set the context using `set_current_school(id)` "
                "or use `.all_schools()` to intentionally bypass."
            )
        
        return qs.filter(school_id=school_id)

    def all_schools(self, user=None):
        """
        Break-glass method to bypass tenant scoping for platform admins.
        Must be explicitly invoked and will write an audit log.
        """
        user_identifier = user.username if user else "SYSTEM_OR_BACKGROUND_JOB"
        logger.warning(f"AUDIT LOG: Cross-tenant query executed via .all_schools() by {user_identifier}.")
        return super().get_queryset()

class SchoolScopedMixin(models.Model):
    """
    Abstract base model that enforces multi-tenancy by linking to a School
    and using the SchoolScopedManager as the default manager.
    """
    school = models.ForeignKey('users.School', on_delete=models.CASCADE)
    
    objects = SchoolScopedManager()

    class Meta:
        abstract = True
