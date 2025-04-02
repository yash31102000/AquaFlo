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
        # print(ret.get("user"))
        user_data = (
            UserModel.objects.filter(pk=ret.get("user"))
            .values("phone_number", "first_name", "last_name", "email",)
            .first()
        )
        ret.pop("user", None)
        ret["user_data"] = user_data
        return ret

    # def get_user(self, obj):
    #     # Only include user data for write operations
    #     request = self.context.get('request')
    #     if request and request.method in ['POST', 'PUT', 'PATCH']:
    #         return obj.user.id  # or whatever user representation you need
    #     user_data = UserModel.objects.filter(pk = obj.user.id).values().first()
    #     print(user_data)
    #     return None
