from django.urls import path
from .views import register, login, me, logout

app_name = 'accounts'

urlpatterns = [
    path('register', register, name='register'),
    path('login', login, name='login'),
    path('me', me, name='me'),
    path('logout', logout, name='logout'),
]
