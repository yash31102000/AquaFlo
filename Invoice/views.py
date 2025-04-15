from AquaFlo.Utils.default_response_mixin import DefaultResponseMixin
from rest_framework import generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from category.models import Pipe
from order.models import Order
from .models import Invoice
from .serializers import InvoiceSerializer


class InvoiceViewSet(DefaultResponseMixin, generics.GenericAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def post(self, request, *args, **kwargs):
        """
        Create a new invoice instance.
        """
        serializer = InvoiceSerializer(data=request.data, context={"request": request})

        if serializer.is_valid():
            # Save the invoice after validation
            invoice = serializer.save()
            return self.success_response(
                "Invoice created successfully.", serializer.data
            )

        return self.error_response("Failed to create invoice.", serializer.errors)

    def put(self, request, *args, **kwargs):
        """
        Update an existing invoice instance.
        """
        try:
            invoice = Invoice.objects.get(invoice_number=kwargs["pk"])
        except Invoice.DoesNotExist:
            return self.error_response("Invoice not found.")

        # Validate and serialize data for updating the invoice
        serializer = InvoiceSerializer(
            invoice, data=request.data, partial=True, context={"request": request}
        )

        if serializer.is_valid():
            invoice = (
                serializer.save()
            )  # This will call the `update` method in the serializer.
            return self.success_response(
                "Invoice updated successfully."
            )

        return self.error_response("Failed to update invoice.", serializer.errors)

    def get(self, request, *args, **kwargs):
        """
        Retrieve a list of invoices, optionally filtering by date or other criteria.
        """
        try:
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

                for item in order_items:
                    pipe_details = (
                        Pipe.objects.filter(id=item.get("item_id")).values().first()
                    )

                    base_url = request.build_absolute_uri("/").rstrip("/")
                    if pipe_details:
                        item["item"] = pipe_details
                        item["item"]["image"] = (
                            base_url + "/media/" + item["item"]["image"]
                        )
                        item.pop("item_id", None)
                    if item.get("discount_type") == "percentage":
                        per_item_discount = item.get("per_item_discount")
                        item_total = (
                            int(item.get("quantity", 0)) * int(item.get("price", 0))
                            if item.get("price")
                            else 0
                        )
                        discount_amount = item_total * int(per_item_discount) / 100
                        final_price = int(item_total - discount_amount)
                    elif item.get("discount_type") == "fixed":
                        per_item_discount = item.get("per_item_discount")
                        final_price = (
                            int(item.get("quantity", 0)) * (int(item.get("price", 0)) - int(per_item_discount))
                            if item.get("price")
                            else 0
                        )
                    else:
                        final_price = (
                            int(item.get("quantity", 0)) * (int(item.get("price", 0)) - int(per_item_discount))
                            if item.get("price")
                            else 0
                        )
                    total_amount += final_price

                tax_amount = int(invoice.get("tax_amount"))
                discount_amount = int(invoice.get("discount"))

                final_amount = total_amount + tax_amount - discount_amount

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
            return self.success_response(
                "Invoices fetched successfully.", serializer.data
            )

        except Exception as e:
            return self.error_response(f"Failed to retrieve invoices : {e}")
