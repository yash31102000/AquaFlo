from rest_framework import serializers
from .models import *
from django.contrib.auth.hashers import make_password


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ["pk", "phone_number", "first_name", "last_name", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        validated_data["password"] = make_password(validated_data["password"])
        validated_data['username'] = validated_data['first_name'] + validated_data['last_name']
        return super(RegisterSerializer, self).create(validated_data)


class LoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
