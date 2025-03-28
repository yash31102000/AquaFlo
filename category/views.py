from django.utils import timezone
from rest_framework import generics
from AquaFlo.Utils.default_response_mixin import DefaultResponseMixin
from AquaFlo.Utils.permissions import IsAdminOrReadOnly
from .models import Category
from .serializers import *


class CategoryViewSet(DefaultResponseMixin, generics.GenericAPIView):
    serializer_class = CategorySerializer
    # permission_classes = [IsAdminOrReadOnly]

    # Handle POST request for creating a new Category
    def post(self, request):
        # Check if the category already exists
        if Category.objects.filter(name=request.data.get("name")).exists():
            return self.error_response("Category already exists")

        # Serialize and validate the request data
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            # Save the category
            serializer.save()
            return self.success_response(
                "Category created successfully", serializer.data
            )

        # Handle errors
        return self.error_response("Category Create Faild")

    # Handle GET request for fetching the list of Categories
    def get(self, request):
        # Fetch categories
        categories = Category.objects.all().filter(is_deleted=False)

        # Prepare the response structure
        response_data = []

        # Iterate over each category to structure the data
        for category in categories:
            category_data = {
                "id": category.pk,
                "main_category_list": category.name,  # Assuming 'name' is the field for main category
                "sub_category_list": [],
            }

            # Get sub-categories related to the category
            sub_categories = Item.objects.filter(category=category, is_deleted=False)

            for sub_category in sub_categories:
                sub_category_data = {
                    "id": sub_category.pk,
                    "main_item": sub_category.name,  # Assuming 'name' is the field for sub-category
                    "sub_item": [],
                }

                # Get items related to the sub-category
                items = SubItem.objects.filter(item=sub_category, is_deleted=False)
                base_url = request.build_absolute_uri("/").rstrip("/")
                for item in items:
                    item_data = {
                        "id": item.pk,
                        "image": (
                            base_url + item.image.url if item.image else None
                        ),  # Assuming 'image_url' is the field for the image
                        "name": item.name,  # Assuming 'name' is the field for item name
                        "count": "",  # Assuming 'count' is the field for item count,
                    }
                    watertank = Watertank.objects.filter(sub_item=item.pk)
                    for watertank_data in watertank:
                        item_data.update(
                            {
                                "height": (
                                    watertank_data.height if watertank_data else ""
                                ),
                                "width": watertank_data.width if watertank_data else "",
                            }
                        )
                    sub_category_data["sub_item"].append(item_data)

                # Add sub-category data to the category data
                category_data["sub_category_list"].append(sub_category_data)

            # Add category data to the response list
            response_data.append(category_data)

        # Return the formatted response
        return self.success_response(
            "Category list fetched successfully", response_data
        )

    def delete(self, request, pk):

        try:
            admin = Category.objects.get(id=pk, is_deleted=False)
            admin.is_deleted = True
            admin.save()
            return self.success_response(
                f"{pk}  deleted successfully",
            )

        except Category.DoesNotExist:
            return self.error_response(f"{pk} not found or already deleted")


class ItemViewSet(DefaultResponseMixin, generics.GenericAPIView):
    serializer_class = ItemSerializer
    # permission_classes = [IsAdminOrReadOnly]

    def post(self, request, *args, **kwargs):
        # Check if the item with the same name already exists
        if Item.objects.filter(name=request.data.get("name")).exists():
            return self.error_response("Item already exists")

        # Create a new item if it does not exist
        serializer = ItemSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):

            serializer.save()
            return self.success_response("Item created successfully", serializer.data)
        return self.error_response("Item Create Faild")

    # Handle GET request for fetching the list of Items
    def get(self, request):
        queryset = Item.objects.all().filter(is_deleted=False)
        serializer = ItemSerializer(queryset, many=True)
        return self.success_response("Item list fetched successfully", serializer.data)

    def delete(self, request, pk):

        try:
            admin = Item.objects.get(id=pk, is_deleted=False)
            admin.is_deleted = True
            admin.save()
            return self.success_response(
                f"{pk}  deleted successfully",
            )

        except Item.DoesNotExist:
            return self.error_response(f" {pk} not found or already deleted")


class SubItemViewSet(DefaultResponseMixin, generics.GenericAPIView):
    serializer_class = SubItemSerializer
    # permission_classes = [IsAdminOrReadOnly]

    def post(self, request, *args, **kwargs):

        # Create a new item if it does not exist
        serializer = SubItemSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):

            serializer.save()
            return self.success_response("Item created successfully", serializer.data)
        return self.error_response("SubItem Create Faild")

    # Handle GET request for fetching the list of Items
    def get(self, request):
        queryset = SubItem.objects.all().filter(is_deleted=False)
        serializer = SubItemSerializer(queryset, many=True)
        return self.success_response("Item list fetched successfully", serializer.data)

    def delete(self, request, pk):

        try:
            admin = SubItem.objects.get(id=pk, is_deleted=False)
            admin.is_deleted = True
            admin.save()
            return self.success_response(
                f"{pk}  deleted successfully",
            )

        except Item.DoesNotExist:
            return self.error_response(f" {pk} not found or already deleted")


class WatertankViewSet(DefaultResponseMixin, generics.GenericAPIView):
    serializer_class = WaterTankSerializer
    # permission_classes = [IsAdminOrReadOnly]

    def post(self, request, *args, **kwargs):

        # Check if the item with the same name already exists
        if Watertank.objects.filter(
            height=request.data.get("height"), width=request.data.get("width")
        ).exists():
            return self.error_response("Watertank height and width already exists")

        # Create a new item if it does not exist
        serializer = WaterTankSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return self.success_response(
                "Watertank height and width created successfully"
            )
        return self.error_response("Watertank height and width Create Faild")

    def put(self, request, pk):

        watertank = Watertank.objects.filter(id=pk).first()

        if not watertank:
            return self.error_response("Watertank Not Found")

        # Create a new item if it does not exist
        serializer = WaterTankSerializer(watertank, data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return self.success_response(
                "Watertank height and width Update successfully"
            )
        return self.error_response("Watertank height and width Update Faild")

class PipeViewSet(DefaultResponseMixin, generics.GenericAPIView):
    serializer_class = PipeCreateUpdateSerializer

    def post(self, request, *args, **kwargs):
        # Check if the pipe with the same name already exists at the same level
        parent_id = request.data.get("parent")
        name = request.data.get("name")

        # Check for existing pipe with the same name under the same parent
        existing_pipe_query = Pipe.objects.filter(name=name)
        if parent_id:
            existing_pipe_query = existing_pipe_query.filter(parent_id=parent_id)
        
        if existing_pipe_query.exists():
            return self.error_response("Pipe with this name already exists at this level")

        # Use create update serializer for handling nested creation
        serializer = PipeCreateUpdateSerializer(data=request.data)
        
        try:
            if serializer.is_valid(raise_exception=True):
                pipe = serializer.save()
                # Use recursive serializer to return full nested structure
                response_serializer = RecursivePipeSerializer(pipe)
                return self.success_response(
                    "Pipe created successfully", 
                    response_serializer.data, 
                )
        except Exception as e:
            return self.error_response(f"Pipe creation failed: {str(e)}")

    def get(self, request):
        # Fetch only top-level pipes (no parent)
        queryset = Pipe.objects.filter(parent__isnull=True)
        
        # Optional: Add support for filtering
        name_filter = request.query_params.get('name')
        if name_filter:
            queryset = queryset.filter(name__icontains=name_filter)
        
        # Use recursive serializer to get full nested structure
        serializer = RecursivePipeSerializer(queryset, many=True)
        return self.success_response(
            "Pipe list fetched successfully", 
            serializer.data
        )

    def delete(self, request, pk=None):
        try:
            # Retrieve the pipe
            pipe = Pipe.objects.get(id=pk)
            
            # Recursively delete all sub-categories
            self._recursive_delete(pipe)
            
            return self.success_response(
                f"Pipe {pk} and all its sub-categories deleted successfully"
            )

        except Pipe.DoesNotExist:
            return self.error_response(f"Pipe {pk} not found")

    def _recursive_delete(self, pipe):
        """
        Recursively delete a pipe and all its sub-categories
        """
        # First, delete all sub-categories
        for sub_category in pipe.sub_categories.all():
            self._recursive_delete(sub_category)
        
        # Then delete the pipe itself
        pipe.delete()

    def put(self, request, pk=None):
        try:
            # Retrieve the existing pipe
            pipe = Pipe.objects.get(id=pk)
            
            # Use create update serializer for handling update
            serializer = PipeCreateUpdateSerializer(pipe, data=request.data, partial=True)
            
            if serializer.is_valid(raise_exception=True):
                updated_pipe = serializer.save()
                
                # Use recursive serializer to return full nested structure
                response_serializer = RecursivePipeSerializer(updated_pipe)
                return self.success_response(
                    "Pipe updated successfully", 
                    response_serializer.data
                )
        
        except Pipe.DoesNotExist:
            return self.error_response(f"Pipe {pk} not found")
        except Exception as e:
            return self.error_response(f"Pipe update failed: {str(e)}")
