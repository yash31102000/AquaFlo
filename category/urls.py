from django.urls import path
from .views import *

urlpatterns = [
          path("add-category/",CategoryViewSet.as_view()),
          path("get-category-list/",CategoryViewSet.as_view()),
          path("add-items/",ItemViewSet.as_view()),
          path("items-list/",ItemViewSet.as_view()),
          path("delete-category/<int:pk>",CategoryViewSet.as_view()),
          path("delete-items/<int:pk>",ItemViewSet.as_view()),
          path("add-subitems/",SubItemViewSet.as_view()),
          path("subitems-list/",SubItemViewSet.as_view()),
          path("delete-subitems/<int:pk>",SubItemViewSet.as_view()),
]
