# make_model_views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from ..models import CarMake, CarModel, CarVariant, Option
from ..serializers import CarMakeSerializer, CarModelSerializer, CarVariantSerializer, OptionSerializer

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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_option(request):
    """Create a new option"""
    serializer = OptionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_options(request):
    """Get all available options"""
    category = request.query_params.get('category', None)
    
    if category:
        options = Option.objects.filter(category=category)
    else:
        options = Option.objects.all()
        
    serializer = OptionSerializer(options, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_option(request, option_id):
    """Delete an option by ID"""
    try:
        option = Option.objects.get(id=option_id)
        option.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Option.DoesNotExist:
        return Response({"error": "Option not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_categories(request):
    """Get all option categories"""
    categories = [
        {'value': 'COMFORT', 'label': 'Comfort & Convenience'},
        {'value': 'ENTERTAINMENT', 'label': 'Entertainment & Media'},
        {'value': 'SAFETY', 'label': 'Safety & Security'},
        {'value': 'EXTRAS', 'label': 'Extras'},
    ]
    return Response(categories)