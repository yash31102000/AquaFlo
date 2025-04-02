from django.urls import path
from .views import *

urlpatterns = [
    path("order/", OrderViewSet.as_view()),
    path("order/<int:pk>/",OrderViewSet.as_view()),
]
