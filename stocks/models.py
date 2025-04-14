# models.py
from django.db import models
from django.core.validators import MinValueValidator
from category.models import Pipe


class StockTransaction(models.Model):
    TRANSACTION_TYPE = (
        ("IN", "In"),
        ("OUT", "Out"),
    )

    pipe = models.ForeignKey(
        Pipe, on_delete=models.CASCADE, related_name="transactions"
    )
    transaction_type = models.CharField(max_length=3, choices=TRANSACTION_TYPE)
    quantity = models.PositiveIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True, null=True)
    alert = models.CharField(max_length=500)
