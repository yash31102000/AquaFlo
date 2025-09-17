from AquaFlo.Utils.default_response_mixin import DefaultResponseMixin
from rest_framework import generics
from category.models import Pipe, PipeDetail
from order.models import Order
from user.models import UserDiscount
from .models import Invoice
from .serializers import InvoiceSerializer


class InvoiceViewSet(DefaultResponseMixin, generics.GenericAPIView):
    serializer_class = InvoiceSerializer

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
            serializer.save()
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

            order_items["large_bag_quantity"] = (
                str(full_large_bags) if self.is_accepted(full_large_bags) else "0"
            )

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

    def get(self, request, *args, **kwargs):
        """Main method with reduced cognitive complexity."""
        invoices = self._get_invoices(kwargs)
        serializer = InvoiceSerializer(
            invoices, many=True, context={"request": request}
        )
        base_url = request.build_absolute_uri("/").rstrip("/")

        processed_data = [
            self._process_invoice(invoice, base_url) for invoice in serializer.data
        ]

        return self.success_response("Invoices fetched successfully.", processed_data)

    def _get_invoices(self, kwargs):
        """Get invoices based on provided parameters."""
        if kwargs.get("pk"):
            return Invoice.objects.filter(order__user=kwargs["pk"]).select_related(
                "order__user"
            )
        elif kwargs.get("order_id"):
            return Invoice.objects.filter(order=kwargs["order_id"]).select_related(
                "order__user"
            )
        else:
            return Invoice.objects.all().select_related("order__user")

    def _process_invoice(self, invoice, base_url):
        """Process a single invoice with all its related data."""
        order = invoice.get("order")
        if not isinstance(order, int):
            return invoice

        invoice_order = Order.objects.get(id=order)
        user_data = self._get_user_data(invoice_order.user)

        processed_order_items = self._process_order_items(
            invoice_order.order_items, invoice_order.user, base_url
        )

        total_amount = sum(item.get("final_price", 0) for item in processed_order_items)
        amounts = self._calculate_invoice_amounts(invoice, total_amount)

        # Update invoice with calculated amounts
        invoice.update(amounts)

        # Update invoice with processed order data
        invoice["order"] = {
            "id": invoice_order.id,
            "user": user_data,
            "order_items": processed_order_items,
            "created_at": invoice_order.created_at,
            "status": invoice_order.status,
            "address": invoice_order.address,
            "address_link": invoice_order.address_link,
            "cancellation_reason": invoice_order.cancellation_reason,
        }

        return invoice

    def _get_user_data(self, user):
        """Extract user data for the invoice."""
        return {
            "phone_number": user.phone_number,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
        }

    def _process_order_items(self, order_items, user, base_url):
        """Process all order items for an invoice."""
        processed_items = []
        user_discount = self._get_user_discount(user)

        for order_item in order_items:
            processed_item = self._process_single_order_item(
                order_item, user_discount, base_url
            )
            processed_items.append(processed_item)

        return processed_items

    def _get_user_discount(self, user):
        """Get user discount data if it exists."""
        try:
            return UserDiscount.objects.get(user=user.id)
        except UserDiscount.DoesNotExist:
            return None

    def _process_single_order_item(self, order_item, user_discount, base_url):
        """Process a single order item with all its details."""
        pipe_details = self._get_pipe_details(order_item.get("item_id"))

        # Get item basic data
        item_basic_data = self._get_item_basic_data(order_item)

        # Build item data
        order_item["item"] = self._build_item_data(
            pipe_details, base_url, item_basic_data
        )
        order_item.pop("item_id", None)

        # Apply discounts
        self._apply_discount_to_item(order_item, pipe_details, user_discount)

        # Calculate final price
        final_price = self._calculate_item_final_price(order_item)
        order_item["final_price"] = final_price

        return order_item

    def _get_pipe_details(self, item_id):
        """Get pipe details for an order item."""
        return Pipe.objects.filter(id=item_id).select_related("product").first()

    def _get_item_basic_data(self, order_item):
        """Get and process basic data for an order item."""
        basic_datas = (
            PipeDetail.objects.filter(pipe_id=order_item.get("item_id"))
            .values("basic_data")
            .first()
        )

        if not basic_datas:
            return None

        basic_data_id = order_item.get("basic_data_id")
        if not basic_data_id:
            return None

        for basic_data in basic_datas.get("basic_data", []):
            item_basic_data = self._find_matching_basic_data(
                basic_data, basic_data_id, order_item
            )
            if item_basic_data:
                order_item.pop("basic_data_id", None)
                return item_basic_data

        return None

    def _find_matching_basic_data(self, basic_data, basic_data_id, order_item):
        """Find matching basic data and apply packing calculation."""
        if not basic_data.get("id") and basic_data.get("name"):
            # Search in nested data
            for data in basic_data.get("data", []):
                if basic_data_id == data.get("id"):
                    self.apply_packing_calculation(order_item, data)
                    return data
        elif basic_data_id == basic_data.get("id"):
            # Direct match
            self.apply_packing_calculation(order_item, basic_data)
            return basic_data

        return None

    def _build_item_data(self, pipe_details, base_url, item_basic_data):
        """Build item data dictionary."""
        category_name = self._get_category_name(pipe_details)
        image_url = (
            str(pipe_details.image) if pipe_details.id and pipe_details.image else ""
        )

        return {
            "id": pipe_details.id,
            "name": pipe_details.name,
            "image": f"{base_url}/media/{image_url}" if image_url else None,
            "category": category_name,
            "basic_data": item_basic_data,
        }

    def _get_category_name(self, pipe_details):
        """Get the category name for a pipe detail."""
        if pipe_details.product.parent:
            return (
                f"{pipe_details.product.parent.name}   ➤   {pipe_details.product.name}"
            )
        else:
            return pipe_details.product.name

    def _apply_discount_to_item(self, order_item, pipe_details, user_discount):
        """Apply discount to an order item if applicable."""
        if not user_discount or not user_discount.discount_data:
            return

        for discount_data in user_discount.discount_data:
            if self._discount_applies_to_product(discount_data, pipe_details):
                order_item["discount_percent"] = discount_data.get("discount_percent")
                order_item["discount_type"] = discount_data.get("discount_type")
                break

    def _discount_applies_to_product(self, discount_data, pipe_details):
        """Check if discount applies to the given product."""
        discount_id = discount_data.get("id")
        product = pipe_details.product

        # Check direct product match
        if discount_id == str(product.id):
            return True

        # Check parent product match
        if product.parent and discount_id == str(product.parent.id):
            return True

        # Check grandparent product match
        if (
            product.parent
            and product.parent.parent
            and discount_id == str(product.parent.parent.id)
        ):
            return True

        return False

    def _calculate_item_final_price(self, order_item):
        """Calculate the final price for an order item after discount."""
        discount_type = order_item.get("discount_type")
        discount_percent = order_item.get("discount_percent", 0) or 0
        quantity = float(order_item.get("quantity", 0))
        price = float(order_item.get("price", 0)) if order_item.get("price") else 0

        if discount_type == "%":
            item_total = quantity * price
            discount_percent = (
                int(discount_percent) if str(discount_percent).strip() else 0
            )
            discount_amount = item_total * discount_percent / 100
            return int(item_total - discount_amount)

        elif discount_type == "₹":
            if not price:
                return 0
            number_of_pic = float(order_item.get("number_of_pic", 0))
            total_price = int(number_of_pic) * int(price)
            return total_price - int(discount_percent)

        else:
            # No specific discount type or default case
            return int(quantity * (price - float(discount_percent))) if price else 0

    def _calculate_invoice_amounts(self, invoice, total_amount):
        """Calculate tax and final amounts for the invoice."""
        tax_percentage = int(invoice.get("tax_percentage", 0))
        discount_amount = int(invoice.get("discount", 0))

        tax_amount = total_amount * (tax_percentage / 100)
        total_taxed_amount = total_amount + tax_amount

        if invoice.get("discount_type") == "%":
            discounted_amount = total_taxed_amount * (discount_amount / 100)
            final_amount = total_taxed_amount - discounted_amount
        elif invoice.get("discount_type") == "₹":
            final_amount = total_taxed_amount - discount_amount
        else:
            final_amount = total_taxed_amount

        return {
            "tax_amount": tax_amount,
            "total_amount": total_amount,
            "final_amount": final_amount,
        }


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
