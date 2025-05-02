from django.urls import path
from .views import *

urlpatterns = [
    path("order/", OrderViewSet.as_view()),
    path("order/<int:pk>/", OrderViewSet.as_view()),
    path("order/<str:user_id>/", UserOrderViewSet.as_view()),
    path("order-split/", OrderSplitViewSet.as_view()),
]
