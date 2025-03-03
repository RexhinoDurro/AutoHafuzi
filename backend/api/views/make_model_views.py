# make_model_views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
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

@api_view(['GET'])
def get_variants(request, model_id):
    try:
        model = CarModel.objects.get(id=model_id)
        variants = CarVariant.objects.filter(model=model)
        serializer = CarVariantSerializer(variants, many=True)
        return Response(serializer.data)
    except CarModel.DoesNotExist:
        return Response({"error": "Model not found"}, status=404)
