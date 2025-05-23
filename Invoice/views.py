from AquaFlo.Utils.default_response_mixin import DefaultResponseMixin
from rest_framework import generics
from category.models import Pipe, PipeDetail
from order.models import Order
from user.models import UserDiscount
from .models import Invoice
from .serializers import InvoiceSerializer


class InvoiceViewSet(DefaultResponseMixin, generics.GenericAPIView):
    serializer_class = InvoiceSerializer
    # permission_classes = [IsAuthenticatedOrReadOnly]

    def is_accepted(self, value):
        if value == int(value):
            return True
        return False

    def post(self, request, *args, **kwargs):
        """
        Create a new invoice instance.
        """
        serializer = InvoiceSerializer(data=request.data, context={"request": request})

        if serializer.is_valid():
            invoice = serializer.save()
            return self.success_response("Invoice created successfully.")

        return self.error_response("Failed to create invoice.", serializer.errors)

    def put(self, request, *args, **kwargs):
        """,
        Update an existing invoice instance.
        """
        try:
            invoice = Invoice.objects.get(invoice_number=kwargs["pk"])
        except Invoice.DoesNotExist:
            return self.error_response("Invoice not found.")

        serializer = InvoiceSerializer(
            invoice, data=request.data, partial=True, context={"request": request}
        )

        if serializer.is_valid():
            invoice = serializer.save()
            return self.success_response("Invoice updated successfully.")

        return self.error_response("Failed to update invoice.", serializer.errors)

    def get(self, request, *args, **kwargs):
        if kwargs.get("pk", None):
            invoices = Invoice.objects.filter(
                order__user=kwargs.get("pk")
            ).select_related("order__user")
        elif kwargs.get("order_id", None):
            invoices = Invoice.objects.filter(
                order=kwargs.get("order_id")
            ).select_related("order__user")
        else:
            invoices = Invoice.objects.all().select_related("order__user")
        serializer = InvoiceSerializer(
            invoices, many=True, context={"request": request}
        )

        base_url = request.build_absolute_uri("/").rstrip("/")
        for invoice in serializer.data:

            order = invoice.get("order")

            if isinstance(order, int):
                invoice_order = Order.objects.get(id=order)

            user = {
                "phone_number": invoice_order.user.phone_number,
                "first_name": invoice_order.user.first_name,
                "last_name": invoice_order.user.last_name,
                "email": invoice_order.user.email,
            }

            order_items = invoice_order.order_items
            total_amount = 0

            for order_item in order_items:
                pipe_details = (
                    Pipe.objects.filter(id=order_item.get("item_id"))
                    .select_related("product")
                    .first()
                )
                if pipe_details.product.parent:
                    category_value_name = f"{pipe_details.product.parent.name}   ➤   {pipe_details.product.name}"
                else:
                    category_value_name = pipe_details.product.name
                basic_datas = (
                    PipeDetail.objects.filter(pipe_id=order_item.get("item_id"))
                    .values("basic_data")
                    .first()
                )
                if basic_datas:
                    for basic_data in basic_datas.get("basic_data"):
                        if not basic_data.get("id") and basic_data.get("name"):
                            for data in basic_data.get("data"):
                                if order_item.get("basic_data_id") == data.get("id"):
                                    item_basic_data = data
                                    if data.get("packing") or data.get("large_bag"):
                                        if order_item.get("message"):
                                            continue
                                        packing = int(data.get("packing", 0))
                                        total_units = int(data.get("packing", 0)) * int(
                                            order_item.get("quantity", 0)
                                        )
                                        large_bag = int(data.get("large_bag", 0))

                                        order_item["number_of_pic"] = str(total_units)
                                        if large_bag > 0:
                                            full_large_bags = total_units // large_bag
                                            remainder_units = total_units % large_bag
                                            if self.is_accepted(full_large_bags):
                                                order_item["large_bag_quantity"] = str(
                                                    full_large_bags
                                                )
                                                if remainder_units > 0 and packing > 0:
                                                    order_item["bag_quantity"] = str(
                                                        int(remainder_units / packing)
                                                    )
                                                # order_items.pop("quantity")
                                        else:
                                            order_item["number_of_pic"] = str(
                                                total_units
                                            )
                                            order_item["bag_quantity"] = str(
                                                int(order_item.get("quantity", 0))
                                            )
                                    else:
                                        order_item["number_of_pic"] = str(
                                            order_item.get("quantity", 0)
                                        )
                                        order_item["bag_quantity"] = str(
                                            int(order_item.get("quantity", 0))
                                        )
                                    order_item.pop("basic_data_id")
                                    break

                        else:
                            if order_item.get("basic_data_id") == basic_data.get("id"):
                                item_basic_data = basic_data
                                if basic_data.get("packing") or basic_data.get(
                                    "large_bag"
                                ):
                                    if order_item.get("message"):
                                        continue
                                    packing = int(basic_data.get("packing", 0))
                                    total_units = int(
                                        basic_data.get("packing", 0)
                                    ) * int(order_item.get("quantity", 0))
                                    large_bag = int(basic_data.get("large_bag", 0))

                                    order_item["number_of_pic"] = str(total_units)
                                    if large_bag > 0:
                                        full_large_bags = total_units // large_bag
                                        remainder_units = total_units % large_bag
                                        if self.is_accepted(full_large_bags):
                                            order_item["large_bag_quantity"] = str(
                                                full_large_bags
                                            )
                                            if remainder_units > 0 and packing > 0:
                                                order_item["bag_quantity"] = str(
                                                    int(remainder_units / packing)
                                                )
                                            # order_item.pop("quantity")
                                    else:
                                        order_item["number_of_pic"] = str(total_units)
                                        order_item["bag_quantity"] = str(
                                            int(order_item.get("quantity", 0))
                                        )
                                else:
                                    order_item["number_of_pic"] = str(
                                        order_item.get("quantity", 0)
                                    )
                                    order_item["bag_quantity"] = str(
                                        int(order_item.get("quantity", 0))
                                    )
                                order_item.pop("basic_data_id")
                                break
                base_url = request.build_absolute_uri("/").rstrip("/")

                image_url = str(pipe_details.image) if pipe_details.id else ""
                if pipe_details:
                    order_item["item"] = {
                        "id": pipe_details.id,
                        "name": pipe_details.name,
                        "image": (
                            base_url + "/media/" + image_url if image_url else None
                        ),
                        # "image_base64" : image_base64,
                        "category": category_value_name,
                        "basic_data": item_basic_data,
                    }
                    order_item.pop("item_id", None)
                try:
                    user_discount = UserDiscount.objects.get(user=invoice_order.user.id)
                except:
                    user_discount = None
                if user_discount:
                    for discount_data in user_discount.discount_data:
                        if pipe_details.product.parent:
                            if discount_data.get("id") == str(
                                pipe_details.product.parent.id
                            ):
                                order_item["discount_percent"] = discount_data.get(
                                    "discount_percent"
                                )
                                order_item["discount_type"] = discount_data.get(
                                    "discount_type"
                                )
                            if pipe_details.product.parent.parent:
                                if discount_data.get("id") == str(
                                    pipe_details.product.parent.parent.id
                                ):
                                    order_item["discount_percent"] = discount_data.get(
                                        "discount_percent"
                                    )
                                    order_item["discount_type"] = discount_data.get(
                                        "discount_type"
                                    )
                        if discount_data.get("id") == str(pipe_details.product.id):
                            order_item["discount_percent"] = discount_data.get(
                                "discount_percent"
                            )
                            order_item["discount_type"] = discount_data.get(
                                "discount_type"
                            )
                if order_item.get("discount_type") == "%":
                    discount_percent = order_item.get("discount_percent")
                    item_total = (
                        int(order_item.get("quantity", 0))
                        * int(order_item.get("price", 0))
                        if order_item.get("price")
                        else 0
                    )
                    discount_amount = item_total * int(discount_percent) / 100
                    final_price = int(item_total - discount_amount)
                elif order_item.get("discount_type") == "₹":
                    discount_percent = order_item.get("discount_percent")
                    if discount_percent == "":
                        discount_percent = 0
                    if not order_item.get("price"):
                        continue
                    price = int(order_item.get("number_of_pic", 0)) * int(
                        order_item.get("price", 0)
                    )
                    final_price = price - int(discount_percent)
                else:
                    discount_percent = order_item.get("discount_percent", 0)
                    if discount_percent == "":
                        discount_percent = 0
                    final_price = (
                        int(order_item.get("quantity", 0))
                        * (float(order_item.get("price", 0)) - float(discount_percent))
                        if order_item.get("price")
                        else 0
                    )

                total_amount += final_price

            tax_percentage = int(invoice.get("tax_percentage"))
            discount_amount = int(invoice.get("discount"))
            tax_amount = total_amount * (tax_percentage / 100)
            total_taxed_amount = total_amount + tax_amount
            if invoice.get("discount_type") == "%":
                discounted_amount = total_taxed_amount * (discount_amount / 100)
                final_amount = total_taxed_amount - discounted_amount
            elif invoice.get("discount_type") == "₹":
                final_amount = total_taxed_amount - discount_amount

            invoice["tax_amount"] = tax_amount
            invoice["total_amount"] = total_amount
            invoice["final_amount"] = final_amount

            invoice["order"] = {
                "id": invoice_order.id,
                "user": user,
                "order_items": order_items,
                "created_at": invoice_order.created_at,
                "status": invoice_order.status,
                "address": invoice_order.address,
                "address_link": invoice_order.address_link,
                "cancellation_reason": invoice_order.cancellation_reason,
            }
        return self.success_response("Invoices fetched successfully.", serializer.data)


class TotalTransactionViewSet(DefaultResponseMixin, generics.GenericAPIView):
    def get(self, request):
        invoices = Invoice.objects.all()
        pending_amount = 0
        paid_amount = 0
        base_url = request.build_absolute_uri("/").rstrip("/")

        for invoice in invoices:
            total_amount = self._calculate_invoice_amount(invoice, base_url)

            if invoice.payment_status == "PENDING":
                pending_amount += total_amount
            elif invoice.payment_status == "PAID":
                paid_amount += total_amount

        return self.error_response(
            "Transaction Fetch successfully",
            {"PENDING_AMOUNT": pending_amount, "PAID_AMOUNT": paid_amount},
        )

    def _calculate_invoice_amount(self, invoice, base_url):
        """Calculate the total amount for an invoice including tax and discounts."""
        total = 0

        for item in invoice.order.order_items:
            self._enrich_item_with_details(item, base_url)
            total += self._calculate_item_final_price(item)

        # Add tax and subtract invoice discount
        total += invoice.tax_amount
        total -= invoice.discount

        return total

    def _enrich_item_with_details(self, item, base_url):
        """Add pipe details to the item if available."""
        pipe_details = Pipe.objects.filter(id=item.get("item_id")).values().first()

        if pipe_details:
            item["item"] = pipe_details
            item["item"]["image"] = base_url + "/media/" + item["item"]["image"]
            item.pop("item_id", None)

    def _calculate_item_final_price(self, item):
        """Calculate the final price for an item based on quantity, price and discount."""
        quantity = int(item.get("quantity", 0))
        price = int(item.get("price", 0)) if item.get("price") else 0
        discount_percent = item.get("discount_percent", 0)

        # Handle empty discount
        if discount_percent == "":
            discount_percent = 0
        else:
            discount_percent = int(discount_percent)

        discount_type = item.get("discount_type")

        if discount_type == "%":
            item_total = quantity * price
            discount_amount = item_total * discount_percent / 100
            return int(item_total - discount_amount)
        elif discount_type == "₹" or discount_type is None:
            return quantity * (price - discount_percent)

        return 0
