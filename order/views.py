from rest_framework import generics
from AquaFlo.Utils.default_response_mixin import DefaultResponseMixin
from user.models import UserDiscount
from .models import *
from category.models import Pipe, PipeDetail
from .serializers import *
from datetime import datetime

keys_to_remove = ["quantity", "mm", "code", "price"]


# Create your views here.
class OrderViewSet(DefaultResponseMixin, generics.GenericAPIView):
    # permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer  # Use OrderSerializer to handle order creation

    def is_accepted(self, value):
        # Check if the value is a whole number (either integer or float ending with .0)
        if value == int(
            value
        ):  # Checks if the value is effectively an integer (e.g., 20.0 or 20)
            return True
        return False

    def post(self, request):
        # Create the Order with valid order_items (IDs of SubItems)
        request.data["user"] = request.user.id
        serializer = OrderSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return self.success_response("Order placed successfully")
        return self.error_response("Order Placed Faild")

    def get(self, request, user_id=None, pk=None):
        """
        Fetch all orders or orders for a specific user (if user_id is provided).
        """
        user_id = request.query_params.get("user_id", None)

        if user_id:
            queryset = Order.objects.filter(user_id=user_id)
        elif pk:
            queryset = Order.objects.filter(pk=pk)
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
                    PipeDetail.objects.filter(pipe=item_id).values("basic_data").first()
                )
                item_basic_data = {}
                if basic_datas:
                    for basic_data in basic_datas.get("basic_data"):
                        if not basic_data.get("id") and basic_data.get("name"):
                            for datass in basic_data.get("data"):
                                if order_items.get("basic_data_id") == datass.get("id"):
                                    item_basic_data = datass
                                    if datass.get("packing") or datass.get("large_bag"):
                                        if order_items.get("message"):
                                            continue
                                        packing = int(datass.get("packing", 0))
                                        total_units = int(datass.get("packing", 0)) * int(
                                            order_items.get("quantity", 0)
                                        )
                                        large_bag = int(datass.get("large_bag", 0))
                                        order_items["price"] = str(basic_data.get("rate", ""))
                                        order_items["number_of_pic"] = str(total_units)
                                        if large_bag > 0:
                                            full_large_bags = total_units // large_bag
                                            remainder_units = total_units % large_bag
                                            if self.is_accepted(full_large_bags):
                                                order_items["large_bag_quantity"] = str(
                                                    full_large_bags
                                                )
                                                if remainder_units > 0 and packing > 0:
                                                    order_items["bag_quantity"] = str(
                                                        int(remainder_units / packing)
                                                    )
                                                # order_items.pop("quantity")
                                        else:
                                            order_items["number_of_pic"] = str(
                                                total_units
                                            )
                                            order_items["bag_quantity"] = str(
                                                int(order_items.get("quantity", 0))
                                            )
                                    else:
                                        order_items["number_of_pic"] = str(
                                            order_items.get("quantity", 0)
                                        )
                                        order_items["bag_quantity"] = str(
                                            int(order_items.get("quantity", 0))
                                        )
                                    order_items.pop("basic_data_id")
                                    break

                        else:
                            if order_items.get("basic_data_id") == basic_data.get("id"):
                                item_basic_data = basic_data
                                if basic_data.get("packing") or basic_data.get(
                                    "large_bag"
                                ):
                                    if order_items.get("message"):
                                        continue
                                    packing = int(basic_data.get("packing", 0))
                                    total_units = int(
                                        basic_data.get("packing", 0)
                                    ) * int(order_items.get("quantity", 0))
                                    large_bag = int(basic_data.get("large_bag", 0))
                                    order_items["price"] = str(basic_data.get("rate", ""))
                                    order_items["number_of_pic"] = str(total_units)
                                    if large_bag > 0:
                                        full_large_bags = total_units // large_bag
                                        remainder_units = total_units % large_bag
                                        if self.is_accepted(full_large_bags):
                                            order_items["large_bag_quantity"] = str(
                                                full_large_bags
                                            )
                                            if remainder_units > 0 and packing > 0:
                                                order_items["bag_quantity"] = str(
                                                    int(remainder_units / packing)
                                                )
                                            # order_items.pop("quantity")
                                    else:
                                        order_items["number_of_pic"] = str(total_units)
                                        order_items["bag_quantity"] = str(
                                            int(order_items.get("quantity", 0))
                                        )
                                else:
                                    order_items["number_of_pic"] = str(
                                        order_items.get("quantity", 0)
                                    )
                                    order_items["bag_quantity"] = str(
                                        int(order_items.get("quantity", 0))
                                    )
                                order_items.pop("basic_data_id")
                                break

                if sub_item:
                    base_url = request.build_absolute_uri("/").rstrip("/")
                    image_url = str(sub_item.image) if sub_item.image else None
                    product = sub_item.product
                    parent = product.parent if product else None
                    grandparent = parent.parent if parent else None

                    names = [
                        grandparent.name if grandparent else None,
                        parent.name if parent else None,
                        product.name if product else None,
                    ]

                    # Keep only the last 2 non-empty names
                    category_value_name = "   ➤   ".join([n for n in names if n][-2:])

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
                        user_discount = UserDiscount.objects.get(
                            user=data.get("user_data").get("id")
                        )
                    except:
                        user_discount = None
                    if user_discount:
                        for discount_data in user_discount.discount_data:
                            if sub_item.product.parent:
                                if str(discount_data.get("id")) == str(
                                    sub_item.product.parent.id
                                ):
                                    order_items["discount_percent"] = discount_data.get(
                                        "discount_percent"
                                    )
                                    order_items["discount_type"] = discount_data.get(
                                        "discount_type"
                                    )
                                if sub_item.product.parent.parent:
                                    if str(discount_data.get("id")) == str(
                                        sub_item.product.parent.parent.id
                                    ):
                                        order_items["discount_percent"] = (
                                            discount_data.get("discount_percent")
                                        )
                                        order_items["discount_type"] = (
                                            discount_data.get("discount_type")
                                        )
                            if str(discount_data.get("id")) == str(sub_item.product.id):
                                order_items["discount_percent"] = discount_data.get(
                                    "discount_percent"
                                )
                                order_items["discount_type"] = discount_data.get(
                                    "discount_type"
                                )
                        for price_data in user_discount.price_data:
                            basic_data_list = price_data.get("basic_data", [])
                            price_data_id = str(price_data.get("id"))
                            for basic_data in basic_data_list:
                                basic_price = basic_data.get("price")
                                # Match with parent
                                parent = sub_item.product.parent
                                if parent and price_data_id == str(parent.id):
                                    order_items["price"] = basic_price
                                # Match with grandparent
                                grandparent = parent.parent if parent else None
                                if grandparent and price_data_id == str(grandparent.id):
                                    order_items["price"] = basic_price
                                # Match with product
                                if price_data_id == str(sub_item.product.id):
                                    if basic_data.get("name") and isinstance(basic_data.get("data"), list):
                                        for bd in basic_data["data"]:
                                            order_items["price"] = bd.get("price")
                                    else:
                                        order_items["price"] = basic_price
                                # Match with sub_item
                                if price_data_id == str(sub_item.id):
                                    if basic_data.get("name") and isinstance(basic_data.get("data"), list):
                                        for bd in basic_data["data"]:
                                            bd_id = str(bd.get("id"))
                                            item_bd_id = str(order_items.get("item", {}).get("basic_data", {}).get("id"))
                                            if bd_id == item_bd_id:
                                                order_items["price"] = bd.get("price")
                                    else:
                                        order_items["price"] = basic_price


        label = "user" if user_id else "all"
        return self.success_response(
            f"Orders for {label} fetched successfully", response_data
        )

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
            if order_item.get("item_id") == data.get("item_id") and order_item.get(
                "basic_data_id"
            ) == data.get("basic_data_id"):
                new_order_item = order_item.copy()
                order_split_list.append(new_order_item)
                order_item["message"] = (
                    "This item is currently out of stock. We've created a new order for it. Once restocked, we'll fulfill it faithfully."
                )
                for key in keys_to_remove:
                    order_item.pop(key, None)
        if order_split_list:
            if Order.objects.filter(old_order=data.get("old_order")).exists():
                older_order = Order.objects.get(old_order=data.get("old_order"))
                order_split_list.append(next(iter(older_order.order_items)))
                older_order.order_items = order_split_list
                older_order.save()
            else:
                __, __ = Order.objects.update_or_create(
                    old_order=old_order,
                    order_items=order_split_list,
                    user=old_order.user,
                    address=old_order.address,
                    address_link=old_order.address_link,
                )
            old_order.save()
            return self.success_response("Order Split Successfully")
        else:
            return self.success_response(
                "No items were split; order remains unchanged."
            )
