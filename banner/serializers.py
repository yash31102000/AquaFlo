from rest_framework import serializers
from .models import Banner


class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ["id", "title", "image", "description", "category", "flag"]

    def get_image_url(self, obj):
        # This assumes that you are storing images in a static directory
        # The url method generates the full URL to the image
        request = self.context.get("request")
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None
