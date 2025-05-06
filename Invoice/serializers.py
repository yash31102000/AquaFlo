from rest_framework import serializers
from .models import Invoice
from decimal import Decimal


class InvoiceSerializer(serializers.ModelSerializer):
    tax_percentage = serializers.CharField(required=False)
    discount_type = serializers.CharField(required=False)

    class Meta:
        model = Invoice
        fields = [
            "invoice_number",
            "order",
            "tax_amount",
            "discount",
            "issue_date",
            "due_date",
            "payment_status",
            "payment_method",
            "tax_percentage",
            "discount_type"
        ]
