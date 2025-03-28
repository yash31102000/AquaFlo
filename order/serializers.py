from rest_framework import serializers
from .models import *


class OrderSerializer(serializers.ModelSerializer):
    cancellation_reason = serializers.CharField(required=False)


    class Meta:
        model = Order
        fields = ['id','user','order_items', 'address', 'address_link', 'status', 'cancellation_reason']
    
    def create(self, validated_data):
        # Ensure user is set before saving
        user = validated_data.get('user')
        if not user:
            raise serializers.ValidationError("User is required")
        return super().create(validated_data)

    