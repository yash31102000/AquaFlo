from .serializers import *
from rest_framework import status, generics
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import authenticate
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings


# Create your views here.
class RegisterAPI(generics.GenericAPIView):
    """
    User Register
    """

    serializer_class = RegisterSerializer
    permission_classes = [IsAdminUser]

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

            return Response(
                {
                    "status": True,
                    "message": "Registered successfully",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )


class LoginAPI(generics.GenericAPIView):
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
            return Response(
                {
                    "status": False,
                    "message": "This user account has been deleted and is no longer active.",
                },
                status=status.HTTP_200_OK,  # 404 as the account doesn't exist in an active state
            )
        user = authenticate(request, phone_number=phone_number, password=password)
        if user:

            response_data = {
                "phone_number": user.phone_number,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "tokens": user.tokens,
                "addresses": user.addresses,
            }
            return Response(
                {
                    "status": True,
                    "message": "Login successfully",
                    "data": response_data,
                },
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {
                    "status": False,
                    "message": "Somthig wont's wrong",
                    "data": {},
                },
                status=status.HTTP_200_OK,
            )
