from django.urls import path
from .views import register, login, logout, profile, profiles_list

app_name = 'accounts'

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('profiles/', profiles_list, name='profiles_list'),
    path('profile/', profile, name='profile'),
]
