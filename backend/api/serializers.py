from rest_framework import serializers
from .models import Car, CarMake, CarModel, CarImage

class CarMakeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarMake
        fields = ['id', 'name']

class CarModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarModel
        fields = ['id', 'name', 'make']


    
class CarImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarImage
        fields = ['id', 'image', 'is_primary', 'order']


class CarSerializer(serializers.ModelSerializer):
    brand = serializers.CharField(source='make.name', read_only=True)
    model_name = serializers.CharField(source='model.name', read_only=True)
    make = serializers.PrimaryKeyRelatedField(queryset=CarMake.objects.all(), write_only=True)
    model = serializers.PrimaryKeyRelatedField(queryset=CarModel.objects.all(), write_only=True)
    created_at = serializers.DateTimeField(format="%Y-%m-%d", read_only=True)
    images = CarImageSerializer(many=True, read_only=True)


    class Meta:
        model = Car
        fields = [
            'id', 'brand', 'model_name', 'make', 'model', 'year', 'color', 'price', 
            'description', 'image', 'created_at', 'images',
            'body_type', 'is_used', 'drivetrain', 'seats', 'doors', 'mileage', 
            'first_registration', 'general_inspection_date', 'full_service_history', 
            'customs_paid', 'power', 'gearbox', 'engine_size', 'gears', 'cylinders', 
            'weight', 'emission_class', 'fuel_type', 'options'
        ]

    def validate(self, data):
        """
        Check that the model belongs to the selected make
        """
        if data.get('model') and data.get('make'):
            if data['model'].make != data['make']:
                raise serializers.ValidationError(
                    {"model": "This model does not belong to the selected make."}
                )
        return data
