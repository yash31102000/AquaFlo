from rest_framework.decorators import action
from rest_framework import generics
from AquaFlo.Utils.default_response_mixin import DefaultResponseMixin
from AquaFlo.Utils.permissions import CustomAPIPermissions
from .models import *
from category.models import Pipe
from .serializers import *
from datetime import datetime


# Create your views here.
class OrderViewSet(DefaultResponseMixin, generics.GenericAPIView):
    # permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer  # Use OrderSerializer to handle order creation

    def post(self, request):
        # Create the Order with valid order_items (IDs of SubItems)
        request.data["user"] = request.user.id
        serializer = OrderSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return self.success_response("Order placed successfully")
        return self.error_response("Order Placed Faild")

    def get(self, request):
        queryset = Order.objects.all().order_by("created_at")
        serializer = OrderSerializer(queryset, many=True)
        response_data = serializer.data.copy()
        for data in response_data:
            data['created_at'] = datetime.fromisoformat(data['created_at'].replace("Z", "")).date()
            for order_items in data.get("order_items"):
                sub_item = (
                    Pipe.objects.filter(pk=order_items.get("item_id")).select_related("product").first()
                )
                if sub_item:
                    base_url = request.build_absolute_uri("/").rstrip("/")
                    image_url = str(sub_item.image) if sub_item.id else None
                    order_items.pop("item_id")
                    order_items["item"] = {
                        "id": sub_item.id,
                        "name": sub_item.name,
                        "image":  base_url + "/media/" + image_url if image_url else None,
                        "parent_id": sub_item.parent.id if sub_item.parent else None,
                        "product_id":  sub_item.product.id if sub_item.product else None,
                        "marked_as_favorite": sub_item.marked_as_favorite,
                        "product_name": sub_item.product.name if sub_item.product else (sub_item.name if sub_item.id else None),
                    }
                 
        return self.success_response("Order list fetched successfully", serializer.data)

    def put(self, request, pk):

        order = Order.objects.filter(id=pk).first()

        if not order:
            return self.error_response("Order not found")

        status = request.data.get("status")
        if status == "CANCEL":
            cancellation_reason = request.data.get("cancellation_reason")
            if not cancellation_reason:
                return self.error_response(
                    "Cancellation reason is required when order status is CANCEL."
                )
        order_items = request.data.get("order_items")
        if order_items:
            for order_item in order_items:
                if not order_item.get("item_id"):
                    return self.error_response("item_id missing in order_items")
        serializer = OrderSerializer(order, data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return self.success_response("Order Update successfully")
        return self.error_response("Order Update Faild")


class UserOrderViewSet(DefaultResponseMixin, generics.GenericAPIView):
    # permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get(self, request, user_id=None):
        """
        Get all orders for a specific user
        """
        # If user_id not provided in URL, return error
        if not user_id:
            return self.error_response("User ID is required")
        # Filter orders for this specific user
        queryset = Order.objects.filter(user_id=user_id)
        # Serialize the data
        serializer = OrderSerializer(queryset, many=True)

        # Process the response data
        response_data = serializer.data.copy()
        for data in response_data:
            for order_items in data.get("order_items"):
                sub_item = (
                    Pipe.objects.filter(pk=order_items.get("item_id")).select_related("product").first()
                )
                if sub_item:
                    base_url = request.build_absolute_uri("/").rstrip("/")
                    image_url = str(sub_item.image) if sub_item.id else None
                    order_items.pop("item_id")
                    order_items["item"] = {
                        "id": sub_item.id,
                        "name": sub_item.name,
                        "image":  base_url + "/media/" + image_url if image_url else None,
                        "parent_id": sub_item.parent.id if sub_item.parent else None,
                        "product_id":  sub_item.product.id if sub_item.product else None,
                        "marked_as_favorite": sub_item.marked_as_favorite,
                        "product_name": sub_item.product.name if sub_item.product else (sub_item.name if sub_item.id else None),
                    }

        return self.success_response(
            f"Orders for user fetched successfully", serializer.data
        )
