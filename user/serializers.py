from rest_framework import serializers
from .models import UserModel, UserDiscount
from django.contrib.auth.hashers import make_password


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=UserModel.ROLE_CHOICES, required=False)
    role_flag = serializers.BooleanField(required=False)

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
            "role",
            "role_flag"
        ]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def create(self, validated_data):
        validated_data["username"] = validated_data.get("phone_number")
        validated_data["password"] = make_password(validated_data["password"])
        if not validated_data.get("email"):
            validated_data["email"] = None
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "password" in validated_data:
            validated_data["password"] = make_password(validated_data["password"])
        if not validated_data.get("email"):
            validated_data["email"] = None
        if "phone_number" in validated_data:
            validated_data["username"] = validated_data["phone_number"]
        return super().update(instance, validated_data)


class LoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class UserDiscountSerializer(serializers.ModelSerializer):
    """Base serializer for UserDiscount model"""

    class Meta:
        model = UserDiscount
        fields = ["id", "user", "discount_data", "price_data"]
        read_only_fields = ["created_at", "updated_at"]


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
