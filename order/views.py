from rest_framework.decorators import action
from rest_framework import generics
from AquaFlo.Utils.default_response_mixin import DefaultResponseMixin
from AquaFlo.Utils.permissions import CustomAPIPermissions
from user.models import UserDiscount
from .models import *
from category.models import Pipe, PipeDetail
from django.db.models.expressions import RawSQL
from .serializers import *
from datetime import datetime

keys_to_remove = ["quantity", "mm", "code", "price"]

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

    def get(self, request, user_id=None):
        """
        Fetch all orders or orders for a specific user (if user_id is provided).
        """
        user_id = request.query_params.get("user_id", None)

        if user_id:
            queryset = Order.objects.filter(user_id=user_id)
        else:
            queryset = Order.objects.all()

        queryset = queryset.order_by("-created_at")
        serializer = OrderSerializer(queryset, many=True)
        response_data = serializer.data.copy()

        for data in response_data:
            # Format created_at
            data["created_at"] = (
                datetime.fromisoformat(data["created_at"].replace("Z", ""))
                .date()
                .strftime("%d-%m-%Y")
            )

            for order_items in data.get("order_items"):
                item_id = order_items.get("item_id")
                sub_item = (
                    Pipe.objects.filter(pk=item_id)
                    .select_related("product", "parent")
                    .first()
                )

                basic_datas = (
                    PipeDetail.objects.filter(pipe=item_id)
                    .values("basic_data")
                    .first()
                )
                item_basic_data = {}
                if basic_datas:
                    for basic_data in basic_datas.get("basic_data"):
                        if order_items.get("basic_data_id") == basic_data.get("id"):
                            item_basic_data = basic_data
                            if basic_data.get("packing") and basic_data.get("large_bag"):
                                value = int(
                                    (
                                        int(basic_data.get("packing"))
                                        * int(order_items.get("quantity"))
                                    )
                                    / int(basic_data.get("large_bag"))
                                )
                                if value != 0:
                                    order_items["quantity"] = ""
                                    order_items["large_bag_quantity"] = str(value)
                                else:
                                    order_items["large_bag_quantity"] = ""
                                order_items.pop("basic_data_id")
                                # order_items.pop("mm")
                                break

                if sub_item:
                    base_url = request.build_absolute_uri("/").rstrip("/")
                    image_url = str(sub_item.image) if sub_item.image else None
                    category_value_name = (
                        f"{sub_item.product.parent.name}  -->  {sub_item.product.name}"
                        if sub_item.product and sub_item.product.parent else ""
                    )
                    order_items.pop("item_id", None)
                    order_items["item"] = {
                        "id": sub_item.id,
                        "name": sub_item.name,
                        "image": (
                            base_url + "/media/" + image_url if image_url else None
                        ),
                        "category": category_value_name,
                        "basic_data": item_basic_data,
                    }

                    try:
                        print(data.get("user_data").get("id"))
                        user_discount = UserDiscount.objects.get(user = data.get("user_data").get("id"))
                    except:
                        user_discount = None
                    if user_discount:
                        for discount_data in user_discount.discount_data:
                            if sub_item.product.parent:
                                if discount_data.get("id") == str(sub_item.product.parent.id):
                                    order_items['discount_percent'] = discount_data.get("discount_percent")
                                    order_items['discount_type'] = discount_data.get("discount_type")
                                if sub_item.product.parent.parent:
                                    if discount_data.get("id") == str(sub_item.product.parent.parent.id):
                                        order_items['discount_percent'] = discount_data.get("discount_percent")
                                        order_items['discount_type'] = discount_data.get("discount_type")
                            if discount_data.get("id") == str(sub_item.product.id):
                                order_items['discount_percent'] = discount_data.get("discount_percent")
                                order_items['discount_type'] = discount_data.get("discount_type")

        label = "user" if user_id else "all"
        return self.success_response(f"Orders for {label} fetched successfully", response_data)


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


class OrderSplitViewSet(DefaultResponseMixin, generics.GenericAPIView):
    def post(
        self,
        request,
    ):
        order_split_list = []
        data = request.data
        old_order = Order.objects.get(pk=data.get("old_order"))
        for order_item in old_order.order_items:
            if order_item.get("item_id") == data.get("item_id"):
                new_order_item = order_item.copy()
                order_split_list.append(new_order_item)
                order_item["message"] = (
                    "This items are currently out of stock. We've created a new order for them. Once restocked, we'll fulfill it faithfully."
                )
                for key in keys_to_remove:
                    order_item.pop(
                        key, None
                    )

        __, __ = Order.objects.update_or_create(
            order_items=order_split_list,
            user=old_order.user,
            address=old_order.address,
            address_link=old_order.address_link,
        )
        old_order.save()
        return self.success_response("Order Split Successfully")



# [{"id": 3, "discount_percent": 10, "discount_type": "fixed"}, {"id": 171, "discount_percent": 10, "discount_type": "fixed"}]