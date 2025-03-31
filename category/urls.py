from django.urls import path
from .views import *

urlpatterns = [
    path('pipes/', PipeViewSet.as_view(), name='pipe-list'),
    path('pipes/<int:pk>/', PipeViewSet.as_view(), name='pipe-detail'),
]
