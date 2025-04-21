from requests import Response
from rest_framework import generics
from .models import Banner
from .serializers import BannerSerializer
from AquaFlo.Utils.permissions import IsAdminOrReadOnly
from rest_framework_simplejwt.authentication import JWTAuthentication
from AquaFlo.Utils.default_response_mixin import DefaultResponseMixin
from datetime import timedelta
from django.utils import timezone
from django.core.files.storage import default_storage
import os


class BannerViewSet(DefaultResponseMixin, generics.GenericAPIView):
    serializer_class = BannerSerializer
    permission_classes = [IsAdminOrReadOnly]

    def post(self, request, *args, **kwargs):
        """
        Create a new banner instance.
        """
        serializer = BannerSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return self.success_response("Banner created successfully")

        return self.error_response("Failed")

    def get(self, request, *args, **kwargs):
        """
        Retrieve a list of all banners, excluding banners older than 7 days and deleting those banners.
        """
        if self.request.user.is_deleted:
            return self.error_response("User was not found, please contact Admin")

        banners = Banner.objects.all().filter(flag=True)

        # Get the current time and filter out banners older than 7 days
        seven_days_ago = timezone.now() - timedelta(days=7)
        old_banners = banners.filter(date__lt=seven_days_ago)

        # Delete banners older than 7 days, and remove associated images from media folder
        for banner in old_banners:
            if banner.image:
                image_path = banner.image.path
                if default_storage.exists(image_path):
                    default_storage.delete(image_path)
            banner.delete()

        serializer = BannerSerializer(banners, many=True, context={"request": request})
        return self.success_response("Banner fetched successfully", serializer.data)

    def delete(self, request,pk):
        """
        Delete a banner instance, if the date is older than 7 days.
        """
  
        banner = Banner.objects.filter(id=pk).first()
        if not banner:
            return self.error_response("Banner Not Found")
        if banner.image and os.path.isfile(banner.image.path):
                os.remove(banner.image.path)
        banner.delete()
        return self.success_response(
            "Deleted successfully.",
        )


    def put(self, request, pk):

        banner = Banner.objects.filter(id=pk).first()

        if not banner:
            return self.error_response("Banner not found.")

        flag = request.data.get("flag")
        if flag:
            banner.flag = flag
            banner.save()
            return self.success_response("Banner Update successfully.")

        serializer = BannerSerializer(banner, data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return self.success_response("Banner Update successfully.")
        return self.error_response("Banner Update Faild.")
