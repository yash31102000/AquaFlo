import requests
import json
from AquaFlo.Utils.default_response_mixin import DefaultResponseMixin
from AquaFlo.Utils.permissions import IsAdminOrReadOnly
from .serializers import *
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings


# Create your views here.
class RegisterAPI(DefaultResponseMixin, generics.GenericAPIView):
    """
    User Register
    """

    serializer_class = RegisterSerializer
    permission_classes = [IsAdminOrReadOnly]

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

            # Sending the email
            send_mail(subject, message, from_email, [self.request.data.get("email")])
            return self.success_response("Registered successfully", serializer.data)

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

            response_data = {
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
    permission_classes = [IsAuthenticated]

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

class FetchGSTDetailsView(DefaultResponseMixin, generics.GenericAPIView):
    def fetch_gst_details(self, gst_number):
        # API_URL = f"https://api.example.com/gst/{gst_number}"
        # API_KEY = "ca391fa0c7430696dc45c9ea9ef065c4"
        # API_URL = f"http://sheet.gstincheck.co.in/check/{API_KEY}/{gst_number}"
        # API_URL = f"https://cleartax.in/f/compliance-report/24AAOFM4186F1Z3/"
        API_URL = (
            f"https://cleartax.in/f/compliance-report/{gst_number}/?captcha_token=xdgd"
        )
        headers = {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7,gu;q=0.6",
            "priority": "u=1, i",
            "referer": "https://cleartax.in/gst-number-search/",
            "sec-ch-ua": '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sentry-trace": "afa5cbf9363d4417ae4c4936c3573a7f-99b41ee2c2312368-0",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
            "Cookie": "_ga_4TX14F3R0D=GS1.1.1744867881.1.0.1744867881.60.0.0; _ga=GA1.1.1084580926.1744867881; _ga_C37VX8T52R=GS1.1.1744867881.1.0.1744867885.0.0.0; _gcl_au=1.1.1363496202.1744867887; _uetsid=38ce99c01b4d11f0bd83edccc8d5e54d; _uetvid=38cedd101b4d11f09003d546d16efb34; _clck=1bcde61%7C2%7Cfv5%7C0%7C1933; aI=2847297b-f597-44cc-a9ff-28857838b1de; _clsk=w841wp%7C1744868293629%7C2%7C0%7Cj.clarity.ms%2Fcollect; aI=2847297b-f597-44cc-a9ff-28857838b1de",
        }

        # headers = {"Authorization": f"Bearer {API_KEY}"}
        response = requests.get(API_URL, headers=headers)
        if response.status_code == 200:
            return json.loads(response.text)
        return None

    def get(self, request, gst_number):
        """Fetch GST details from an external API and return JSON response"""
        try:
            gst_data = self.fetch_gst_details(gst_number)
            response_data = {
                "gst_number": gst_data.get("taxpayerInfo").get("gstin"),
                "party_name": gst_data.get("taxpayerInfo").get("lgnm"),
                "street": gst_data.get("taxpayerInfo").get("pradr").get("addr").get("bno")
                + ","
                + gst_data.get("taxpayerInfo").get("pradr").get("addr").get("bnm")
                + ","
                + gst_data.get("taxpayerInfo").get("pradr").get("addr").get("st")
                + ","
                + gst_data.get("taxpayerInfo").get("pradr").get("addr").get("loc"),
                "city": gst_data.get("taxpayerInfo").get("pradr").get("addr").get("dst"),
                "state": gst_data.get("taxpayerInfo").get("pradr").get("addr").get("stcd"),
                "zip_code": gst_data.get("taxpayerInfo")
                .get("pradr")
                .get("addr")
                .get("pncd"),
                "pan_card": gst_number[2:12],
            }
            return self.success_response("GST Data Fetch Successfully", response_data)
        except:
            return self.error_response("Invalid GST number or data not found")
    # def get(self, request, gst_number):
    #     """Fetch GST details from an external API and return JSON response"""
    #     url = f"https://www.knowyourgst.com/developers/gstincall/?gstin={gst_number}"
    #     headers = {"passthrough": "MzIxNDU2OTg3MDMyNzY2MzQ2ODA"}
    #     response = requests.get(url, headers=headers)
    #     raw_data = response.json()
    #     if raw_data.get("status_code") == 1:
    #         address = raw_data["adress"]
    #         street_parts = [
    #             address.get("floor", ""),
    #             address.get("bno", ""),
    #             address.get("bname", ""),
    #             address.get("street", ""),
    #             address.get("location", ""),
    #         ]
    #         street = ",".join(part for part in street_parts if part)
    #         formatted_response = {
    #             "gst_number": raw_data.get("gstin"),
    #             "party_name": raw_data.get("legal-name"),
    #             "street": street,
    #             "city": address.get("city"),
    #             "state": address.get("state"),
    #             "zip_code": address.get("pincode"),
    #             "pan_card": raw_data.get("pan"),
    #         }
    #         return self.success_response(
    #             "GST Data Fetch Successfully", formatted_response
    #         )
    #     else:

    #         return self.error_response("Failed to fetch GST data")
