from django.db import models
from user.models import UserModel


# Create your models here.


class Order(models.Model):
    ORDER_STATUS = [
        ("PENDING", "Pending"),
        ("CONFIRM", "Confirm"),
        ("COMPLETED", "Completed"),
        ("CANCEL", "Cancel"),
    ]

    user = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name="user")
    order_items = models.JSONField(default=list, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=ORDER_STATUS, default="PENDING")
    address = models.JSONField()
    address_link = models.CharField(max_length=250, null=False, blank=False)
    cancellation_reason = models.CharField(max_length=250, null=True, blank=True)
