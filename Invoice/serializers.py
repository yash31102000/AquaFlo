from rest_framework import serializers
from .models import Invoice
from decimal import Decimal


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = [
            "invoice_number",
            "order",
            "total_amount",
            "tax_amount",
            "discount",
            "final_amount",
            "issue_date",
            "due_date",
            "payment_status",
            "payment_method",
        ]

    def validate(self, data):
        """
        Custom validation for the invoice total amount and final amount.
        """
        total_amount = data.get("total_amount")
        tax_amount = data.get("tax_amount", Decimal("0"))
        discount = data.get("discount", Decimal("0"))

        # Final amount should be the sum of total amount + tax - discount + shipping fee
        calculated_final_amount = total_amount + tax_amount - discount
        if data.get("final_amount") != calculated_final_amount:
            raise serializers.ValidationError(
                "Final amount is incorrect. It must be the sum of total amount, tax, shipping fee, and discount."
            )
        return data
