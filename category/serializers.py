from rest_framework import serializers
from .models import *


class SubItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubItem
        fields = ["id", "name", "item","uniqcode","image"]

class ItemSerializer(serializers.ModelSerializer):
    sub_category = serializers.CharField(source='name')
    sub_items = SubItemSerializer(many=True,read_only=True)
    
    class Meta:
        model = Item
        fields = ["id", "sub_category", "category","sub_items"]


    
class CategorySerializer(serializers.ModelSerializer):
    main_category = serializers.CharField(source='name')
    items = ItemSerializer(many=True,read_only=True)

    class Meta:
        model = Category
        fields = [
            "id",
            "main_category",
            "items",
        ]

