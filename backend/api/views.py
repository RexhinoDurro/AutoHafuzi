from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .models import Car, CarMake, CarModel, CarImage
from .serializers import CarSerializer, CarMakeSerializer, CarModelSerializer
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated

# ------------------ ADMIN LOGIN ------------------
@api_view(['POST'])
def admin_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    
    if user and user.is_staff:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# ------------------ ADD CAR ------------------

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

# ------------------ GET CARS ------------------
@api_view(["GET"])
def get_cars(request):
    print("Received filter params:", request.GET)
    queryset = Car.objects.all()

    # Apply multiple filters
    filters = {
        'make_id': request.GET.get('make'),
        'model_id': request.GET.get('model'),
        'year': request.GET.get('year'),
        'price__lte': request.GET.get('max_price'),
        'bodyType': request.GET.get('bodyType'),
        'fuelType': request.GET.get('fuelType'),
        'color': request.GET.get('color'),
        'gearbox': request.GET.get('gearbox')
    }

    filters = {k: v for k, v in filters.items() if v}  # Remove None values
    queryset = queryset.filter(**filters)

    serializer = CarSerializer(queryset, many=True)
    return Response(serializer.data)

# ------------------ GET SINGLE CAR DETAILS ------------------
@api_view(["GET"])
def get_car(request, car_id):
    try:
        car = Car.objects.get(id=car_id)
        serializer = CarSerializer(car)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Car.DoesNotExist:
        return Response({"error": "Car not found"}, status=status.HTTP_404_NOT_FOUND)

# ------------------ UPDATE CAR ------------------
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

# ------------------ DELETE CAR ------------------
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

# ------------------ GET MAKES ------------------
@api_view(['GET'])
def get_makes(request):
    makes = CarMake.objects.all()
    serializer = CarMakeSerializer(makes, many=True)
    return Response(serializer.data)

# ------------------ GET MODELS BY MAKE ------------------
@api_view(['GET'])
def get_models(request, make_id):
    models = CarModel.objects.filter(make_id=make_id)
    serializer = CarModelSerializer(models, many=True)
    return Response(serializer.data)

# ------------------ IMAGES ---------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_car_images(request, car_id):
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    if not request.FILES.getlist('images'):
        return Response({'error': 'No images provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        car = Car.objects.get(id=car_id)
        images = request.FILES.getlist('images')
        
        for index, image in enumerate(images):
            CarImage.objects.create(
                car=car,
                image=image,
                is_primary=index == 0 and not car.images.filter(is_primary=True).exists(),
                order=index
            )
            
        if not car.image and images:
            car.image = car.images.filter(is_primary=True).first().image
            car.save()
            
        return Response({'message': 'Images uploaded successfully'}, status=status.HTTP_201_CREATED)
    except Car.DoesNotExist:
        return Response({'error': 'Car not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_car_image(request, image_id):
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        image = CarImage.objects.get(id=image_id)
        car = image.car
        image.delete()
        
        # If deleted image was primary, set new primary if other images exist
        if image.is_primary and car.images.exists():
            new_primary = car.images.first()
            car.set_primary_image(new_primary.id)
            
        return Response({'message': 'Image deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    except CarImage.DoesNotExist:
        return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)