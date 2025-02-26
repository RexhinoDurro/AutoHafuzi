# make_model_views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from ..models import CarMake, CarModel, CarVariant
from ..serializers import CarMakeSerializer, CarModelSerializer, CarVariantSerializer

@api_view(['GET'])
def get_makes(request):
    makes = CarMake.objects.all()
    serializer = CarMakeSerializer(makes, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_models(request, make_id):
    models = CarModel.objects.filter(make_id=make_id)
    serializer = CarModelSerializer(models, many=True)
    return Response(serializer.data)

class VariantListView(APIView):
    def get(self, request, model_id):
        try:
            model = CarModel.objects.get(id=model_id)
            variants = CarVariant.objects.filter(model=model)
            serializer = CarVariantSerializer(variants, many=True)
            return Response(serializer.data)
        except CarModel.DoesNotExist:
            return Response({"error": "Model not found"}, status=404)
        
# views.py
from .auth_views import admin_login
from .car_views import (
    get_cars, get_car, add_car, update_car, delete_car
)
from .image_views import add_car_images, delete_car_image
from .make_model_views import get_makes, get_models

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
    'get_models',
]