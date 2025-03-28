from AquaFlo.Utils.default_response_mixin import DefaultResponseMixin
from rest_framework import generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.utils import timezone
from datetime import timedelta

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
            return self.success_response("Invoice created successfully.", serializer.data)
        
        return self.error_response("Failed to create invoice.", serializer.errors)

    def put(self, request, *args, **kwargs):
        """
        Update an existing invoice instance.
        """
        try:
            invoice = Invoice.objects.get(id=kwargs["pk"])
        except Invoice.DoesNotExist:
            return self.error_response("Invoice not found.")
        
        # Validate and serialize data for updating the invoice
        serializer = InvoiceSerializer(invoice, data=request.data, partial=True, context={"request": request})

        if serializer.is_valid():
            invoice = serializer.save()  # This will call the `update` method in the serializer.
            return self.success_response("Invoice updated successfully.", serializer.data)

        return self.error_response("Failed to update invoice.", serializer.errors)

    def get(self, request, *args, **kwargs):
        """
        Retrieve a list of invoices, optionally filtering by date or other criteria.
        """
        try:
            invoices = Invoice.objects.all()
            serializer = InvoiceSerializer(invoices, many=True, context={"request": request})
            for invoice in serializer.data:
                invoice_order = Order.objects.filter(pk=invoice.get("order")).values().first()
                invoice["order"] = invoice_order
            return self.success_response("Invoices fetched successfully.", serializer.data)
        
        except Exception as e:
            return self.error_response(f"Failed to retrieve invoices : {e}")
