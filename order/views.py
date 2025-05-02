from collections import defaultdict
from rest_framework.decorators import action
from rest_framework import generics
from AquaFlo.Utils.default_response_mixin import DefaultResponseMixin
from AquaFlo.Utils.permissions import CustomAPIPermissions
from .models import *
from category.models import Pipe, PipeDetail
from django.db.models.expressions import RawSQL
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
        orders = Order.objects.prefetch_related("order_items").order_by("created_at")
        serializer = OrderSerializer(orders, many=True)
        response_data = []

        # Prefetch all necessary Pipes and PipeDetails
        pipe_ids = {
            item["item_id"]
            for order in serializer.data
            for item in order.get("order_items", [])
        }
        pipes = Pipe.objects.filter(id__in=pipe_ids).select_related("product", "parent")
        pipe_map = {pipe.id: pipe for pipe in pipes}

        pipe_details = PipeDetail.objects.filter(pipe_id__in=pipe_ids).values("pipe_id", "basic_data")
        basic_data_map = defaultdict(list)
        for detail in pipe_details:
            basic_data_map[detail["pipe_id"]] = detail["basic_data"]

        base_url = request.build_absolute_uri("/").rstrip("/")

        for order in serializer.data:
            order["created_at"] = datetime.fromisoformat(order["created_at"].replace("Z", "")).strftime("%d-%m-%Y")
            for item in order.get("order_items", []):
                pipe = pipe_map.get(item["item_id"])
                basic_data_list = basic_data_map.get(item["item_id"], [])

                # Match correct basic data
                item_basic_data = None
                for basic in basic_data_list:
                    if item.get("code") == basic.get("code") and item.get("mm") == basic.get("mm"):
                        item_basic_data = basic
                        packing = int(basic.get("packing", 1))
                        large_bag = int(basic.get("large_bag", 1))
                        quantity = int(item.get("quantity", 0))
                        large_bag_quantity = (packing * quantity) // large_bag
                        item["large_bag_quantity"] = str(large_bag_quantity)
                        item["quantity"] = "" if large_bag_quantity else str(quantity)
                        break

                # Replace item_id with detailed item info
                if pipe:
                    image_url = f"{base_url}/media/{pipe.image}" if pipe.image else None
                    item["item"] = {
                        "id": pipe.id,
                        "name": pipe.name,
                        "image": image_url,
                        "parent_id": pipe.parent.id if pipe.parent else None,
                        "product_id": pipe.product.id if pipe.product else None,
                        "marked_as_favorite": pipe.marked_as_favorite,
                        "product_name": pipe.product.name if pipe.product else pipe.name,
                        "basic_data": item_basic_data,
                    }

                # Clean up unused fields
                item.pop("item_id", None)
                item.pop("code", None)
                item.pop("mm", None)

            response_data.append(order)

        return self.success_response("Order list fetched successfully", response_data)

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


#  YYYY-MM-DD
#  DD-MM-YYYY