from rest_framework import generics
from AquaFlo.Utils.default_response_mixin import DefaultResponseMixin
from user.models import UserDiscount
from .models import Order
from category.models import Pipe, PipeDetail
from .serializers import OrderSerializer
from datetime import datetime

keys_to_remove = ["quantity", "mm", "code", "price"]

def safe_int(value):
    try:
        return int(value)
    except (ValueError, TypeError):
        return 0


# Create your views here.
class OrderViewSet(DefaultResponseMixin, generics.GenericAPIView):
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

    def _to_int(self, val, default=0):
        try:
            return int(val)
        except Exception:
            return default

    def apply_packing_calculation(self, order_items, basic_data):
        """
        Calculate number_of_pic, large_bag_quantity, bag_quantity, and quantity (loose pieces left after full bags).
        """
        if order_items.get("message"):
            return

        packing = self._to_int(basic_data.get("packing", 0))
        large_bag = self._to_int(basic_data.get("large_bag", 0))
        order_items["price"] = str(basic_data.get("rate", ""))

        total_units = self._to_int(order_items.get("quantity", 0))

        # Reset stale quantities
        order_items.pop("large_bag_quantity", None)
        order_items.pop("bag_quantity", None)

        if large_bag > 0:
            # Large bag calculation
            full_large_bags = total_units // large_bag
            remainder_units = total_units % large_bag

            order_items["large_bag_quantity"] = str(full_large_bags) if self.is_accepted(full_large_bags) else "0"

            # Small bag calculation
            if packing > 0:
                bag_qty = remainder_units // packing
                leftover_pieces = remainder_units % packing
                order_items["bag_quantity"] = str(bag_qty)
                order_items["number_of_pic"] = str(leftover_pieces)  # only loose pieces
            else:
                order_items["bag_quantity"] = "0"
                order_items["number_of_pic"] = str(remainder_units)

        else:
            # No large bag packaging
            order_items["large_bag_quantity"] = "0"
            if packing > 0:
                bag_qty = total_units // packing
                leftover_pieces = total_units % packing
                order_items["bag_quantity"] = str(bag_qty)
                order_items["number_of_pic"] = str(leftover_pieces)
            else:
                order_items["bag_quantity"] = "0"
                order_items["number_of_pic"] = str(total_units)

    def delete(self, request, pk):
        order = Order.objects.filter(id=pk).first()
        if not order:
            return self.error_response("Order not found")
        order.delete()
        return self.success_response("Order deleted successfully")

    def get(self, request, user_id=None, pk=None):
        """Fetch all orders or orders for a specific user (if user_id provided)."""
        queryset = self.get_orders_queryset(request, pk)
        response_data = self.serialize_orders(queryset)

        for order in response_data:
            self.format_created_at(order)
            for order_item in order.get("order_items", []):
                self.enrich_order_item(order, order_item, request)

        label = "user" if user_id else "all"
        return self.success_response(f"Orders for {label} fetched successfully", response_data)

    # ---------------- Helper Methods ---------------- #

    def get_orders_queryset(self, request, pk):
        query_user_id = request.query_params.get("user_id")
        if query_user_id:
            return Order.objects.filter(user_id=query_user_id).order_by("-created_at")
        elif pk:
            return Order.objects.filter(pk=pk).order_by("-created_at")
        return Order.objects.all().order_by("-created_at")

    def serialize_orders(self, queryset):
        return OrderSerializer(queryset, many=True).data.copy()

    def format_created_at(self, order):
        if not order.get("created_at"):
            return
        try:
            order["created_at"] = (
                datetime.fromisoformat(order["created_at"].replace("Z", ""))
                .date()
                .strftime("%d-%m-%Y")
            )
        except Exception:
            pass  # Keep original if parsing fails

    def enrich_order_item(self, order, order_item, request):
        sub_item = self.get_sub_item(order_item.get("item_id"))
        item_basic_data = self.get_item_basic_data(order_item)

        if sub_item:
            order_item.pop("item_id", None)
            order_item["item"] = self.build_item_data(sub_item, request, item_basic_data)
            self.apply_discounts(order, order_item, sub_item)
            self.apply_prices(order_item, sub_item)

    def get_sub_item(self, item_id):
        return Pipe.objects.filter(pk=item_id).select_related("product", "parent").first()

    def get_item_basic_data(self, order_item):
        basic_datas = PipeDetail.objects.filter(pipe=order_item.get("item_id")).values("basic_data").first()
        if not basic_datas:
            return {}

        for basic_data in basic_datas.get("basic_data", []):
            if not basic_data.get("id") and basic_data.get("name"):
                for datass in basic_data.get("data", []):
                    if order_item.get("basic_data_id") == datass.get("id"):
                        self.apply_packing_calculation(order_item, datass)
                        order_item.pop("basic_data_id", None)
                        return datass
            elif order_item.get("basic_data_id") == basic_data.get("id"):
                self.apply_packing_calculation(order_item, basic_data)
                order_item.pop("basic_data_id", None)
                return basic_data
        return {}

    def build_item_data(self, sub_item, request, item_basic_data):
        base_url = request.build_absolute_uri("/").rstrip("/")
        image_url = str(sub_item.image) if sub_item.image else None

        product = sub_item.product
        parent = product.parent if product else None
        grandparent = parent.parent if parent else None

        names = [grandparent.name if grandparent else None,
                parent.name if parent else None,
                product.name if product else None]
        category_value_name = "   ➤   ".join([n for n in names if n][-2:])

        return {
            "id": sub_item.id,
            "name": sub_item.name,
            "image": (base_url + "/media/" + image_url) if image_url else None,
            "category": category_value_name,
            "basic_data": item_basic_data,
        }

    def apply_discounts(self, order, order_item, sub_item):
        try:
            user_discount = UserDiscount.objects.get(user=order.get("user_data").get("id"))
        except Exception:
            return

        for discount_data in user_discount.discount_data:
            self.match_discount(order_item, discount_data, sub_item)

    def match_discount(self, order_item, discount_data, sub_item):
        ids_to_check = [
            sub_item.product.parent.id if sub_item.product.parent else None,
            sub_item.product.parent.parent.id if sub_item.product.parent and sub_item.product.parent.parent else None,
            sub_item.product.id
        ]
        if str(discount_data.get("id")) in map(str, filter(None, ids_to_check)):
            order_item["discount_percent"] = discount_data.get("discount_percent")
            order_item["discount_type"] = discount_data.get("discount_type")

    def apply_prices(self, order_item, sub_item):
        try:
            user_discount = UserDiscount.objects.get(user=order_item.get("user_id"))
        except Exception:
            return

        for price_data in user_discount.price_data:
            self.match_price(order_item, price_data, sub_item)

    def match_price(self, order_item, price_data, sub_item):
        price_data_id = str(price_data.get("id"))
        for basic_data in price_data.get("basic_data", []):
            basic_price = basic_data.get("price")
            if self.price_matches(price_data_id, sub_item, basic_data, order_item):
                order_item["price"] = basic_price

    def price_matches(self, price_data_id, sub_item, basic_data, order_item):
        parent = sub_item.product.parent
        grandparent = parent.parent if parent else None
        if price_data_id in [str(pid) for pid in [parent.id if parent else None, grandparent.id if grandparent else None, sub_item.product.id, sub_item.id]]:
            if basic_data.get("name") and isinstance(basic_data.get("data"), list):
                for bd in basic_data["data"]:
                    if str(bd.get("id")) == str(order_item.get("item", {}).get("basic_data", {}).get("id")):
                        order_item["price"] = bd.get("price")
                        return True
            else:
                return True
        return False

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
