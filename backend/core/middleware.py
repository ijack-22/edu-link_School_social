from contextvars import ContextVar

_school_id_ctx: ContextVar[str] = ContextVar('school_id', default=None)

def set_current_school(school_id):
    """Set the current school_id in ContextVar. Returns a token for resetting."""
    return _school_id_ctx.set(school_id)

def get_current_school():
    """Retrieve the current school_id from ContextVar."""
    return _school_id_ctx.get()

def reset_current_school(token):
    """Reset the ContextVar using the token."""
    _school_id_ctx.reset(token)

class SchoolScopeMiddleware:
    """
    Middleware that extracts the school_id from the authenticated user
    and stores it in a ContextVar for the SchoolScopedManager to access.
    
    Using ContextVar ensures safety in async views, ASGI, and thread pools.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        token = None
        # Note: If using DRF with JWT, request.user may not be fully evaluated here.
        # For DRF APIs, we'll also implement a custom authentication class or view mixin 
        # to ensure the ContextVar is set immediately after token validation.
        if hasattr(request, 'user') and request.user.is_authenticated and hasattr(request.user, 'school_id') and request.user.school_id:
            token = set_current_school(request.user.school_id)
        else:
            token = set_current_school(None)
            
        try:
            response = self.get_response(request)
        finally:
            if token is not None:
                reset_current_school(token)
            
        return response
