from django.urls import path
from .views import *

urlpatterns = [
    path("pipes/", PipeViewSet.as_view()),
    path("pipes/<int:pk>/", PipeViewSet.as_view()),
    path('pipes/', PipeViewSet.as_view()),
    path('get-product-list/<int:pk>/', GetPipeViewset.as_view()),
]
