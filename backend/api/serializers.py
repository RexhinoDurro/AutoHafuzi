from rest_framework import serializers
from .models import Car, CarMake, CarModel, CarImage, CarVariant, Option, ExteriorColor, InteriorColor, Upholstery, SiteVisit, ContactMessage
from django.conf import settings

class CarMakeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarMake
        fields = ['id', 'name']
        
class CarVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarVariant
        fields = ['id', 'name', 'model']

class CarModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarModel
        fields = ['id', 'name', 'make','variants']

class ExteriorColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExteriorColor
        fields = ['id', 'name', 'hex_code']

class InteriorColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = InteriorColor
        fields = ['id', 'name',  'hex_code']

class UpholsterySerializer(serializers.ModelSerializer):
    class Meta:
        model = Upholstery
        fields = ['id', 'name']
        
class CarImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    
    def get_url(self, obj):
        """Get the Cloudinary URL for the image"""
        if obj.public_id:
            # Construct URL directly from public_id
            cloud_name = settings.CLOUDINARY_STORAGE['CLOUD_NAME']
            return f"https://res.cloudinary.com/{cloud_name}/image/upload/{obj.public_id}"
        return None

    class Meta:
        model = CarImage
        fields = ['id', 'image', 'is_primary', 'order', 'url', 'public_id']
        
class OptionSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Option
        fields = ['id', 'name', 'category', 'category_display']

class CarSerializer(serializers.ModelSerializer):
    brand = serializers.CharField(source='make.name', read_only=True)
    model_name = serializers.CharField(source='model.name', read_only=True)
    variant_name = serializers.SerializerMethodField()
    make = serializers.PrimaryKeyRelatedField(queryset=CarMake.objects.all())
    discussed_price = serializers.BooleanField(required=False, default=False)
    model = serializers.PrimaryKeyRelatedField(queryset=CarModel.objects.all())
    variant = serializers.PrimaryKeyRelatedField(queryset=CarVariant.objects.all(), required=False, allow_null=True)
    view_count = serializers.IntegerField(read_only=True)
    slug = serializers.SlugField(read_only=True)  # Include slug in serializer
    url = serializers.SerializerMethodField()  # Add URL method field
    
    # Add explicit fields for first registration values
    first_registration_day = serializers.IntegerField(required=False, allow_null=True)
    first_registration_month = serializers.IntegerField(required=False, allow_null=True)
    first_registration_year = serializers.IntegerField(required=False, allow_null=True)
    
    # Add exterior and interior color serialization
    exterior_color = serializers.PrimaryKeyRelatedField(
        queryset=ExteriorColor.objects.all(), 
        required=False, 
        allow_null=True
    )
    exterior_color_name = serializers.CharField(source='exterior_color.name', read_only=True)
    exterior_color_hex = serializers.CharField(source='exterior_color.hex_code', read_only=True)
    
    upholstery = serializers.PrimaryKeyRelatedField(
        queryset=Upholstery.objects.all(), 
        required=False, 
        allow_null=True
    )
    upholstery_name = serializers.CharField(source='upholstery.name', read_only=True)
    
    interior_color = serializers.PrimaryKeyRelatedField(
        queryset=InteriorColor.objects.all(), 
        required=False, 
        allow_null=True
    )
    interior_color_name = serializers.CharField(source='interior_color.name', read_only=True)
    interior_color_hex = serializers.CharField(source='interior_color.hex_code', read_only=True)
    
    created_at = serializers.DateTimeField(format="%Y-%m-%d", read_only=True)
    images = CarImageSerializer(many=True, read_only=True)
    options = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Option.objects.all(),
        required=False
    )
    
    def get_variant_name(self, obj):
        if obj.variant:
            return obj.variant.name
        return None
    
    def get_url(self, obj):
        """Return the URL for this car using the slug"""
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.get_absolute_url())
        return obj.get_absolute_url()
    
    def get_image(self, obj):
        """Return the primary image URL for backward compatibility"""
        primary = obj.primary_image
        if primary and primary.image:
            return primary.image.url
        return None

    class Meta:
        model = Car
        fields = [
            'id', 'brand', 'model_name', 'variant_name', 'make', 'model', 'variant',
            'first_registration_day', 'first_registration_month', 'first_registration_year',
            'exterior_color', 'exterior_color_name', 'exterior_color_hex',
            'interior_color', 'interior_color_name', 'upholstery', 'upholstery_name', 'interior_color_hex',
            'price', 'discussed_price', 'description', 'created_at', 'images',
            'body_type', 'is_used', 'drivetrain', 'seats', 'doors', 'mileage', 
            'first_registration', 'full_service_history', 
            'customs_paid', 'power', 'gearbox', 'engine_size', 'gears', 'cylinders', 
            'weight', 'emission_class', 'fuel_type', 'options', 'view_count',
            'slug', 'url'  # Added slug and url fields to the output
        ]

    def validate(self, data):
        """Check that the model belongs to the selected make and variant belongs to the model"""
        if data.get('model') and data.get('make'):
            if data['model'].make != data['make']:
                raise serializers.ValidationError(
                    {"model": "This model does not belong to the selected make."}
                )
                
        if data.get('variant') and data.get('model'):
            if data['variant'].model != data['model']:
                raise serializers.ValidationError(
                    {"variant": "This variant does not belong to the selected model."}
                )
        
        return data

class SiteVisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteVisit
        fields = ['id', 'session_id', 'path', 'visited_at', 'ip_address', 'user_agent', 'referrer']
        
class ContactMessageSerializer(serializers.ModelSerializer):
    """
    Serializer for Contact Message model
    """
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'phone', 'subject', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'is_read', 'created_at']