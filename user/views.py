import json
from AquaFlo.Utils.default_response_mixin import DefaultResponseMixin
from AquaFlo.Utils.permissions import CustomAPIPermissions
from .serializers import RegisterSerializer, LoginSerializer, UserDiscountSerializer, ChangePasswordSerializer
from rest_framework import generics
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.contrib.auth.hashers import check_password
from django.conf import settings
from .models import UserDiscount, UserModel

USERIDREQ = "User ID is required"

# Create your views here.
class RegisterAPI(DefaultResponseMixin, generics.GenericAPIView):
    """
    User Register
    """

    serializer_class = RegisterSerializer

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
            message = "Hello,\n\nYou have been successfully registered on our platform.\n\nThanks,\nThe Team"
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
                "id", "phone_number", "first_name", "last_name", "email", "addresses","is_active", "role", "role_flag"
            )
            .filter(is_deleted=False, is_superuser=False)
        )
        all_addresses_city_list = []
        for user in all_user:
            for addresses in user.get("addresses"):
                all_addresses_city_list.append(addresses.get("city"))
        return self.success_response("Registered successfully", all_user, set(all_addresses_city_list), "city_list")

    def put(self, request, user_id=None):
        if user_id is None:
            return self.error_response(USERIDREQ)
        user = UserModel.objects.get(id=user_id, is_deleted=False)
        
        if "role_flag" in request.data and not request.user.is_superuser:
             return self.error_response("You are not allowed to edit 'role_flag'.")
        
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
            return self.error_response(USERIDREQ)

        try:
            user = UserModel.objects.get(id=user_id, is_deleted=False)
        except UserModel.DoesNotExist:
            return self.error_response("User not found.")

        if user.is_superuser:
            return self.error_response("Admin users cannot be deleted.")

        user.is_deleted = True
        user.save()
        return self.success_response("User deleted successfully.")

class DeletedUserList(DefaultResponseMixin, generics.GenericAPIView):
    def get(self, request):
        deleted_users = (
            UserModel.objects.filter(is_deleted=True)
            .values("id", "phone_number", "first_name", "last_name", "email", "addresses","is_active", "role", "role_flag")
        )
        return self.success_response("Deleted users fetched successfully", deleted_users)
    
    def put(self, request):
        user_id = request.data.get("user_id")
        if not user_id:
            return self.error_response(USERIDREQ)

        try:
            user = UserModel.objects.get(id=user_id, is_deleted=True)
        except UserModel.DoesNotExist:
            return self.error_response("Deleted user not found.")

        user.is_deleted = False
        user.save()
        return self.success_response("User restored successfully.")

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
            # Check role_flag
            if not user.is_superuser and not user.role_flag:
                return self.error_response("Your account is not authorized to login. Please contact the administrator.")

            # If superuser, ensure role_flag is set
            if user.is_superuser and not user.role_flag:
                user.role_flag = True
                user.save()
           
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

    def post(self, request):
        user_id = request.data.get("user_id", request.user.id)
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
    def post(self, request):
        data = request.data.copy()

        # Allow superusers to specify a user ID
        if request.user.is_superuser and "user" in data:
            user_id = data["user"]
        else:
            user_id = request.user.id

        data["user"] = user_id
        user_discounts = UserDiscount.objects.get(user=data.get("user"))
        if user_discounts:
            if data.get("price_data"):
                new_list = user_discounts.price_data+data.get("price_data")
                unique_data = []
                seen = set()
                for item in new_list:
                    item_str = json.dumps(item, sort_keys=True)
                    if item_str not in seen:
                        seen.add(item_str)
                        unique_data.append(item)
                user_discounts.price_data = unique_data
            self.discount_data(data, user_discounts)
            user_discounts.save()
            return self.success_response("UserDiscount placed successfully")
        serializer = UserDiscountSerializer(data=data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return self.success_response("UserDiscount placed successfully")
        return self.error_response("UserDiscount placement failed")

    def discount_data(self, data, user_discounts):
        if data.get("discount_data"):
            new_list = user_discounts.discount_data+data.get("discount_data")
            unique_data = []
            seen = set()
            for item in new_list:
                item_str = json.dumps(item, sort_keys=True)
                if item_str not in seen:
                    seen.add(item_str)
                    unique_data.append(item)
            user_discounts.discount_data = unique_data

    def get(self, request):
        user = request.user
        if user.is_superuser:
            discounts = UserDiscount.objects.all().values()
        else:
            discounts = UserDiscount.objects.filter(user=user).values()
        return self.success_response(
            "User Discount list fetched successfully", discounts
        )

    def put(self, request, pk):
        user = request.user

        # Superuser can specify user in payload
        if user.is_superuser and "user" in request.data:
            user_id = request.data["user"]
        else:
            user_id = user.id

        try:
            user_discount = UserDiscount.objects.get(pk=pk, user_id=user_id)
        except UserDiscount.DoesNotExist:
            return self.error_response("UserDiscount not found")

        # Merge discount_data
        new_discounts = request.data.get("discount_data")
        self.new_discount(user_discount, new_discounts)

        # Merge price_data
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

    def new_discount(self, user_discount, new_discounts):
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

    def delete(self, request, pk):
        user_discount = UserDiscount.objects.filter(id=pk, user=request.user).first()
        if not user_discount:
            return self.error_response("UserDiscount not found")
        user_discount.delete()
        return self.success_response("UserDiscount deleted successfully.")


class UserPriceViewSet(DefaultResponseMixin, generics.GenericAPIView):
    def get(self, request):
        user_price_data = UserDiscount.objects.select_related("user")
        price_data_list = []
        for price_data in user_price_data:
            price_data_list.append({
                "id": price_data.user.id,
                "phone_number": price_data.user.phone_number,
                "first_name": price_data.user.first_name,
                "last_name": price_data.user.last_name,
                "email": price_data.user.email,
                "addresses": price_data.user.addresses,
                "price_data":price_data.price_data
            })
        return self.success_response(
            "User Discount list fetched successfully", price_data_list
        )


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
