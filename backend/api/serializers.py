# serializers.py
from rest_framework import serializers
from .models import Car, CarMake, CarModel, CarImage, CarVariant

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

class CarImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    
    def get_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    class Meta:
        model = CarImage
        fields = ['id', 'image', 'is_primary', 'order', 'url']

class CarSerializer(serializers.ModelSerializer):
    brand = serializers.CharField(source='make.name', read_only=True)
    model_name = serializers.CharField(source='model.name', read_only=True)
    variant_name = serializers.SerializerMethodField()
    make = serializers.PrimaryKeyRelatedField(queryset=CarMake.objects.all(), write_only=True)
    model = serializers.PrimaryKeyRelatedField(queryset=CarModel.objects.all(), write_only=True)
    created_at = serializers.DateTimeField(format="%Y-%m-%d", read_only=True)
    images = CarImageSerializer(many=True, read_only=True)
    
    def get_variant_name(self, obj):
        if obj.variant:
            return obj.variant.name
        return None
    
    def get_image(self, obj):
        """Return the primary image URL for backward compatibility"""
        primary = obj.primary_image
        if primary and primary.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary.image.url)
            return primary.image.url
        return None

    class Meta:
        model = Car
        fields = [
        'id', 'brand', 'model_name', 'variant_name', 'make', 'model', 'variant', 'year', 'color', 'price', 
        'description', 'created_at', 'images',
        'body_type', 'is_used', 'drivetrain', 'seats', 'doors', 'mileage', 
        'first_registration', 'general_inspection_date', 'full_service_history', 
        'customs_paid', 'power', 'gearbox', 'engine_size', 'gears', 'cylinders', 
        'weight', 'emission_class', 'fuel_type', 'options'
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