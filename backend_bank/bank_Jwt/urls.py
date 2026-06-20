from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login, name='login'),
    path('auth/logout/', views.logout, name='logout'),
    path('user/profile/', views.get_profile, name='profile'),
    path('user/deposit/', views.deposit, name='deposit'),
    path('user/transactions/', views.get_transactions, name='transactions'),
]