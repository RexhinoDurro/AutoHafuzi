from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from ..models import Car, CarImage
from ..serializers import CarImageSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_car_images(request, car_id):
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    files = request.FILES.getlist('images')
    if not files:
        return Response({'error': 'No images provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        car = Car.objects.get(id=car_id)
        created_images = []
        
        for index, image in enumerate(files):
            is_primary = index == 0 and not car.images.filter(is_primary=True).exists()
            new_image = CarImage.objects.create(
                car=car,
                image=image,
                is_primary=is_primary,
                order=index
            )
            created_images.append(new_image.id)
            
        return Response({
            'message': 'Images uploaded successfully',
            'count': len(created_images),
            'image_ids': created_images
        }, status=status.HTTP_201_CREATED)
    except Car.DoesNotExist:
        return Response({'error': 'Car not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_car_image(request, image_id):
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        image = CarImage.objects.get(id=image_id)
        car = image.car
        image.delete()
        
        if image.is_primary and car.images.exists():
            new_primary = car.images.first()
            car.set_primary_image(new_primary.id)
            
        return Response({'message': 'Image deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    except CarImage.DoesNotExist:
        return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)