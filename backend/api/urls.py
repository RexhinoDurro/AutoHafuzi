from django.urls import path
from .views import (
    get_cars, get_car, add_car, update_car, delete_car,
    admin_login, get_makes, get_models, get_variants,
    add_car_images, delete_car_image, about_page, add_option, get_options, delete_option,
    get_categories, get_exterior_colors, add_exterior_color, update_exterior_color, delete_exterior_color,
    get_interior_colors, add_interior_color, update_interior_color, delete_interior_color
)

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
    path('about/', about_page, name='about_page'),
    path('options/', add_option, name='add_option'), 
    path('options/list/', get_options, name='get_options'),
    path('options/<int:option_id>/', delete_option, name='delete_option'),
    path('option-categories/', get_categories, name='get_categories'),
    
    # Color management endpoints
    path('exterior-colors/', get_exterior_colors, name='get_exterior_colors'),
    path('exterior-colors/add/', add_exterior_color, name='add_exterior_color'),
    path('exterior-colors/<int:color_id>/', update_exterior_color, name='update_exterior_color'),
    path('exterior-colors/delete/<int:color_id>/', delete_exterior_color, name='delete_exterior_color'),
    path('interior-colors/', get_interior_colors, name='get_interior_colors'),
    path('interior-colors/add/', add_interior_color, name='add_interior_color'),
    path('interior-colors/<int:color_id>/', update_interior_color, name='update_interior_color'),
    path('interior-colors/delete/<int:color_id>/', delete_interior_color, name='delete_interior_color'),
]