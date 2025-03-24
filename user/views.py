from .serializers import *
from rest_framework import status, generics
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import authenticate
from rest_framework.response import Response
from rest_framework import status






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
        
        if UserModel.objects.filter(phone_number=phone_number,is_deleted=True).exists():
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
            }
            return Response(
                {
                    "status": True,
                    "message": "Login successfully" ,
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