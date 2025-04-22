from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
import uuid
from rest_framework_simplejwt.tokens import RefreshToken
from category.models import Pipe


class UserManager(BaseUserManager):
    def create_user(self, phone_number, password=None, **extra_fields):
        if not phone_number:
            raise ValueError("The Phone Number field must be set")

        extra_fields.setdefault("is_active", True)
        user = self.model(phone_number=phone_number, **extra_fields)
        if password:
            user.set_password(password)  # Hash password before saving
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(phone_number, password, **extra_fields)


class UserModel(AbstractUser):
    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, unique=True
    )
    phone_number = models.CharField(max_length=15, unique=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255, blank=True, null=True)
    password = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, unique=True, null=True)
    addresses = models.JSONField(default=list, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  # Required for admin login
    is_superuser = models.BooleanField(default=False)  # Required for admin access
    created_on = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    objects = UserManager()  # Set custom manager

    USERNAME_FIELD = "phone_number"
    REQUIRED_FIELDS = ["first_name", "last_name"]  # Superuser must provide these

    @property
    def tokens(self):
        refresh = RefreshToken.for_user(self)
        return {"refresh": str(refresh), "access": str(refresh.access_token)}

    class Meta:
        db_table = "user"

class UserDiscount(models.Model):
    """
    Model to handle user-specific discounts for different categories and products.
    """
    user = models.ForeignKey(
        UserModel,
        on_delete=models.CASCADE,
        related_name='discounts'
    )
    
    # Can be applied to a category (any level in the hierarchy)
    category = models.ForeignKey(
        Pipe,
        on_delete=models.CASCADE,
        related_name='category_discounts',
        blank=True,
        null=True,
        help_text="If specified, discount applies to this category and all its subcategories"
    )
    
    # Or can be applied to a specific product
    product = models.ForeignKey(
        Pipe,
        on_delete=models.CASCADE,
        related_name='product_discounts',
        blank=True,
        null=True,
        help_text="If specified, discount applies only to this specific product"
    )
    
    discount_percent = models.PositiveIntegerField(
        help_text="Discount percentage (e.g., 10 for 10%)"
    )
    
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
