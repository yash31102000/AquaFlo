from rest_framework import status
from rest_framework.response import Response
from rest_framework import generics
from .models import Banner
from .serializers import BannerSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication


class BannerViewSet(generics.GenericAPIView):
    serializer_class = BannerSerializer
    authentication_classes = [JWTAuthentication]  # Add JWT Authentication
    permission_classes = [IsAuthenticated]  # Ensure user is authenticated

    def post(self, request, *args, **kwargs):
        """
        Create a new banner instance.
        """
        serializer = BannerSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, *args, **kwargs):
        """
        Retrieve a list of all banners.
        """
        if self.request.user.is_deleted:
            return Response(
                {
                    "status": False,
                    "massege": "User was not found plase connect Admin",
                    "data": [],
                },
                status=status.HTTP_200_OK,
            )
        banners = Banner.objects.all()
        serializer = BannerSerializer(banners, many=True, context={"request": request})
        return Response(serializer.data)

    def delete(self, request, *args, **kwargs):
        """
        Delete a banner instance.
        """
        try:
            banner = Banner.objects.get(id=kwargs["pk"])
        except Banner.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        banner.delete()
        return Response(
            {"detail": "Deleted successfully."}, status=status.HTTP_204_NO_CONTENT
        )
