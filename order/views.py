from rest_framework.decorators import action
from rest_framework import generics
from AquaFlo.Utils.default_response_mixin import DefaultResponseMixin
from AquaFlo.Utils.permissions import CustomAPIPermissions
from .models import *
from category.models import Pipe
from .serializers import *


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
            for order_items in data.get("order_items"):
                sub_item = (
                    Pipe.objects.filter(pk=order_items.get("item_id")).values().first()
                )
                order_items.pop("item_id")
                order_items["item"] = sub_item
                base_url = request.build_absolute_uri("/").rstrip("/")
                order_items["item"]["image"] = (
                    base_url + "/media/" + order_items["item"]["image"]
                )
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
                    Pipe.objects.filter(pk=order_items.get("item_id")).values().first()
                )
                order_items.pop("item_id")
                order_items["item"] = sub_item
                base_url = request.build_absolute_uri("/").rstrip("/")
                order_items["item"]["image"] = (
                    base_url + "/media/" + order_items["item"]["image"]
                )

        return self.success_response(
            f"Orders for user fetched successfully", serializer.data
        )
