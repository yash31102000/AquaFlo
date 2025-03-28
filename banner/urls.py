from django.urls import path
from .views import *

urlpatterns = [
    path("banner/", BannerViewSet.as_view()),
]
