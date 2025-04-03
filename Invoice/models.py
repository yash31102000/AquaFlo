from order.models import Order
from django.db import models

class Invoice(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="invoice")
    invoice_number = models.AutoField(primary_key=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=0, null=True, blank=True)
    discount = models.DecimalField(max_digits=10, decimal_places=0, null=True, blank=True)
    final_amount = models.DecimalField(max_digits=10, decimal_places=0)
    issue_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    payment_status = models.CharField(max_length=20, choices=[
        ("PENDING", "Pending"),
        ("PAID", "Paid"),
        ("CANCELLED", "Cancelled"),
    ], default="PENDING")
    payment_method = models.CharField(max_length=50, null=True, blank=True)
    
    def __str__(self):
        return f"Invoice {self.invoice_number} for Order {self.order.id}"
