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
        fields = ['id', 'user', 'category', 'product', 'discount_percent', 
                  'is_active', 'created_at', 'updated_at','discount_type']
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        """Validate that either category or product is provided, but not both"""
        category = data.get('category')
        product = data.get('product')
        
        if category is None and product is None:
            raise serializers.ValidationError("Either category or product must be specified")
            
        if category is not None and product is not None:
            raise serializers.ValidationError("Cannot specify both category and product for the same discount")
            
        return data
        
    def validate_discount_percent(self, value):
        """Validate discount percentage is within range"""
        if value < 0 or value > 100:
            raise serializers.ValidationError("Discount percentage must be between 0 and 100")
        return value
