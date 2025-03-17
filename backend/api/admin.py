from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Car, CarMake, CarModel, CarVariant, 
    ExteriorColor, InteriorColor, Option, 
    CarImage, Upholstery, CarView, 
    SiteVisit, ContactMessage
)

class CarImageInline(admin.TabularInline):
    model = CarImage
    extra = 1
    fields = ('image', 'is_primary', 'order')
    readonly_fields = ('created_at',)

class CarViewInline(admin.TabularInline):
    model = CarView
    extra = 0
    readonly_fields = ('session_id', 'ip_address', 'viewed_at')
    fields = readonly_fields
    max_num = 10
    can_delete = False

class CarVariantInline(admin.TabularInline):
    model = CarVariant
    extra = 1

class CarModelInline(admin.TabularInline):
    model = CarModel
    extra = 1

@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ('car_name', 'price_display', 'first_registration_year', 'exterior_color', 'interior_color', 'view_count', 'is_used', 'created_at')
    list_filter = ('make', 'model', 'first_registration_year', 'exterior_color', 'fuel_type', 'gearbox', 'body_type', 'is_used', 'discussed_price')
    search_fields = ('make__name', 'model__name', 'variant__name', 'description')
    filter_horizontal = ('options',)
    fieldsets = (
        ('Basic Information', {
            'fields': ('make', 'model', 'variant', 'description', 'price', 'discussed_price')
        }),
        ('Registration & Specification', {
            'fields': ('first_registration_day', 'first_registration_month', 'first_registration_year', 'first_registration',
                      'mileage', 'fuel_type', 'body_type', 'gearbox', 'is_used', 'view_count')
        }),
        ('Features & Appearance', {
            'fields': ('exterior_color', 'interior_color', 'upholstery', 'seats', 'doors')
        }),
        ('Technical Specifications', {
            'fields': ('engine_size', 'power', 'drivetrain', 'gears', 'cylinders', 'weight', 'emission_class')
        }),
        ('Additional Information', {
            'fields': ('full_service_history', 'customs_paid')
        }),
    )
    inlines = [CarImageInline, CarViewInline]
    readonly_fields = ('view_count', 'created_at')
    
    def car_name(self, obj):
        if obj.variant:
            return f"{obj.make.name} {obj.model.name} {obj.variant.name}"
        return f"{obj.make.name} {obj.model.name}"
    car_name.short_description = "Car"
    
    def price_display(self, obj):
        if obj.discussed_price:
            return format_html('<span style="color: blue;">Price on request</span>')
        return f"${obj.price}"
    price_display.short_description = "Price"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('make', 'model', 'variant', 'exterior_color', 'interior_color', 'upholstery')

@admin.register(CarMake)
class CarMakeAdmin(admin.ModelAdmin):
    list_display = ('name', 'model_count')
    search_fields = ('name',)
    inlines = [CarModelInline]
    
    def model_count(self, obj):
        return obj.models.count()
    model_count.short_description = "Number of Models"

@admin.register(CarModel)
class CarModelAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'make', 'variant_count')
    list_filter = ('make',)
    search_fields = ('name', 'make__name')
    inlines = [CarVariantInline]
    
    def full_name(self, obj):
        return f"{obj.make.name} {obj.name}"
    full_name.short_description = "Model"
    
    def variant_count(self, obj):
        return obj.variants.count()
    variant_count.short_description = "Number of Variants"

@admin.register(CarVariant)
class CarVariantAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'model')
    list_filter = ('model__make',)
    search_fields = ('name', 'model__name', 'model__make__name')
    
    def full_name(self, obj):
        return f"{obj.model.make.name} {obj.model.name} {obj.name}"
    full_name.short_description = "Variant"

@admin.register(ExteriorColor)
class ExteriorColorAdmin(admin.ModelAdmin):
    list_display = ('name', 'color_sample')
    search_fields = ('name',)
    
    def color_sample(self, obj):
        return format_html('<div style="background-color: {}; width: 30px; height: 30px; border-radius: 4px;"></div>', obj.hex_code)
    color_sample.short_description = "Color"

@admin.register(InteriorColor)
class InteriorColorAdmin(admin.ModelAdmin):
    list_display = ('name', 'color_sample')
    search_fields = ('name',)
    
    def color_sample(self, obj):
        return format_html('<div style="background-color: {}; width: 30px; height: 30px; border-radius: 4px;"></div>', obj.hex_code)
    color_sample.short_description = "Color"

@admin.register(Upholstery)
class UpholsteryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ('name', 'category')
    list_filter = ('category',)
    search_fields = ('name',)

@admin.register(CarImage)
class CarImageAdmin(admin.ModelAdmin):
    list_display = ('car_name', 'image_preview', 'is_primary', 'order', 'created_at')
    list_filter = ('is_primary', 'car__make', 'car__model')
    search_fields = ('car__make__name', 'car__model__name')
    readonly_fields = ('image_preview', 'created_at')
    
    def car_name(self, obj):
        return str(obj.car)
    car_name.short_description = "Car"
    
    def image_preview(self, obj):
        return format_html('<img src="{}" width="100" />', obj.image.url)
    image_preview.short_description = "Preview"

@admin.register(CarView)
class CarViewAdmin(admin.ModelAdmin):
    list_display = ('car', 'session_id', 'ip_address', 'viewed_at')
    list_filter = ('viewed_at', 'car__make', 'car__model')
    search_fields = ('car__make__name', 'car__model__name', 'session_id', 'ip_address')
    readonly_fields = ('car', 'session_id', 'ip_address', 'viewed_at')

@admin.register(SiteVisit)
class SiteVisitAdmin(admin.ModelAdmin):
    list_display = ('path', 'session_id', 'ip_address', 'visited_at')
    list_filter = ('visited_at', 'path')
    search_fields = ('path', 'session_id', 'ip_address', 'user_agent')
    readonly_fields = ('session_id', 'ip_address', 'user_agent', 'referrer', 'path', 'visited_at')

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('subject', 'name', 'email', 'created_at', 'is_read')
    list_filter = ('is_read', 'created_at')
    search_fields = ('name', 'email', 'subject', 'message')
    readonly_fields = ('created_at',)
    actions = ['mark_as_read']
    
    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
    mark_as_read.short_description = "Mark selected messages as read"
