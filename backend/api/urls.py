from django.contrib import admin  # Add this import
from django.urls import path
from .views import (
    get_cars, get_car, add_car, update_car, delete_car,
    admin_login, get_makes, get_models, get_variants,
    add_car_images, delete_car_image
)
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    path('cars/', get_cars, name='get_cars'),
    path('cars/<int:car_id>/', get_car, name='get_car'),
    path('cars/add/', add_car, name='add_car'),
    path('cars/update/<int:car_id>/', update_car, name='update_car'),
    path('cars/delete/<int:car_id>/', delete_car, name='delete_car'),
    path('makes/', get_makes, name='get_makes'),
    path('models/<int:make_id>/', get_models, name='get_models'),
    path('variants/<int:model_id>/', get_variants, name='get_variants'),
    path('cars/<int:car_id>/images/', add_car_images, name='add_car_images'),
    path('cars/images/<int:image_id>/', delete_car_image, name='delete_car_image'),
    path('auth/login/', admin_login, name='admin_login'),
]
