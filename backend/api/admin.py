from django.contrib import admin
from .models import Car, CarMake, CarModel, CarVariant, ExteriorColor, InteriorColor, Option, CarImage

@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ('make', 'model', 'first_registration_year', 'exterior_color', 'interior_color', 'price')