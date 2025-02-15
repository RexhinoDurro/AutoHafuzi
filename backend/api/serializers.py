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
    model = serializers.CharField(source='model.name', read_only=True)

    class Meta:
        model = Car
        fields = ['id', 'brand', 'model', 'year', 'color', 'price', 'description', 'image']