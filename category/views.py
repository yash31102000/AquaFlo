from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from .models import Category
from .serializers import *



class CategoryViewSet(generics.GenericAPIView):
    serializer_class = CategorySerializer

    # Handle POST request for creating a new Category
    def post(self, request):
        # Check if the category already exists
        if Category.objects.filter(name=request.data.get("name")).exists():
            return Response(
                {
                    "status": False,     
                    "message": "Category already exists",
                    "data": {},
                },
                status=status.HTTP_200_OK,
            )

        
        # Serialize and validate the request data
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            # Save the category
            serializer.save()
            return Response(
                {
                    "status": True,
                    "message": "Category created successfully",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )
        
        # Handle errors
        return Response(
            {
                "status": False,
                "message": "Something went wrong",
                "data": {},
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Handle GET request for fetching the list of Categories
    def get(self, request):
        # Fetch categories
        categories = Category.objects.all().filter(is_deleted = False)

        # Prepare the response structure
        response_data = []

        # Iterate over each category to structure the data
        for category in categories:
            category_data = {
                "id" : category.pk,
                'main_category_list': category.name,  # Assuming 'name' is the field for main category
                'sub_category_list': [],
            }

            # Get sub-categories related to the category
            sub_categories = Item.objects.filter(category=category)

            for sub_category in sub_categories:
                sub_category_data = {
                    "id" : sub_category.pk,
                    'main_item': sub_category.name,  # Assuming 'name' is the field for sub-category
                    'sub_item': [],
                }

                # Get items related to the sub-category
                items = SubItem.objects.filter(item=sub_category)

                for item in items:
                    item_data = {
                        "id" : item.pk,
                        'image': "item.image",  # Assuming 'image_url' is the field for the image
                        'name': item.name,  # Assuming 'name' is the field for item name
                        'count': "",  # Assuming 'count' is the field for item count
                    }
                    sub_category_data['sub_item'].append(item_data)

                # Add sub-category data to the category data
                category_data['sub_category_list'].append(sub_category_data)

            # Add category data to the response list
            response_data.append(category_data)

        # Return the formatted response
        return Response(
            {
                "status": True,
                "message": "Category list fetched successfully",
                "data": response_data,
            },
            status=status.HTTP_200_OK,
        )


    def delete(self, request,pk):
    
        try:
            admin = Category.objects.get(id=pk, is_deleted=False)
            admin.is_deleted = True
            admin.save()

            return Response(
                {
                    "status": True,
                    "message": f"{pk}  deleted successfully",
                },
                status=status.HTTP_200_OK,
            )

        except Category.DoesNotExist:
            return Response(
                {
                    "status": False,
                    "message": f" {pk} not found or already deleted",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

class ItemViewSet(generics.GenericAPIView):
    serializer_class = ItemSerializer
    # permission_classes = [IsAdminUser]  # Use IsAdminUser for admins only, adjust as needed

    def post(self, request, *args, **kwargs):
        # Check if the item with the same name already exists
        if Item.objects.filter(name=request.data.get("name")).exists():
            return Response(
                {
                    "status": False,
                    "message": "Item already exists",
                    "data": {},
                },
                status=status.HTTP_400_BAD_REQUEST,  # Use 400 Bad Request when there's a validation issue
            )
        
        # Create a new item if it does not exist
        serializer = ItemSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            
            serializer.save()
            return Response(
                {
                    "status": True,
                    "message": "Item created successfully",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,  # Use 201 Created on success
            )

        return Response(
            {
                "status": False,
                "message": "Something went wrong",
                "data": {},
            },
            status=status.HTTP_400_BAD_REQUEST,  # Use 400 Bad Request if the serializer validation fails
        )
    
    # Handle GET request for fetching the list of Items
    def get(self, request):
        queryset = Item.objects.all()
        serializer = ItemSerializer(queryset, many=True)
        return Response(
            {
                "status": True,
                "message": "Item list fetched successfully",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
    
    def delete(self, request,pk):
    
        try:
            admin = Item.objects.get(id=pk, is_deleted=False)
            admin.is_deleted = True
            admin.save()

            return Response(
                {
                    "status": True,
                    "message": f"{pk}  deleted successfully",
                },
                status=status.HTTP_200_OK,
            )

        except Item.DoesNotExist:
            return Response(
                {
                    "status": False,
                    "message": f" {pk} not found or already deleted",
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        
class SubItemViewSet(generics.GenericAPIView):
    serializer_class = SubItemSerializer
    # permission_classes = [IsAdminUser]  # Use IsAdminUser for admins only, adjust as needed

    def post(self, request, *args, **kwargs):
        # Check if the item with the same name already exists
        if SubItem.objects.filter(name=request.data.get("name")).exists():
            return Response(
                {
                    "status": False,
                    "message": "Item already exists",
                    "data": {},
                },
                status=status.HTTP_400_BAD_REQUEST,  # Use 400 Bad Request when there's a validation issue
            )
        
        # Create a new item if it does not exist
        serializer = SubItemSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            
            serializer.save()
            return Response(
                {
                    "status": True,
                    "message": "Item created successfully",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,  # Use 201 Created on success
            )

        return Response(
            {
                "status": False,
                "message": "Something went wrong",
                "data": {},
            },
            status=status.HTTP_400_BAD_REQUEST,  # Use 400 Bad Request if the serializer validation fails
        )
    
    # Handle GET request for fetching the list of Items
    def get(self, request):
        queryset = SubItem.objects.all()
        serializer = SubItemSerializer(queryset, many=True)
        return Response(
            {
                "status": True,
                "message": "Item list fetched successfully",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
    
    def delete(self, request,pk):
    
        try:
            admin = SubItem.objects.get(id=pk, is_deleted=False)
            admin.is_deleted = True
            admin.save()

            return Response(
                {
                    "status": True,
                    "message": f"{pk}  deleted successfully",
                },
                status=status.HTTP_200_OK,
            )

        except Item.DoesNotExist:
            return Response(
                {
                    "status": False,
                    "message": f" {pk} not found or already deleted",
                },
                status=status.HTTP_404_NOT_FOUND,
            )