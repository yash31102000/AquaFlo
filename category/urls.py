from django.urls import path
from .views import *

urlpatterns = [
    path("pipes/", PipeViewSet.as_view()),
    path("pipes/<int:pk>/", PipeViewSet.as_view()),
    path("get-product-list/<int:pk>/", GetPipeViewset.as_view()),
    path("bestseller/", BestSellerViewset.as_view()),
    path("bestseller/<int:pk>/", BestSellerViewset.as_view()),
    path("main-category/", GetMainCategoryViewset.as_view()),
    path('markasfavorite/', MarkedAsfavoriteViewset.as_view()),
]
