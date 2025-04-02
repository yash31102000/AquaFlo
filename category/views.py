from rest_framework import generics
from AquaFlo.Utils.default_response_mixin import DefaultResponseMixin
from AquaFlo.Utils.permissions import IsAdminOrReadOnly
from .serializers import *


class PipeViewSet(DefaultResponseMixin, generics.GenericAPIView):
    def update_image_urls(self, base_url, data):
        if isinstance(data, list):
            for item in data:
                self.update_image_urls(base_url, item)
        elif isinstance(data, dict):
            for key, value in data.items():
                if key == "image" and value:
                    data[key] = f"{base_url}{value}"
                elif isinstance(value, (dict, list)):
                    self.update_image_urls(base_url, value)

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
            return self.error_response(
                "Pipe with this name already exists at this level"
            )

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
        queryset = Pipe.objects.filter(parent__isnull=True , product__isnull=True)
        # Optional: Add support for filtering
        name_filter = request.query_params.get("name")
        if name_filter:
            queryset = queryset.filter(name__icontains=name_filter)

        # Use recursive serializer to get full nested structure
        serializer = RecursivePipeSerializer(queryset, many=True)
        base_url = request.build_absolute_uri("/").rstrip("/")
        updated_data = serializer.data
        self.update_image_urls(base_url, updated_data)
        return self.success_response("Pipe list fetched successfully", serializer.data)

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
            serializer = PipeCreateUpdateSerializer(
                pipe, data=request.data, partial=True
            )

            if serializer.is_valid(raise_exception=True):
                updated_pipe = serializer.save()

                # Use recursive serializer to return full nested structure
                response_serializer = RecursivePipeSerializer(updated_pipe)
                return self.success_response(
                    "Pipe updated successfully", response_serializer.data
                )

        except Pipe.DoesNotExist:
            return self.error_response(f"Pipe {pk} not found")
        except Exception as e:
            return self.error_response(f"Pipe update failed: {str(e)}")
