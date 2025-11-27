from django.urls import path
from . import views

urlpatterns = [
    path('', views.ChartViewSet.as_view({'get': 'list'}), name='chart-list'),
    path('<str:musicId>/', views.ChartViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy',
        'post': 'create'
    }), name='chart-detail'),
]
