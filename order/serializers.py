from rest_framework import serializers
from .models import *


class OrderSerializer(serializers.ModelSerializer):
    cancellation_reason = serializers.CharField(required=False)

    class Meta:
        model = Order
        fields = [
            "id",
            "user",
            "order_items",
            "address",
            "address_link",
            "status",
            "cancellation_reason",
            "created_at"
        ]

    def create(self, validated_data):
        # Ensure user is set before saving
        user = validated_data.get("user")
        if not user:
            raise serializers.ValidationError("User is required")
        return super().create(validated_data)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Remove user data from the response
        user_data = (
            UserModel.objects.filter(pk=ret.get("user"))
            .values(
                "id",
                "phone_number",
                "first_name",
                "last_name",
                "email",
            )
            .first()
        )
        ret.pop("user", None)
        ret["user_data"] = user_data
        return ret
