from rest_framework import serializers
from .models import Banner


class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ["id", "title", "image", "description", "category"]

    def get_image_url(self, obj):
        # This assumes that you are storing images in a static directory
        # The url method generates the full URL to the image
        request = self.context.get("request")
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None

    def validate_title(self, value):
        """
        Ensure that the title is not empty and doesn't exceed the max length.
        """
        if not value:
            raise serializers.ValidationError("The title cannot be empty.")
        if len(value) > 255:
            raise serializers.ValidationError("The title cannot exceed 255 characters.")
        return value

    def validate_image(self, value):
        """
        Ensure that an image is provided.
        """
        if not value:
            raise serializers.ValidationError("An image must be provided.")
        return value

    def validate_description(self, value):
        """
        Ensure that the description is within a certain length (if needed).
        """
        if len(value) < 10:
            raise serializers.ValidationError(
                "Description must be at least 10 characters long."
            )
        return value

    def validate(self, data):
        """
        Custom validation for across fields if needed.
        For example, check if any fields are empty or conditional logic.
        """
        if not data.get("title"):
            raise serializers.ValidationError("The title is required.")
        if not data.get("image"):
            raise serializers.ValidationError("An image is required.")
        return data
