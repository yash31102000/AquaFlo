from django.urls import path
from .views import *

urlpatterns = [
          path("category/",CategoryViewSet.as_view()),
          path("category/<int:pk>",CategoryViewSet.as_view()),
          path("sub-category/",ItemViewSet.as_view()),
          path("sub-category/<int:pk>",CategoryViewSet.as_view()),
          path("items/",SubItemViewSet.as_view()),
          path("items/<int:pk>",CategoryViewSet.as_view()),
]
