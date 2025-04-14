from django.urls import path
from .views import *

urlpatterns = [
    path("stock-transaction/", StockTransactionView.as_view()),
    path("stock-update/<int:pk>", StockTransactionView.as_view()),
]
