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
            return self.success_response(
                "Category created successfully", 
                serializer.data
            )
            
        return self.error_response("Failed")

    def get(self, request, *args, **kwargs):
        """
        Retrieve a list of all banners, excluding banners older than 7 days and deleting those banners.
        """
        if self.request.user.is_deleted:
            return self.error_response("User was not found, please contact Admin")
        
        banners = Banner.objects.all()
        
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

        # After deletion, fetch the remaining banners
        banners = Banner.objects.all()

        serializer = BannerSerializer(banners, many=True, context={"request": request})
        return self.success_response(
                "Banner fetched successfully", 
                serializer.data
            )


    def delete(self, request, *args, **kwargs):
        """
        Delete a banner instance, if the date is older than 7 days.
        """
        try:
            banner = Banner.objects.get(id=kwargs["pk"])
        except Banner.DoesNotExist:
            return self.error_response( "Banner Not found.")

        # Check if the banner's date is older than 7 days
        if timezone.now() - banner.date > timedelta(days=7):
            # Check if the image exists and delete it manually
            if banner.image:
                image_path = banner.image.path
                if default_storage.exists(image_path):
                    default_storage.delete(image_path)

            # Delete the banner
            banner.delete()
            return self.success_response(
                "Deleted successfully.",
            )
        
        return self.error_response("Banner is not older than 7 days and cannot be deleted.")

