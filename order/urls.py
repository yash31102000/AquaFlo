from django.urls import path
from .views import OrderViewSet, OrderSplitViewSet

urlpatterns = [
    path("order/", OrderViewSet.as_view()),
    path("order/<int:pk>/", OrderViewSet.as_view()),
    path("order-split/", OrderSplitViewSet.as_view()),
]
