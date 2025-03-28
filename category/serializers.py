from rest_framework import serializers
from .models import *


class SubItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubItem
        fields = ["id", "name", "item", "uniqcode", "image"]


class ItemSerializer(serializers.ModelSerializer):
    sub_category = serializers.CharField(source="name")
    sub_items = SubItemSerializer(many=True, read_only=True)

    class Meta:
        model = Item
        fields = ["id", "sub_category", "category", "sub_items"]


class CategorySerializer(serializers.ModelSerializer):
    main_category = serializers.CharField(source="name")
    items = ItemSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = [
            "id",
            "main_category",
            "items",
        ]

class WaterTankSerializer(serializers.ModelSerializer):

    class Meta:
        model = Watertank
        fields = ["id","sub_item","height","width"]

class RecursivePipeSerializer(serializers.ModelSerializer):
    """
    Recursive serializer that allows for nested sub-categories of unlimited depth.
    """
    sub_categories = serializers.SerializerMethodField()

    class Meta:
        model = Pipe
        fields = ['id', 'name', 'image', 'sub_categories']
        
    def get_sub_categories(self, obj):
        """
        Recursively serialize sub-categories.
        """
        # Get all direct children of the current object
        sub_categories = obj.sub_categories.all()
        
        # If there are no sub-categories, return an empty list
        if not sub_categories:
            return []
        
        # Recursively serialize sub-categories
        return RecursivePipeSerializer(sub_categories, many=True).data

class PipeSerializer(serializers.ModelSerializer):
    """
    A more basic serializer that can be used for simpler representations.
    """
    class Meta:
        model = Pipe
        fields = ['id', 'name', 'image']

class PipeCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating Pipe instances,
    including nested sub-categories.
    """
    sub_categories = serializers.ListField(
        child=serializers.DictField(), 
        required=False, 
        write_only=True
    )

    class Meta:
        model = Pipe
        fields = ['id', 'name', 'image', 'parent', 'sub_categories']
        extra_kwargs = {
            'parent': {'required': False, 'allow_null': True}
        }

    def create(self, validated_data):
        """
        Custom create method to handle nested sub-categories.
        """
        # Extract sub-categories if provided
        sub_categories = validated_data.pop('sub_categories', [])
        
        # Create the parent pipe
        pipe = Pipe.objects.create(**validated_data)
        
        # Recursively create sub-categories
        self._create_sub_categories(pipe, sub_categories)
        
        return pipe

    def update(self, instance, validated_data):
        """
        Custom update method to handle nested sub-categories.
        """
        # Extract sub-categories if provided
        sub_categories = validated_data.pop('sub_categories', [])
        
        # Update the current instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Remove existing sub-categories
        instance.sub_categories.all().delete()
        
        # Recursively create new sub-categories
        self._create_sub_categories(instance, sub_categories)
        
        return instance

    def _create_sub_categories(self, parent, sub_categories):
        """
        Recursive method to create sub-categories.
        """
        for sub_category in sub_categories:
            # Create a copy to avoid modifying the original
            sub_data = sub_category.copy()
            
            # Get sub-categories if exists
            nested_sub_categories = sub_data.pop('sub_categories', [])
            
            # Create sub-category
            sub_pipe = Pipe.objects.create(
                parent=parent,
                **sub_data
            )
            
            # Recursively create nested sub-categories
            if nested_sub_categories:
                self._create_sub_categories(sub_pipe, nested_sub_categories)