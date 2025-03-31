from django.db import models


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
