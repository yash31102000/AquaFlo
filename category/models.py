from django.db import models


class Pipe(models.Model):
    """
    A recursive model to handle nested pipe categories with arbitrary depth.
    """

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    image = models.ImageField(blank=True, null=True)

    # Self-referential relationship to allow unlimited nesting
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        related_name="sub_categories",
        blank=True,
        null=True,
    )

    product = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        related_name="related_product",
        blank=True,
        null=True,
    )
    marked_as_favorite = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Pipes"


class PipeDetail(models.Model):
    pipe = models.ForeignKey(Pipe, on_delete=models.CASCADE, related_name="details")
    basic_data = models.JSONField(default=list, null=False, blank=False)


class BestSeller(models.Model):
    toggel = models.BooleanField(default=True)
    quantity = models.PositiveIntegerField()
