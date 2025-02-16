from django.urls import path
from . import views

urlpatterns = [
    # Existing URLs
    path('cars/', views.get_cars, name='get_cars'),
    path('cars/<int:car_id>/', views.get_car, name='get_car'),
    path('cars/add/', views.add_car, name='add_car'),
    path('cars/update/<int:car_id>/', views.update_car, name='update_car'),
    path('cars/delete/<int:car_id>/', views.delete_car, name='delete_car'),
    path('makes/', views.get_makes, name='get_makes'),
    path('models/<int:make_id>/', views.get_models, name='get_models'),
    path('cars/<int:car_id>/images/', views.add_car_images, name='add_car_images'),
    path('cars/images/<int:image_id>/', views.delete_car_image, name='delete_car_image'),
    
    
    # New admin authentication URL
    path('admin/login/', views.admin_login, name='admin_login'),
]