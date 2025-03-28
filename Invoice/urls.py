from django.urls import path
from .views import *

urlpatterns = [
    path("invoice/", InvoiceViewSet.as_view()),
]
