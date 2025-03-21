# make_model_views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from ..models import CarMake, CarModel, CarVariant, Option, Car
from ..serializers import CarMakeSerializer, CarModelSerializer, CarVariantSerializer, OptionSerializer

@api_view(['GET'])
def get_makes(request):
    # Check if we're in admin form context
    is_admin = request.query_params.get('admin', 'false').lower() == 'true'
    
    if is_admin:
        # Return all makes for admin forms
        makes = CarMake.objects.all().order_by('name')
    else:
        # Return only makes with cars for public frontend display
        makes = CarMake.objects.annotate(
            car_count=Count('models__car')
        ).filter(car_count__gt=0).order_by('name')
        
    serializer = CarMakeSerializer(makes, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_make(request):
    """Add a new car make"""
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
    serializer = CarMakeSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_make(request, make_id):
    """Update an existing car make"""
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
    try:
        make = CarMake.objects.get(id=make_id)
    except CarMake.DoesNotExist:
        return Response({'error': 'Make not found'}, status=status.HTTP_404_NOT_FOUND)
        
    serializer = CarMakeSerializer(make, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_make(request, make_id):
    """Delete a car make and all its associated models and variants"""
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
    try:
        make = CarMake.objects.get(id=make_id)
        make.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except CarMake.DoesNotExist:
        return Response({'error': 'Make not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_models(request, make_id):
    # Check if we're in admin form context
    is_admin = request.query_params.get('admin', 'false').lower() == 'true'
    
    if is_admin:
        # Return all models for the selected make when in admin context
        models = CarModel.objects.filter(make_id=make_id).order_by('name')
    else:
        # Return only models with cars for public frontend display
        models = CarModel.objects.filter(make_id=make_id).annotate(
            car_count=Count('car')
        ).filter(car_count__gt=0).order_by('name')
        
    serializer = CarModelSerializer(models, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_model(request):
    """Add a new car model"""
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
    serializer = CarModelSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_model(request, model_id):
    """Update an existing car model"""
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
    try:
        model = CarModel.objects.get(id=model_id)
    except CarModel.DoesNotExist:
        return Response({'error': 'Model not found'}, status=status.HTTP_404_NOT_FOUND)
        
    serializer = CarModelSerializer(model, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_model(request, model_id):
    """Delete a car model and all its associated variants"""
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
    try:
        model = CarModel.objects.get(id=model_id)
        model.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except CarModel.DoesNotExist:
        return Response({'error': 'Model not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_variants(request, model_id):
    try:
        model = CarModel.objects.get(id=model_id)
        # Check if we're in admin form context
        is_admin = request.query_params.get('admin', 'false').lower() == 'true'
        
        if is_admin:
            # Return all variants for the selected model when in admin context
            variants = CarVariant.objects.filter(model=model).order_by('name')
        else:
            # Return only variants with cars for public frontend display
            variants = CarVariant.objects.filter(model=model).annotate(
                car_count=Count('car')
            ).filter(car_count__gt=0).order_by('name')
            
        serializer = CarVariantSerializer(variants, many=True)
        return Response(serializer.data)
    except CarModel.DoesNotExist:
        return Response({"error": "Model not found"}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_variant(request):
    """Add a new car variant"""
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
    serializer = CarVariantSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_variant(request, variant_id):
    """Update an existing car variant"""
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
    try:
        variant = CarVariant.objects.get(id=variant_id)
    except CarVariant.DoesNotExist:
        return Response({'error': 'Variant not found'}, status=status.HTTP_404_NOT_FOUND)
        
    serializer = CarVariantSerializer(variant, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_variant(request, variant_id):
    """Delete a car variant"""
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        
    try:
        variant = CarVariant.objects.get(id=variant_id)
        variant.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except CarVariant.DoesNotExist:
        return Response({'error': 'Variant not found'}, status=status.HTTP_404_NOT_FOUND)

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