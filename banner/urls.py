from django.urls import path
from .views import *

urlpatterns = [
          path("add-banner/",BannerViewSet.as_view()),
          path("list-banner/",BannerViewSet.as_view()),
          path("delete-banner/",BannerViewSet.as_view()),
]
