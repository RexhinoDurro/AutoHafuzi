# views/image_views.py (rename from cloudinary_views.py)

import os
import logging
from PIL import Image
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from ..models import Car, CarImage
from ..serializers import CarImageSerializer

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_car_images(request, car_slug):
    """Upload images to local storage for a specific car (using slug)"""
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        car = get_object_or_404(Car, slug=car_slug)
    except Car.DoesNotExist:
        return Response({'error': 'Car not found'}, status=status.HTTP_404_NOT_FOUND)
    
    logger.info(f"Image upload request for car: {car_slug}")
    logger.info(f"Request FILES keys: {list(request.FILES.keys())}")
    
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
            allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
            if img.content_type not in allowed_types:
                errors.append(f"Invalid file type for {img.name}. Allowed: JPEG, PNG, WebP")
                continue
            
            # Create CarImage object
            image = CarImage.objects.create(
                car=car,
                image=img,
                is_primary=current_images_count == 0 and len(uploaded_images) == 0  # First image is primary
            )
            
            # Get the serialized data with request context for proper URLs
            image_data = CarImageSerializer(image, context={'request': request}).data
            uploaded_images.append(image_data)
            
        except Exception as e:
            logger.error(f"Error uploading image {img.name}: {str(e)}")
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

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_car_image(request, image_id):
    """Update/replace a car image with a new one"""
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        image = CarImage.objects.get(id=image_id)
    except CarImage.DoesNotExist:
        return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        # Get the image from the request
        new_image_file = request.FILES.get('image')
        if not new_image_file:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file size (5MB limit)
        if new_image_file.size > 5 * 1024 * 1024:  # 5MB
            return Response({'error': 'Image exceeds 5MB size limit'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
        if new_image_file.content_type not in allowed_types:
            return Response({'error': 'Invalid file type. Allowed: JPEG, PNG, WebP'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Delete the old image file
        if image.image and os.path.isfile(image.image.path):
            os.remove(image.image.path)
        
        # Update the image object with new file
        image.image = new_image_file
        image.save()
        
        # Prepare response with request context for proper URLs
        image_data = CarImageSerializer(image, context={'request': request}).data
        
        return Response(image_data, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Error updating image: {str(e)}")
        return Response({'error': f'Failed to update image: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_car_image(request, image_id):
    """Delete a car image from local storage"""
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        image = CarImage.objects.get(id=image_id)
    except CarImage.DoesNotExist:
        return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        # Delete the image (the model's delete method will handle file deletion)
        image.delete()
        
        return Response({'message': 'Image deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    
    except Exception as e:
        logger.error(f"Error deleting image: {str(e)}")
        return Response({'error': f'Failed to delete image: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_primary_image(request, car_slug, image_id):
    """Set an image as the primary image for a car (using slug)"""
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        car = get_object_or_404(Car, slug=car_slug)
        image = CarImage.objects.get(id=image_id, car=car)
        
        # Set as primary image
        car.images.update(is_primary=False)
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
    """Get all images for a specific car (using slug)"""
    try:
        car = get_object_or_404(Car, slug=car_slug)
        images = car.images.all()
        
        # Serialize with request context for proper URLs
        serializer = CarImageSerializer(images, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    except Car.DoesNotExist:
        return Response({'error': 'Car not found'}, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        logger.error(f"Error getting car images: {str(e)}")
        return Response({'error': f'Failed to get images: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reorder_car_images(request, car_slug):
    """Reorder car images based on provided order list (using slug)"""
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
        
        # Return updated images with proper URLs
        images = car.images.all().order_by('order')
        serializer = CarImageSerializer(images, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    except Car.DoesNotExist:
        return Response({'error': 'Car not found'}, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        logger.error(f"Error reordering car images: {str(e)}")
        return Response({'error': f'Failed to reorder images: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)