from requests import Response
from rest_framework import generics
from .models import Banner
from .serializers import BannerSerializer
from AquaFlo.Utils.permissions import IsAdminOrReadOnly
from rest_framework_simplejwt.authentication import JWTAuthentication
from AquaFlo.Utils.default_response_mixin import DefaultResponseMixin


class BannerViewSet(DefaultResponseMixin,generics.GenericAPIView):
    serializer_class = BannerSerializer
    permission_classes = [IsAdminOrReadOnly]

    def post(self, request, *args, **kwargs):
        """
        Create a new banner instance.
        """
        serializer = BannerSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return self.success_response(
                "Category created successfully", 
                serializer.data
            )
            
        return self.error_response("Failed")

    def get(self, request, *args, **kwargs):
        """
        Retrieve a list of all banners.
        """
        if self.request.user.is_deleted:
            return self.error_response("User was not found plase connect Admin")
        banners = Banner.objects.all()
        serializer = BannerSerializer(banners, many=True, context={"request": request})
        return self.success_response(
                "Banner created successfully", 
                serializer.data
            )


    def delete(self, request, *args, **kwargs):
        """
        Delete a banner instance.
        """
        try:
            banner = Banner.objects.get(id=kwargs["pk"])
        except Banner.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        banner.delete()
        return self.success_response(
                "Deleted successfully.",
            )
