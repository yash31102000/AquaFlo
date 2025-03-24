from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminOrReadOnly(BasePermission):
    """
    Custom permission that allows only admins to perform write/delete actions,
    while regular users can only read (GET).
    """

    def has_permission(self, request, view):
        # Allow GET requests for all users
        if request.method in SAFE_METHODS:  # SAFE_METHODS = ('GET', 'HEAD', 'OPTIONS')
            return True

        # Allow POST, DELETE only for admin users
        return request.user and request.user.is_staff  # Adjust based on your admin check
