# views/cloudinary_views.py

import cloudinary
import cloudinary.uploader
import cloudinary.api
import logging
import uuid
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.shortcuts import get_object_or_404
from ..models import Car, CarImage
from ..serializers import CarImageSerializer

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_car_images(request, car_slug):
    """
    Upload images directly to Cloudinary for a specific car (using slug)
    """
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        car = get_object_or_404(Car, slug=car_slug)
    except Car.DoesNotExist:
        return Response({'error': 'Car not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Extensive logging for debugging
    logger.info(f"Image upload request for car: {car_slug}")
    logger.info(f"Request method: {request.method}")
    logger.info(f"Request content type: {request.content_type}")
    logger.info(f"Request FILES keys: {list(request.FILES.keys())}")
    
    # Configure Cloudinary
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_STORAGE['CLOUD_NAME'],
        api_key=settings.CLOUDINARY_STORAGE['API_KEY'],
        api_secret=settings.CLOUDINARY_STORAGE['API_SECRET'],
        secure=settings.CLOUDINARY_STORAGE.get('SECURE', True)
    )
    
    uploaded_images = []
    errors = []
    
    # Get images from request
    images = request.FILES.getlist('images')
    
    if not images:
        logger.error("No images provided in the request")
        return Response({'error': 'No images provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check existing images count
    current_images_count = car.images.count()
    if current_images_count + len(images) > 10:
        return Response({
            'error': f'Maximum 10 images allowed. You already have {current_images_count} images.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    for img in images:
        try:
            # Validate file size (5MB limit)
            if img.size > 5 * 1024 * 1024:  # 5MB
                errors.append(f"Image {img.name} exceeds 5MB size limit")
                continue
            
            # Validate file type
            allowed_types = ['image/jpeg', 'image/png', 'image/webp']
            if img.content_type not in allowed_types:
                errors.append(f"Invalid file type for {img.name}. Allowed: JPEG, PNG, WebP")
                continue
            
            # Generate a unique folder path for this car
            folder_path = f"autohafuzi/cars/{car.id}"
            unique_id = uuid.uuid4().hex[:8]
            
            # Upload to Cloudinary with additional transformations
            upload_result = cloudinary.uploader.upload(
                img,
                folder=folder_path,
                public_id=unique_id,
                overwrite=True,
                resource_type="image",
                transformation=[
                    {'quality': 'auto:good'},
                    {'format': 'auto'}
                ]
            )
            
            logger.info(f"Cloudinary upload result for {img.name}: {upload_result}")
            
            # Create CarImage object with Cloudinary data
            image = CarImage.objects.create(
                car=car,
                image=upload_result['public_id'],
                public_id=upload_result['public_id'],
                is_primary=current_images_count == 0 and len(uploaded_images) == 0  # First image is primary
            )
            
            # Get the serialized data 
            image_data = CarImageSerializer(image).data
            # Explicitly add the URL from the upload result
            image_data['url'] = upload_result.get('secure_url', '')
            uploaded_images.append(image_data)
            
        except Exception as e:
            logger.error(f"Error uploading image {img.name} to Cloudinary: {str(e)}")
            errors.append(f"Failed to upload {img.name}: {str(e)}")
    
    # Determine response based on upload results
    if uploaded_images:
        return Response({
            'uploaded': uploaded_images,
            'errors': errors
        }, status=status.HTTP_201_CREATED if not errors else status.HTTP_207_MULTI_STATUS)
    
    return Response({
        'error': 'Failed to upload images',
        'details': errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_car_image(request, image_id):
    """
    Delete a car image from Cloudinary
    """
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        image = CarImage.objects.get(id=image_id)
    except CarImage.DoesNotExist:
        return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        # Get the public_id from the image
        public_id = image.public_id
        
        # Configure Cloudinary
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_STORAGE['CLOUD_NAME'],
            api_key=settings.CLOUDINARY_STORAGE['API_KEY'],
            api_secret=settings.CLOUDINARY_STORAGE['API_SECRET'],
            secure=settings.CLOUDINARY_STORAGE.get('SECURE', True)
        )
        
        # Delete the image from Cloudinary
        if public_id:
            cloudinary.uploader.destroy(public_id)
        
        # Delete the image record
        image.delete()
        
        return Response({'message': 'Image deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    
    except Exception as e:
        logger.error(f"Error deleting image from Cloudinary: {str(e)}")
        return Response({'error': f'Failed to delete image: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_primary_image(request, car_slug, image_id):
    """
    Set an image as the primary image for a car (using slug)
    """
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        car = get_object_or_404(Car, slug=car_slug)
        image = CarImage.objects.get(id=image_id, car=car)
        
        # Set as primary image
        # First, clear any existing primary images
        car.images.update(is_primary=False)
        
        # Then set the new primary image
        image.is_primary = True
        image.save()
        
        return Response({'message': 'Primary image set successfully'}, status=status.HTTP_200_OK)
    
    except Car.DoesNotExist:
        return Response({'error': 'Car not found'}, status=status.HTTP_404_NOT_FOUND)
    
    except CarImage.DoesNotExist:
        return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        logger.error(f"Error setting primary image: {str(e)}")
        return Response({'error': f'Failed to set primary image: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_car_images(request, car_slug):
    """
    Get all images for a specific car (using slug)
    """
    try:
        car = get_object_or_404(Car, slug=car_slug)
        images = car.images.all()
        response_data = []
        
        for image in images:
            # Serialize each image manually to avoid url attribute issue
            image_data = CarImageSerializer(image).data
            
            # If there's a public_id, manually construct the Cloudinary URL
            if image.public_id:
                # Construct a Cloudinary URL
                image_data['url'] = f"https://res.cloudinary.com/{settings.CLOUDINARY_STORAGE['CLOUD_NAME']}/image/upload/{image.public_id}"
            
            response_data.append(image_data)
                    
        return Response(response_data, status=status.HTTP_200_OK)
    
    except Car.DoesNotExist:
        return Response({'error': 'Car not found'}, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        logger.error(f"Error getting car images: {str(e)}")
        return Response({'error': f'Failed to get images: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reorder_car_images(request, car_slug):
    """
    Reorder car images based on provided order list (using slug)
    """
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        car = get_object_or_404(Car, slug=car_slug)
        
        # Get the ordered list of image IDs from the request
        image_ids = request.data.get('image_ids', [])
        
        if not image_ids:
            return Response({'error': 'No image IDs provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update order of each image
        for index, image_id in enumerate(image_ids):
            try:
                image = CarImage.objects.get(id=image_id, car=car)
                image.order = index
                image.save(update_fields=['order'])
            except CarImage.DoesNotExist:
                logger.warning(f"Image {image_id} not found or does not belong to car {car_slug}")
        
        # Return updated images with manually constructed URLs
        images = car.images.all().order_by('order')
        response_data = []
        
        for image in images:
            image_data = CarImageSerializer(image).data
            if image.public_id:
                image_data['url'] = f"https://res.cloudinary.com/{settings.CLOUDINARY_STORAGE['CLOUD_NAME']}/image/upload/{image.public_id}"
            response_data.append(image_data)
            
        return Response(response_data, status=status.HTTP_200_OK)
    
    except Car.DoesNotExist:
        return Response({'error': 'Car not found'}, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        logger.error(f"Error reordering car images: {str(e)}")
        return Response({'error': f'Failed to reorder images: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)