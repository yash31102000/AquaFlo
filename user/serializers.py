from rest_framework import serializers
from .models import *
from django.contrib.auth.hashers import make_password


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=False, allow_blank=True)

    class Meta:
        model = UserModel
        fields = [
            "pk",
            "phone_number",
            "first_name",
            "last_name",
            "password",
            "email",
            "addresses",
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        validated_data["password"] = make_password(validated_data["password"])
        validated_data["username"] = validated_data["phone_number"]
        return super(RegisterSerializer, self).create(validated_data)


class LoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class UserDiscountSerializer(serializers.ModelSerializer):
    """Base serializer for UserDiscount model"""

    class Meta:
        model = UserDiscount
        fields = ["id", "user", "discount_data"]
        read_only_fields = ["created_at", "updated_at"]
