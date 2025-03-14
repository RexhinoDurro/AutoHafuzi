from .auth_views import admin_login
from .car_views import (
    get_cars, get_car, add_car, update_car, delete_car, about_page, get_site_analytics
)
from .image_views import add_car_images, delete_car_image
from .make_model_views import (
    get_makes, get_models, get_variants, 
    add_make, update_make, delete_make,
    add_model, update_model, delete_model,
    add_variant, update_variant, delete_variant,
    add_option, get_options, delete_option, get_categories
)
from .color_views import (
    get_exterior_colors, add_exterior_color, update_exterior_color, delete_exterior_color, 
    get_interior_colors, add_interior_color, update_interior_color, delete_interior_color
)
from .contact_views import contact_page, submit_contact_form, get_contact_messages, mark_message_as_read, delete_message

__all__ = [
    'admin_login',
    'get_cars',
    'get_car',
    'add_car',
    'update_car',
    'delete_car',
    'add_car_images',
    'delete_car_image',
    'get_makes',
    'add_make',
    'update_make',
    'delete_make',
    'get_models',
    'add_model',
    'update_model',
    'delete_model',
    'get_variants',
    'add_variant',
    'update_variant',
    'delete_variant',
    'about_page',
    'add_option',
    'get_options',
    'delete_option',
    'get_categories',
    'get_exterior_colors',
    'add_exterior_color',
    'update_exterior_color',
    'delete_exterior_color',
    'get_interior_colors',
    'add_interior_color',
    'update_interior_color',
    'delete_interior_color',
    'get_site_analytics',
    'contact_page',
    'submit_contact_form', 
    'get_contact_messages',
    'mark_message_as_read',
    'delete_message'
]