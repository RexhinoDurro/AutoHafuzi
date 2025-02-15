from rest_framework import serializers
from .models import Car, CarMake, CarModel

class CarMakeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarMake
        fields = ['id', 'name']


class CarModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarModel
        fields = ['id', 'name', 'make']

class CarSerializer(serializers.ModelSerializer):
    brand = serializers.CharField(source='make.name', read_only=True)
    model_name = serializers.CharField(source='model.name', read_only=True)
    make = serializers.PrimaryKeyRelatedField(queryset=CarMake.objects.all(), write_only=True)
    model = serializers.PrimaryKeyRelatedField(queryset=CarModel.objects.all(), write_only=True)

    class Meta:
        model = Car
        fields = ['id', 'brand', 'model_name', 'make', 'model', 'year', 'color', 'price', 'description', 'image']

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