"""
URL configuration for AquaFlo project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static


APP3_PREFIX = "app3/"

urlpatterns = [
    path("admin/", admin.site.urls),
    path(APP3_PREFIX, include("user.urls")),
    path("token/refresh/", TokenRefreshView.as_view()),
    path(APP3_PREFIX, include("category.urls")),
    path(APP3_PREFIX, include("banner.urls")),
    path(APP3_PREFIX, include("order.urls")),
    path(APP3_PREFIX, include("Invoice.urls")),
    path(APP3_PREFIX, include("stocks.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
