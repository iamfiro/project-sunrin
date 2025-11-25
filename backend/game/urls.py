from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'charts', views.ChartViewSet)
router.register(r'results', views.ResultViewSet)
router.register(r'ranks', views.RankViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
