from django.urls import path
from .views import RegisterAPI, LoginAPI, AddorRemoveAddressAPI, UserDiscountViewSet, UserPriceViewSet, ChangePasswordView

urlpatterns = [
    path("register/", RegisterAPI.as_view()),
    path("login/", LoginAPI.as_view()),
    path("add-remove-address/", AddorRemoveAddressAPI.as_view()),
    path("user/", RegisterAPI.as_view()),
    path("user/<str:user_id>/", RegisterAPI.as_view()),
    path("user-discount/", UserDiscountViewSet.as_view()),
    path("user-discount/<int:pk>/", UserDiscountViewSet.as_view()),
    path("user-price/", UserPriceViewSet.as_view()),
    path("change-password/", ChangePasswordView.as_view()),
]
