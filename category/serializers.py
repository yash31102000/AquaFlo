from rest_framework import serializers
from .models import *


class SimpleProductSerializer(serializers.ModelSerializer):
    """
    Simple serializer for product representation without recursion.
    """

    class Meta:
        model = Pipe
        fields = [
            "id",
            "name",
            "image",
            "position",
            "marked_as_favorite",
        ]


class RecursivePipeSerializer(serializers.ModelSerializer):
    """
    Recursive serializer that allows for nested sub-categories of unlimited depth.
    Now includes position-based ordering.
    """

    sub_categories = serializers.SerializerMethodField()
    product = serializers.SerializerMethodField()

    class Meta:
        model = Pipe
        fields = ["id", "name", "image", "position", "sub_categories", "product"]

    def get_sub_categories(self, obj):
        """
        Recursively serialize sub-categories ordered by position.
        """
        sub_categories = obj.sub_categories.all().order_by("position", "name")

        # If there are no sub-categories, return an empty list
        if not sub_categories:
            return []

        # Recursively serialize sub-categories
        return RecursivePipeSerializer(
            sub_categories, many=True, context=self.context
        ).data

    def get_product(self, obj):
        """
        Get products that reference this pipe as their parent product, ordered by position.
        """
        # Find all pipes that reference this one as their product, ordered by position
        related_products = Pipe.objects.filter(product=obj).order_by("position", "name")

        if not related_products:
            return []

        # Create a list to store serialized products with basic_data
        serialized_products = []

        # Process each product individually to add basic_data
        for product in related_products:
            # Serialize the product first
            serialized_product = SimpleProductSerializer(
                product, context=self.context
            ).data

            # Get basic_data for this product and add it to the serialized data
            basic_data_obj = (
                PipeDetail.objects.filter(pipe=product.id).values("basic_data").first()
            )
            if basic_data_obj:
                basic_data_list = basic_data_obj["basic_data"]
                for item in basic_data_list:
                    for key, value in item.items():
                        if value in ["None", None]:
                            item[key] = "-"
                serialized_product["basic_data"] = basic_data_list

            serialized_products.append(serialized_product)

        return serialized_products


class PipeSerializer(serializers.ModelSerializer):
    """
    A more basic serializer that can be used for simpler representations.
    Includes basic_data from the related PipeDetail and position field.
    """

    basic_data = serializers.SerializerMethodField()

    class Meta:
        model = Pipe
        fields = ["id", "name", "image", "position", "basic_data"]  # Added position

    def get_basic_data(self, obj):
        pipe_detail = PipeDetail.objects.filter(pipe=obj).first()
        if pipe_detail:
            return pipe_detail.basic_data
        return None


class PipeCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating Pipe instances,
    including nested sub-categories with position support.
    """

    sub_categories = serializers.ListField(
        child=serializers.DictField(), required=False, write_only=True
    )

    class Meta:
        model = Pipe
        fields = [
            "id",
            "name",
            "image",
            "position",  # Added position field
            "parent",
            "product",
            "sub_categories",
            "marked_as_favorite",
        ]
        extra_kwargs = {
            "parent": {"required": False, "allow_null": True},
            "product": {"required": False, "allow_null": True},
            "position": {
                "required": False,
                "allow_null": False,
            },  # Added position validation
            "marked_as_favorite": {"required": False, "allow_null": False},
        }

    def create(self, validated_data):
        """
        Custom create method to handle nested sub-categories with auto-positioning.
        """
        # Extract sub-categories if provided
        sub_categories = validated_data.pop("sub_categories", [])

        # Auto-assign position if not provided
        if "position" not in validated_data or validated_data["position"] == 0:
            product = validated_data.get("product")
            if product:
                siblings = Pipe.objects.filter(product=product)
                max_position = (
                    siblings.aggregate(max_pos=models.Max("position"))["max_pos"] or 0
                )
                validated_data["position"] = max_position + 1
            else:
                siblings = Pipe.objects.filter(product__isnull=True).values(
                    "position", "name"
                )
                max_position = (
                    siblings.aggregate(max_pos=models.Max("position"))["max_pos"] or 0
                )
                validated_data["position"] = max_position + 1

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
        sub_categories = validated_data.pop("sub_categories", [])

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
        Recursive method to create sub-categories with auto-positioning.
        """
        for index, sub_category in enumerate(sub_categories):
            # Create a copy to avoid modifying the original
            sub_data = sub_category.copy()

            # Get sub-categories if exists
            nested_sub_categories = sub_data.pop("sub_categories", [])

            # Handle product reference if it exists
            product_id = sub_data.pop("product", None)

            # Auto-assign position if not provided
            if "position" not in sub_data or sub_data["position"] == 0:
                sub_data["position"] = index + 1

            # Create sub-category
            sub_pipe = Pipe.objects.create(parent=parent, **sub_data)

            # Set product if provided
            if product_id:
                try:
                    product = Pipe.objects.get(id=product_id)
                    sub_pipe.product = product
                    sub_pipe.save()
                except Pipe.DoesNotExist:
                    pass

            # Recursively create nested sub-categories
            if nested_sub_categories:
                self._create_sub_categories(sub_pipe, nested_sub_categories)


# New serializers for position management
class PositionUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating positions of multiple items.
    """

    product = serializers.ListField(
        child=serializers.DictField(child=serializers.IntegerField()),
        help_text="List of objects with 'id' and 'position' keys",
    )

    def validate_items(self, value):
        for item in value:
            if "id" not in item or "position" not in item:
                raise serializers.ValidationError(
                    "Each item must have 'id' and 'position' keys"
                )
            if item["position"] < 0:
                raise serializers.ValidationError("Position must be a positive integer")
        return value


class BulkPositionUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating positions of multiple items.
    """

    categories = serializers.ListField(
        child=serializers.DictField(child=serializers.IntegerField()),
        help_text="List of objects with 'id' and 'position' keys",
    )

    def validate_items(self, value):
        for item in value:
            if "id" not in item or "position" not in item:
                raise serializers.ValidationError(
                    "Each item must have 'id' and 'position' keys"
                )
            if item["position"] < 0:
                raise serializers.ValidationError("Position must be a positive integer")
        return value

class BestSellerSerializer(serializers.ModelSerializer):
    toggel = serializers.BooleanField(required=False)

    class Meta:
        model = BestSeller
        fields = ["id", "toggel", "quantity"]


class PipeDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = PipeDetail
        fields = ["id", "pipe", "basic_data"]


class PipeKeyTemplateSerializer(serializers.ModelSerializer):
    pipe_name = serializers.CharField(source="pipe.name", read_only=True)

    class Meta:
        model = PipeKeyTemplate
        fields = "__all__"  # or list specific fields + 'pipe_name'
