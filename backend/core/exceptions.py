class MissingTenantContextError(Exception):
    """
    Raised when a query on a tenant-scoped model is executed without an active 
    tenant context (school_id), preventing silent data leakage in background tasks.
    """
    pass
