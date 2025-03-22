from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from ..models import Car, CarImage
from ..serializers import CarImageSerializer
import logging
import uuid
from django.http import HttpResponse
from PIL import Image, ImageDraw
import io

# Set up logger
logger = logging.getLogger(__name__)

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
        
        logger.debug(f"Processing {len(files)} images for car {car_id}")
        
        for index, image in enumerate(files):
            try:
                # Generate a unique identifier for the image to prevent Cloudinary conflicts
                unique_id = str(uuid.uuid4())[:8]
                image_name = f"car_{car_id}_{unique_id}_{image.name}"
                logger.debug(f"Processing image {index+1}: {image_name}")
                
                # Check if this is the first image and if the car has no primary image
                is_primary = index == 0 and not car.images.filter(is_primary=True).exists()
                
                # Create the image with the renamed file
                image.name = image_name  # Rename the file
                
                new_image = CarImage.objects.create(
                    car=car,
                    image=image,
                    is_primary=is_primary,
                    order=car.images.count() + index  # Ensure proper ordering
                )
                
                logger.debug(f"Image created successfully. ID: {new_image.id}, URL: {new_image.image.url}")
                created_images.append(new_image.id)
                
            except Exception as e:
                logger.error(f"Error uploading image {index+1}: {str(e)}")
                import traceback
                logger.error(traceback.format_exc())
        
        # Return with request context for proper URL generation
        return Response({
            'message': 'Images uploaded successfully',
            'count': len(created_images),
            'image_ids': created_images,
            'images': CarImageSerializer(
                car.images.filter(id__in=created_images),
                many=True,
                context={'request': request}
            ).data
        }, status=status.HTTP_201_CREATED)
    except Car.DoesNotExist:
        return Response({'error': 'Car not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Unexpected error in add_car_images: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_car_image(request, image_id):
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        image = CarImage.objects.get(id=image_id)
        car = image.car
        
        logger.debug(f"Deleting image {image_id} from car {car.id}")
        
        # Delete the actual file from Cloudinary first
        if image.image:
            try:
                logger.debug(f"Deleting file from Cloudinary: {image.image.name}")
                # This should trigger the Cloudinary deletion via the storage backend
                image.image.delete(save=False)
            except Exception as e:
                logger.error(f"Error deleting image from Cloudinary: {str(e)}")
        
        # Now delete the database record
        image.delete()
        
        # If this was the primary image, set a new primary image
        if image.is_primary and car.images.exists():
            new_primary = car.images.first()
            logger.debug(f"Setting new primary image: {new_primary.id}")
            car.set_primary_image(new_primary.id)
            
        return Response({'message': 'Image deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    except CarImage.DoesNotExist:
        return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Unexpected error in delete_car_image: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def placeholder_image(request, width, height):
    """Generate a placeholder image with specified dimensions"""
    # Validate dimensions
    max_dimension = 1200  # Reasonable limit
    width = min(max(width, 10), max_dimension)  # Between 10 and max_dimension
    height = min(max(height, 10), max_dimension)  # Between 10 and max_dimension
    
    # Create a blank image with a light gray background
    img = Image.new('RGB', (width, height), color=(240, 240, 240))
    draw = ImageDraw.Draw(img)
    
    # Draw a frame
    draw.rectangle(
        [(0, 0), (width-1, height-1)],
        outline=(200, 200, 200)
    )
    
    # Draw diagonal lines
    draw.line([(0, 0), (width, height)], fill=(200, 200, 200), width=1)
    draw.line([(0, height), (width, 0)], fill=(200, 200, 200), width=1)
    
    # Draw text with dimensions
    try:
        # This assumes PIL has default font available
        text = f"{width}×{height}"
        text_width = len(text) * 8  # Approximate width
        text_position = ((width - text_width) // 2, height // 2 - 5)
        draw.text(text_position, text, fill=(150, 150, 150))
    except Exception:
        # If text rendering fails, just skip it
        pass
    
    # Save the image to a bytes buffer
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG', quality=70)
    buffer.seek(0)
    
    # Return the image as the response
    return HttpResponse(buffer, content_type='image/jpeg')