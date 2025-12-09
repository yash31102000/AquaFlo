from rest_framework import generics
from .models import Banner
from .serializers import BannerSerializer
from AquaFlo.Utils.permissions import CustomAPIPermissions
from AquaFlo.Utils.default_response_mixin import DefaultResponseMixin
import os


class BannerViewSet(DefaultResponseMixin, generics.GenericAPIView):
    serializer_class = BannerSerializer
    permission_classes = [CustomAPIPermissions]
    public_methods = ["GET"]
    admin_only_methods = ["POST", "PUT", "PATCH", "DELETE"]

    def post(self, request, *args, **kwargs):
        """
        Create a new banner instance.
        """
        serializer = BannerSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return self.success_response("Banner created successfully")

        return self.error_response(f"{serializer.errors}")

    def get(self, request, *args, **kwargs):
        """
        Retrieve a list of all banners
        """
        if not self.request.user.is_authenticated:
            return self.error_response("Not authenticated user.")
        if self.request.user.is_deleted:
            return self.error_response("User was not found, please contact Admin")
        if self.request.user.is_superuser:
            banners = Banner.objects.all()
        else:
            banners = Banner.objects.all().filter(flag=True)

        serializer = BannerSerializer(banners, many=True, context={"request": request})
        return self.success_response("Banner fetched successfully", serializer.data)

    def delete(self, request, pk):
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
        data = request.data.copy()
        banner_image = data.get("image")
        banner = Banner.objects.filter(id=pk).first()
        if not banner_image:
            data["image"] = banner.image
        if not banner:
            return self.error_response("Banner not found.")

        flag = data.get("flag")
        if flag:
            banner.flag = flag
            banner.save()

        serializer = BannerSerializer(banner, data=data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return self.success_response("Banner Update successfully.")
        return self.error_response("Banner Update Faild.")
