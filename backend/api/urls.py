# api/urls.py
from django.urls import path
from .views import (
    get_cars, get_car, add_car, update_car, delete_car,
    admin_login, get_makes, add_make, update_make, delete_make,
    get_models, add_model, update_model, delete_model,
    get_variants, add_variant, update_variant, delete_variant,
    add_option, get_options, delete_option,
    get_categories, get_exterior_colors, add_exterior_color, update_exterior_color, delete_exterior_color, get_upholstery_types, add_upholstery, update_upholstery, delete_upholstery,
    get_interior_colors, add_interior_color, update_interior_color, delete_interior_color,
    get_site_analytics, contact_page, submit_contact_form, get_contact_messages, mark_message_as_read, delete_message, placeholder_image,
    about_page
)
from .views import cloudinary_views

urlpatterns = [
    # Car endpoints
    path('cars/', get_cars, name='get_cars'),
    path('cars/<str:car_slug>/', get_car, name='get_car'),
    path('cars/add/', add_car, name='add_car'),
    path('cars/update/<str:car_slug>/', update_car, name='update_car'),
    path('cars/delete/<str:car_slug>/', delete_car, name='delete_car'),
    
    # Cloudinary image handling endpoints - ALL USING SLUGS
    path('cars/<str:car_slug>/images/', cloudinary_views.add_car_images, name='add_car_images'),
    path('cars/images/<int:image_id>/', cloudinary_views.delete_car_image, name='delete_car_image'),
    path('cars/<str:car_slug>/images/<int:image_id>/primary/', cloudinary_views.set_primary_image, name='set_primary_image'),
    path('cars/<str:car_slug>/images/reorder/', cloudinary_views.reorder_car_images, name='reorder_car_images'),
    path('cars/<str:car_slug>/images/list/', cloudinary_views.get_car_images, name='get_car_images'),
    
    # Placeholder image
    path('placeholder/<int:width>/<int:height>/', placeholder_image, name='placeholder_image'),
    
    # Authentication
    path('auth/', admin_login, name='admin_login'),
    
    # Make endpoints
    path('makes/', get_makes, name='get_makes'),
    path('makes/add/', add_make, name='add_make'),
    path('makes/<int:make_id>/', update_make, name='update_make'),
    path('makes/delete/<int:make_id>/', delete_make, name='delete_make'),
    
    # Model endpoints
    path('models/by-make/<int:make_id>/', get_models, name='get_models_by_make'),
    path('models/add/', add_model, name='add_model'),
    path('models/update/<int:model_id>/', update_model, name='update_model'),
    path('models/delete/<int:model_id>/', delete_model, name='delete_model'),
    
    # Variant endpoints
    path('variants/by-model/<int:model_id>/', get_variants, name='get_variants_by_model'),
    path('variants/add/', add_variant, name='add_variant'),
    path('variants/update/<int:variant_id>/', update_variant, name='update_variant'),
    path('variants/delete/<int:variant_id>/', delete_variant, name='delete_variant'),
    
    # About page
    path('about/', about_page, name='about_page'),
    
    # Options and categories
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
    path('upholstery/', get_upholstery_types, name='get_upholstery_types'),
    path('upholstery/add/', add_upholstery, name='add_upholstery'),
    path('upholstery/<int:upholstery_id>/', update_upholstery, name='update_upholstery'),
    path('upholstery/delete/<int:upholstery_id>/', delete_upholstery, name='delete_upholstery'),
    
    # Contact and analytics
    path('contact/', contact_page, name='contact_page'),
    path('contact/submit/', submit_contact_form, name='submit_contact_form'),
    path('contact/messages/', get_contact_messages, name='get_contact_messages'),
    path('contact/messages/<int:message_id>/read/', mark_message_as_read, name='mark_message_as_read'),
    path('contact/messages/<int:message_id>/delete/', delete_message, name='delete_message'),
    path('analytics/', get_site_analytics, name='get_site_analytics'),
]