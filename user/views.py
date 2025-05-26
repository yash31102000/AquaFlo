from AquaFlo.Utils.default_response_mixin import DefaultResponseMixin
from AquaFlo.Utils.permissions import CustomAPIPermissions
from .serializers import *
from rest_framework import generics
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.contrib.auth.hashers import check_password
from django.conf import settings


# Create your views here.
class RegisterAPI(DefaultResponseMixin, generics.GenericAPIView):
    """
    User Register
    """

    serializer_class = RegisterSerializer
    permission_classes = [CustomAPIPermissions]

    def post(self, request):
        serializer = RegisterSerializer(
            data=self.request.data, context={"request": request}
        )

        if serializer.is_valid(raise_exception=True):
            serializer.save()

            """
            Send a welcome email to the newly registered user.
            """
            subject = "Registration Successful"
            message = f"Hello,\n\nYou have been successfully registered on our platform.\n\nThanks,\nThe Team"
            from_email = (
                settings.EMAIL_HOST_USER
            )  # You can use your default email or configure one in settings
            applications_link = "https://drive.google.com/file/d/1meU8C7f7-mWU39e9VYq_0kLdJf56NjFe/view?usp=sharing"
            serializer_data = serializer.data
            serializer_data["whatsappmessage"] = (
                f"*Appliction Link* : {applications_link}\n*UserID* : {self.request.data.get('phone_number')}\n*password* : {self.request.data.get('password')}"
            )
            # Sending the email
            send_mail(subject, message, from_email, [self.request.data.get("email")])
            return self.success_response("Registered successfully", serializer_data)

    def get(self, request):
        all_user = (
            UserModel.objects.all()
            .values(
                "id", "phone_number", "first_name", "last_name", "email", "addresses"
            )
            .filter(is_deleted=False, is_superuser=False)
        )
        return self.success_response("Registered successfully", all_user)

    def put(self, request, user_id=None):
        if user_id is None:
            return self.error_response("User ID is required")
        user = UserModel.objects.get(id=user_id, is_deleted=False)
        serializer = RegisterSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return self.success_response("User Update successfully")
        return self.error_response("User Update Faild")

    def delete(self, request, user_id=None):
        """
        Delete a user by ID
        """
        if user_id is None:
            return self.error_response("User ID is required")

        try:
            user = UserModel.objects.get(id=user_id, is_deleted=False)
        except UserModel.DoesNotExist:
            return self.error_response("User not found.")

        if user.is_superuser:
            return self.error_response("Admin users cannot be deleted.")

        user.is_deleted = True
        user.save()
        return self.success_response("User deleted successfully.")


class LoginAPI(DefaultResponseMixin, generics.GenericAPIView):
    """
    User Register
    """

    serializer_class = LoginSerializer

    def post(self, request):
        phone_number = request.data.get("phone_number")
        password = request.data.get("password")

        if UserModel.objects.filter(
            phone_number=phone_number, is_deleted=True
        ).exists():
            return self.error_response(
                "This user account has been deleted and is no longer active."
            )
        user = authenticate(request, phone_number=phone_number, password=password)
        if user:
            # addresses = [
            #     {
            #         **addr,
            #         "company_name": addr.get("company_name") or "-",
            #         "GST_Number":addr.get("GST_Number") or "-",
            #         "street": addr.get("street") or "-",
            #         "city": addr.get("city") or "-",
            #         "state": addr.get("state") or "-",
            #         "zip": addr.get("zip") or "-"

            #     }
            #     for addr in user.addresses
            # ]

            response_data = {
                "id": user.id,
                "phone_number": user.phone_number,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "is_admin": user.is_superuser,
                "tokens": user.tokens,
                "addresses": user.addresses,
            }
            return self.success_response("Login successfully", response_data)
        else:
            return self.error_response(
                "The phone number and password do not match. Please try again."
            )


class AddorRemoveAddressAPI(DefaultResponseMixin, generics.GenericAPIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = request.data.get("user_id", request.user.id)
        # user_id = request.user.id
        addresses = request.data.get("addresses")

        get_address = UserModel.objects.filter(id=user_id).first()

        if not get_address:
            return self.error_response("Address Not Found")

        get_address.addresses = addresses

        get_address.save()
        return self.success_response(
            "Address Update or Delete Successfully", get_address.addresses
        )


class UserDiscountViewSet(DefaultResponseMixin, generics.GenericAPIView):
    # permission_classes = [CustomAPIPermissions]
    # public_methods = ["GET"]
    # admin_only_methods = ["POST", "PUT", "DELETE"]
    def post(self, request):
        data = request.data.copy()
        data["user"] = request.user.id
        serializer = UserDiscountSerializer(data=data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return self.success_response("UserDiscount placed successfully")
        return self.error_response("UserDiscount placement failed")

    def get(self, request):
        user = request.user
        if user.is_superuser:
            discounts = UserDiscount.objects.all().values()
        else:
            discounts = UserDiscount.objects.filter(user=user).values()
        return self.success_response("User Discount list fetched successfully", discounts)

    def put(self, request, pk):
        try:
            user_discount = UserDiscount.objects.get(pk=pk, user=request.user)
        except UserDiscount.DoesNotExist:
            return self.error_response("UserDiscount not found")

        # Merge discount_data
        new_discounts = request.data.get("discount_data")
        if new_discounts is not None:
            if not isinstance(user_discount.discount_data, list):
                user_discount.discount_data = []

            existing_discounts = {
                item["id"]: item for item in user_discount.discount_data if "id" in item
            }

            for new_item in new_discounts:
                item_id = new_item.get("id")
                if item_id in existing_discounts:
                    existing_discounts[item_id].update(new_item)
                else:
                    existing_discounts[item_id] = new_item

            user_discount.discount_data = list(existing_discounts.values())

        # Merge price_data (if present)
        new_prices = request.data.get("price_data")
        if new_prices is not None:
            if not isinstance(user_discount.price_data, list):
                user_discount.price_data = []

            existing_prices = {
                item["id"]: item for item in user_discount.price_data if "id" in item
            }

            for new_item in new_prices:
                item_id = new_item.get("id")
                if item_id in existing_prices:
                    existing_prices[item_id].update(new_item)
                else:
                    existing_prices[item_id] = new_item

            user_discount.price_data = list(existing_prices.values())

        user_discount.save()
        return self.success_response("UserDiscount updated successfully")

    def delete(self, request, pk):
        user_discount = UserDiscount.objects.filter(id=pk, user=request.user).first()
        if not user_discount:
            return self.error_response("UserDiscount not found")
        user_discount.delete()
        return self.success_response("UserDiscount deleted successfully.")


class ChangePasswordView(DefaultResponseMixin, generics.GenericAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [CustomAPIPermissions]
    public_methods = ["POST"]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        user = request.user

        if serializer.is_valid():
            old_password = serializer.validated_data["old_password"]
            new_password = serializer.validated_data["new_password"]

            if not check_password(old_password, user.password):
                return self.error_response(
                    "Your Current Password is Wrong.",
                )

            user.set_password(new_password)
            user.save()

            return self.success_response("Your Password is successfully updated.")

        return self.error_response(serializer.errors)
