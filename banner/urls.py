from django.urls import path
from .views import BannerViewSet

urlpatterns = [
    path("banner/", BannerViewSet.as_view()),
    path("banner/<int:pk>/", BannerViewSet.as_view()),
]
