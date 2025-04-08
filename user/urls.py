from django.urls import path
from .views import *

urlpatterns = [
    path("register/", RegisterAPI.as_view()),
    path("login/", LoginAPI.as_view()),
    path("add-remove-address/", AddorRemoveAddressAPI.as_view()),
    path("user/", RegisterAPI.as_view()),
    path("user/<str:user_id>/", RegisterAPI.as_view()),
]
