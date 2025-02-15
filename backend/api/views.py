from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .models import Car, CarMake, CarModel
from .serializers import CarSerializer, CarMakeSerializer, CarModelSerializer
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated

@api_view(['POST'])
def admin_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    
    if user and user.is_staff:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key
        })
    return Response({
        'error': 'Invalid credentials'
    }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_car(request):
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    data = request.data.copy()
    image = request.FILES.get('image')
    if image:
        data['image'] = image
    
    serializer = CarSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
def get_cars(request):
    queryset = Car.objects.all()
    
    # Filter by make
    make_id = request.GET.get('make')
    if make_id:
        queryset = queryset.filter(make_id=make_id)
    
    # Filter by model
    model_id = request.GET.get('model')
    if model_id:
        queryset = queryset.filter(model_id=model_id)
    
    # Filter by year
    year = request.GET.get('year')
    if year:
        queryset = queryset.filter(year=year)
    
    # Filter by max price
    max_price = request.GET.get('max_price')
    if max_price:
        queryset = queryset.filter(price__lte=max_price)
    
    serializer = CarSerializer(queryset, many=True)
    return Response(serializer.data)

@api_view(["GET"])
def get_car(request, car_id):
    try:
        car = Car.objects.get(id=car_id)
        serializer = CarSerializer(car)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Car.DoesNotExist:
        return Response({"error": "Car not found"}, status=status.HTTP_404_NOT_FOUND)

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