from rest_framework.permissions import BasePermission, SAFE_METHODS


class CustomAPIPermissions(BasePermission):
    """
    Flexible permission class that allows configuring which operations
    are allowed for all users and which require admin access.

    To use this permission:

    1. In your view, set the permission_classes to include this class
    2. Add these attributes to your view:
       - admin_only_methods: List of methods only admins can access (e.g., ['POST', 'DELETE'])
       - public_methods: List of methods anyone can access (e.g., ['GET', 'POST'])

    If a method is not specified in either list, it follows the default behavior:
    - Safe methods (GET, HEAD, OPTIONS) are public
    - Unsafe methods (POST, PUT, PATCH, DELETE) require admin access
    """

    def has_permission(self, request, view):
        # Check if the method is explicitly allowed for all users
        if hasattr(view, "public_methods") and request.method in view.public_methods:
            return True

        # Check if the method is explicitly restricted to admins only
        if (
            hasattr(view, "admin_only_methods")
            and request.method in view.admin_only_methods
        ):
            return request.user and request.user.is_staff

        # Default behavior: SAFE_METHODS for all, other methods for admins only
        if request.method in SAFE_METHODS:
            return True

        return request.user and request.user.is_staff
