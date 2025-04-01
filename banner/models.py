from django.db import models
from category.models import Pipe


# Create your models here.
class Banner(models.Model):
    title = models.CharField(max_length=255)
    image = models.ImageField()
    description = models.TextField()
    date = models.DateField(
        auto_now_add=True
    )  # Automatically set to the current date when created
    flag = models.BooleanField(default=True)
    category = models.ForeignKey(
        Pipe, on_delete=models.CASCADE, related_name="pipe", blank=True, null=True
    )

    def __str__(self):
        return self.title
