from django.urls import path
from .views import *

urlpatterns = [
    path("invoice/", InvoiceViewSet.as_view()),
    path("invoice/<int:pk>/", InvoiceViewSet.as_view()),
    path("user-invoice/<str:pk>/", InvoiceViewSet.as_view()),
    path("order-invoice/<int:order_id>/", InvoiceViewSet.as_view()),
]
