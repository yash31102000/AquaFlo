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
    name = models.CharField(max_length=200)
    image = models.ImageField()
    uniqcode = models.CharField(max_length=200, null=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Watertank(models.Model):
    sub_item = models.ForeignKey(SubItem,on_delete=models.CASCADE, related_name="watertank")
    height = models.CharField(max_length=200)
    width = models.CharField(max_length=200)

class Pipe(models.Model):
    """
    A recursive model to handle nested pipe categories with arbitrary depth.
    """
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    image = models.CharField(max_length=255, blank=True, null=True)
    
    # Self-referential relationship to allow unlimited nesting
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        related_name='sub_categories', 
        blank=True, 
        null=True
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Pipes"
