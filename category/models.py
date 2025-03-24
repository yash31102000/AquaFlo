from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    is_deleted = models.BooleanField(default=False)


class Item(models.Model):
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="items"
    )
    name = models.CharField(max_length=200, unique=True)
    is_deleted = models.BooleanField(default=False)


    def __str__(self):
        return self.name

class SubItem(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="sub_items")
    name = models.CharField(max_length=200, unique=True)
    image = models.ImageField()
    uniqcode = models.CharField(max_length=200,null=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name
