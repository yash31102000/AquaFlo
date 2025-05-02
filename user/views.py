import requests
import json
from AquaFlo.Utils.default_response_mixin import DefaultResponseMixin
from AquaFlo.Utils.permissions import CustomAPIPermissions
from .serializers import *
from rest_framework import generics
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from django.conf import settings

# Create your views here.
class RegisterAPI(DefaultResponseMixin, generics.GenericAPIView):
    """
    User Register
    """

    serializer_class = RegisterSerializer
    permission_classes = [CustomAPIPermissions]

    def post(self, request):
        serializer = RegisterSerializer(
            data=self.request.data, context={"request": request}
        )

        if serializer.is_valid(raise_exception=True):
            serializer.save()

            """
            Send a welcome email to the newly registered user.
            """
            subject = "Registration Successful"
            message = f"Hello,\n\nYou have been successfully registered on our platform.\n\nThanks,\nThe Team"
            from_email = (
                settings.EMAIL_HOST_USER
            )  # You can use your default email or configure one in settings

            # Sending the email
            send_mail(subject, message, from_email, [self.request.data.get("email")])
            return self.success_response("Registered successfully", serializer.data)

    def get(self, request):
        all_user = (
            UserModel.objects.all()
            .values(
                "id", "phone_number", "first_name", "last_name", "email", "addresses"
            )
            .filter(is_deleted=False, is_superuser=False)
        )
        return self.success_response("Registered successfully", all_user)

    def put(self, request, user_id=None):
        if user_id is None:
            return self.error_response("User ID is required")
        user = UserModel.objects.get(id=user_id, is_deleted=False)
        serializer = RegisterSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return self.success_response("User Update successfully")
        return self.error_response("User Update Faild")

    def delete(self, request, user_id=None):
        """
        Delete a user by ID
        """
        if user_id is None:
            return self.error_response("User ID is required")

        try:
            user = UserModel.objects.get(id=user_id, is_deleted=False)
        except UserModel.DoesNotExist:
            return self.error_response("User not found.")

        if user.is_superuser:
            return self.error_response("Admin users cannot be deleted.")

        user.is_deleted = True
        user.save()
        return self.success_response("User deleted successfully.")


class LoginAPI(DefaultResponseMixin, generics.GenericAPIView):
    """
    User Register
    """

    serializer_class = LoginSerializer

    def post(self, request):
        phone_number = request.data.get("phone_number")
        password = request.data.get("password")

        if UserModel.objects.filter(
            phone_number=phone_number, is_deleted=True
        ).exists():
            return self.error_response(
                "This user account has been deleted and is no longer active."
            )
        user = authenticate(request, phone_number=phone_number, password=password)
        if user:

            response_data = {
                "phone_number": user.phone_number,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "is_admin": user.is_superuser,
                "tokens": user.tokens,
                "addresses": user.addresses,
            }
            return self.success_response("Login successfully", response_data)
        else:
            return self.error_response(
                "The phone number and password do not match. Please try again."
            )


class AddorRemoveAddressAPI(DefaultResponseMixin, generics.GenericAPIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = request.data.get("user_id", request.user.id)
        # user_id = request.user.id
        addresses = request.data.get("addresses")

        get_address = UserModel.objects.filter(id=user_id).first()

        if not get_address:
            return self.error_response("Address Not Found")

        get_address.addresses = addresses

        get_address.save()
        return self.success_response(
            "Address Update or Delete Successfully", 
        )

class UserDiscountViewSet(DefaultResponseMixin, generics.GenericAPIView):
    # permission_classes = [CustomAPIPermissions]
    # public_methods = ["GET"]
    # admin_only_methods = ["POST", "PUT", "DELETE"]
    def post(self, request):
        data = request.data.copy()
        data["user"] = request.user.id
        serializer = UserDiscountSerializer(data=data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return self.success_response("UserDiscount Placed successfully")
        return self.error_response("UserDiscount Placed Faild")
    
    def get(self, request):
        user =request.user
        if user.is_superuser:
            discounts = UserDiscount.objects.all().values()
        else:
            discounts = UserDiscount.objects.filter(user=user).values()
        return self.success_response("User Discount List Fatch successfully", discounts)
    
    def put(self, request, pk):
        data = request.data.copy()
        user = UserDiscount.objects.filter(id=pk).first()
        if not user:
            return self.error_response("UserDiscount Not Found")
        
        serializer = UserDiscountSerializer(user, data=data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return self.success_response("UserDiscount Update successfully")
        return self.error_response("UserDiscount Update Faild")
    
    def delete(self, request, pk):
        user = UserDiscount.objects.filter(id=pk).first()
        if not user:
            return self.error_response("UserDiscount Not Found")
        user.delete()
        return self.success_response("UserDiscount deleted successfully.")