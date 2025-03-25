from django.db import models


# Create your models here.
class Banner(models.Model):
    title = models.CharField(max_length=255)
    image = models.ImageField()
    description = models.TextField()

    def __str__(self):
        return self.title
