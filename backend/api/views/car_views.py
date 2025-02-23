from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from django.core.exceptions import ValidationError
from ..models import Car
from ..serializers import CarSerializer
import json

class CarPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100

@api_view(["GET"])
def get_cars(request):
    try:
        queryset = Car.objects.all()
        
        # Search functionality
        search_query = request.GET.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(make__name__icontains=search_query) |
                Q(model__name__icontains=search_query) |
                Q(description__icontains=search_query)
            )

        # Filtering
        filters = {
            'make_id': request.GET.get('make'),
            'model_id': request.GET.get('model'),
            'year': request.GET.get('year'),
            'price__lte': request.GET.get('max_price'),
            'price__gte': request.GET.get('min_price'),
            'body_type': request.GET.get('bodyType'),
            'fuel_type': request.GET.get('fuelType'),
            'color': request.GET.get('color'),
            'gearbox': request.GET.get('gearbox'),
            'mileage__lte': request.GET.get('max_mileage')
        }
        
        filters = {k: v for k, v in filters.items() if v is not None}
        queryset = queryset.filter(**filters)

        # Sorting
        sort_by = request.GET.get('sort')
        if sort_by:
            sort_options = {
                'price_asc': 'price',
                'price_desc': '-price',
                'year_asc': 'year',
                'year_desc': '-year',
                'mileage_asc': 'mileage',
                'mileage_desc': '-mileage',
                'created_desc': '-created_at'
            }
            if sort_by in sort_options:
                queryset = queryset.order_by(sort_options[sort_by])

        # Pagination
        paginator = CarPagination()
        paginated_queryset = paginator.paginate_queryset(queryset, request)
        
        serializer = CarSerializer(paginated_queryset, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    except ValidationError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response(
            {'error': 'An unexpected error occurred', 'detail': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(["GET"])
def get_car(request, car_id):
    try:
        car = Car.objects.get(id=car_id)
        serializer = CarSerializer(car)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Car.DoesNotExist:
        return Response({"error": "Car not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_car(request):
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    data = request.data.copy()
    
    for key in ['is_used', 'full_service_history', 'customs_paid']:
        if key in data and isinstance(data[key], str):
            data[key] = data[key].lower() == 'true'
    
    if 'options' in data and isinstance(data['options'], str):
        try:
            data['options'] = json.loads(data['options'])
        except json.JSONDecodeError:
            return Response({'error': 'Invalid options format'}, status=status.HTTP_400_BAD_REQUEST)
    
    image = request.FILES.get('image')
    if image:
        data['image'] = image
    
    serializer = CarSerializer(data=data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_car(request, car_id):
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        car = Car.objects.get(id=car_id)
        serializer = CarSerializer(car, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Car.DoesNotExist:
        return Response({'error': 'Car not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_car(request, car_id):
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        car = Car.objects.get(id=car_id)
        car.delete()
        return Response({'message': 'Car deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    except Car.DoesNotExist:
        return Response({'error': 'Car not found'}, status=status.HTTP_404_NOT_FOUND)
