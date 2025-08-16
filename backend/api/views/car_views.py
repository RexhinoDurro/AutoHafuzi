# car_views.py - Update views to use slug instead of car_id
import os
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Count
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta, datetime

from django.conf import settings
from ..models import Car, CarView, SiteVisit
from ..serializers import CarSerializer, SiteVisitSerializer
import json
import uuid
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
import logging

# Set up logger
logger = logging.getLogger(__name__)

class CarPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100

def handle_m2m_options(request_data, serializer_data):
    """
    Extract and handle options data separately from the serializer
    to avoid common DRF M2M issues
    """
    # Get options IDs from request data
    option_ids = request_data.getlist('options', [])
    
    # Print for debugging
    logger.debug(f"Received option_ids: {option_ids}")
    
    # Remove options field from serializer data to avoid validation issues
    if 'options' in serializer_data:
        serializer_data.pop('options')
        
    return [int(option_id) for option_id in option_ids if option_id.isdigit()]

@api_view(["GET"])
def get_cars(request):
    # This function remains largely the same, just update the serializer to include the slug
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

        # Build filters dictionary correctly
        filters = {}
        
        # Handle simple direct filters
        if request.GET.get('make'):
            filters['make_id'] = request.GET.get('make')
        
        if request.GET.get('model'):
            filters['model_id'] = request.GET.get('model')
            
        # Handle year filter correctly for first_registration_year
        if request.GET.get('year'):
            filters['first_registration_year'] = request.GET.get('year')
            
        # Handle numeric range filters
        if request.GET.get('max_price'):
            filters['price__lte'] = request.GET.get('max_price')
            
        if request.GET.get('min_price'):
            filters['price__gte'] = request.GET.get('min_price')
            
        if request.GET.get('max_mileage'):
            filters['mileage__lte'] = request.GET.get('max_mileage')
            
        # Handle other simple filters
        if request.GET.get('bodyType'):
            filters['body_type'] = request.GET.get('bodyType')
            
        if request.GET.get('fuelType'):
            filters['fuel_type'] = request.GET.get('fuelType')
            
        if request.GET.get('gearbox'):
            filters['gearbox'] = request.GET.get('gearbox')
            
        # Handle color filter - this might need adjustment based on your color model structure
        if request.GET.get('color'):
            filters['exterior_color__name'] = request.GET.get('color')
        
        # Apply filters to queryset
        if filters:
            queryset = queryset.filter(**filters)

        # Sorting
        sort_by = request.GET.get('sort')
        if sort_by:
            sort_options = {
                'price_asc': 'price',
                'price_desc': '-price',
                'year_asc': 'first_registration_year',
                'year_desc': '-first_registration_year',
                'mileage_asc': 'mileage',
                'mileage_desc': '-mileage',
                'created_desc': '-created_at'
            }
            if sort_by in sort_options:
                queryset = queryset.order_by(sort_options[sort_by])

        # Pagination
        paginator = CarPagination()
        paginated_queryset = paginator.paginate_queryset(queryset, request)
        
        # Pass request in context for correct URL generation
        serializer = CarSerializer(paginated_queryset, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    except ValidationError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        import traceback
        logger.error(f"Error in get_cars: {str(e)}")
        logger.error(traceback.format_exc())
        return Response(
            {'error': 'An unexpected error occurred', 'detail': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(["GET"])
def get_car(request, car_slug):
    """Get car details by slug instead of ID"""
    try:
        car = get_object_or_404(Car, slug=car_slug)
        session_id = request.session.get('visitor_id')
        
        # If no session ID yet, create one
        if not session_id:
            session_id = str(uuid.uuid4())
            request.session['visitor_id'] = session_id
            request.session.set_expiry(60*60*24*30)  # 30 days
        
        # IMPORTANT: Check for view tracking header
        # This logic needs to run BEFORE any view tracking
        should_track_view = True
        if 'HTTP_X_VIEW_TRACKING' in request.META:
            if request.META['HTTP_X_VIEW_TRACKING'].lower() == 'false':
                should_track_view = False
                logger.debug(f"Skipping view count for car {car.id} due to X-View-Tracking: false header")
        
        # Only track views if the header allows it
        if should_track_view:
            try:
                # Get client IP
                x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
                ip = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR', '')
                
                # Check if this car has been viewed by this session recently (within 30 minutes)
                thirty_minutes_ago = timezone.now() - timedelta(minutes=30)
                recent_view = CarView.objects.filter(
                    car=car,
                    session_id=session_id,
                    viewed_at__gte=thirty_minutes_ago
                ).exists()
                
                if not recent_view:
                    # Create a new view record
                    CarView.objects.create(
                        car=car,
                        session_id=session_id,
                        ip_address=ip
                    )
                    
                    # Increment the view counter exactly once
                    car.view_count += 1
                    car.save(update_fields=['view_count'])
                    logger.debug(f"View count incremented for car {car.id} - now {car.view_count}")
                else:
                    logger.debug(f"Skipped view increment - car {car.id} viewed recently by session {session_id}")
            except Exception as e:
                logger.error(f"Error recording car view: {e}")
                import traceback
                logger.error(traceback.format_exc())
        
        # Always return the car data
        # Make sure to include request in context for proper URL generation
        serializer = CarSerializer(car, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Car.DoesNotExist:
        return Response({"error": "Car not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_car(request):
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    data = request.data.copy()
    logger.debug(f"Received car data: {data}")
    
    # Process boolean fields
    for key in ['is_used', 'full_service_history', 'customs_paid', 'discussed_price']:
        if key in data and isinstance(data[key], str):
            data[key] = data[key].lower() == 'true'
    
    # Handle discussed price logic - if discussed_price is True, ensure price is 0
    if data.get('discussed_price') is True:
        data['price'] = 0
    
    # Process first_registration fields
    if ('first_registration_day' in data and data['first_registration_day'] and
        'first_registration_month' in data and data['first_registration_month'] and
        'first_registration_year' in data and data['first_registration_year']):
        
        # Parse the individual fields to integers
        day = int(data['first_registration_day'])
        month = int(data['first_registration_month'])
        year = int(data['first_registration_year'])
        
        # Create a date object and store it in the first_registration field
        try:
            first_registration_date = datetime(year, month, day).date()
            data['first_registration'] = first_registration_date.isoformat()
        except ValueError as e:
            logger.error(f"Error creating date from day={day}, month={month}, year={year}: {e}")
    
    # Extract options to handle separately
    option_ids = handle_m2m_options(request.data, data)
    
    # Include request in context for URL generation
    serializer = CarSerializer(data=data, context={'request': request})
    if not serializer.is_valid():
        logger.error(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    car = serializer.save()
    # Set the options manually after saving
    if option_ids:
        try:
            from ..models import Option
            options = Option.objects.filter(id__in=option_ids)
            car.options.set(options)
        except Exception as e:
            logger.error(f"Error setting options: {e}")
    
    # Return the serialized data with request context for proper URLs
    return Response(CarSerializer(car, context={'request': request}).data, status=status.HTTP_201_CREATED)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_car(request, car_slug):
    """Update car details by slug instead of ID"""
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        car = get_object_or_404(Car, slug=car_slug)
        data = request.data.copy()
        logger.debug(f"Updating car {car.id} with data: {data}")
        
        # Process boolean fields
        for key in ['is_used', 'full_service_history', 'customs_paid', 'discussed_price']:
            if key in data and isinstance(data[key], str):
                data[key] = data[key].lower() == 'true'
        
        # Handle discussed price logic - if discussed_price is True, ensure price is 0
        if data.get('discussed_price') is True:
            data['price'] = 0
        
        # Process first_registration fields
        if ('first_registration_day' in data and data['first_registration_day'] and
            'first_registration_month' in data and data['first_registration_month'] and
            'first_registration_year' in data and data['first_registration_year']):
            
            # Parse the individual fields to integers
            day = int(data['first_registration_day'])
            month = int(data['first_registration_month'])
            year = int(data['first_registration_year'])
            
            # Create a date object and store it in the first_registration field
            try:
                first_registration_date = datetime(year, month, day).date()
                data['first_registration'] = first_registration_date.isoformat()
            except ValueError as e:
                logger.error(f"Error creating date from day={day}, month={month}, year={year}: {e}")
            
        # Extract options to handle separately
        option_ids = handle_m2m_options(request.data, data)
        
        # Include request in context for URL generation
        serializer = CarSerializer(car, data=data, partial=True, context={'request': request})
        if serializer.is_valid():
            car = serializer.save()
            # Set the options manually after saving
            if option_ids:
                try:
                    from ..models import Option
                    options = Option.objects.filter(id__in=option_ids)
                    car.options.set(options)
                except Exception as e:
                    logger.error(f"Error setting options: {e}")
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Car.DoesNotExist:
        return Response({'error': 'Car not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_car(request, car_slug):
    """Delete car by slug instead of ID"""
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        car = get_object_or_404(Car, slug=car_slug)
        
        # Delete all associated images and their files
        for image in car.images.all():
            try:
                # Delete the file from filesystem
                if image.image and os.path.isfile(image.image.path):
                    os.remove(image.image.path)
            except Exception as e:
                logger.error(f"Error deleting image file: {str(e)}")
        
        # Now delete the car (which will cascade delete related objects)
        car.delete()
        return Response({'message': 'Car deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
    except Car.DoesNotExist:
        return Response({'error': 'Car not found'}, status=status.HTTP_404_NOT_FOUND)

def about_page(request):
    """
    Render the about page with company information
    """
    try:
        # Company description
        company_description = 'Driven by passion, committed to quality. We\'ve been helping customers find their perfect ride since 2010.'
        
        # If it's an API request, return JSON
        if request.accepts('application/json'):
            return JsonResponse({
                'company_description': company_description
            })
        
        # For regular page render
        return render(request, 'about.html', {
            'company_description': company_description
        })
    
    except Exception as e:
        # Handle any errors
        return JsonResponse({
            'error': str(e)
        }, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_site_analytics(request):
    """Get site analytics for the admin dashboard"""
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Get date range for filtering
        days = int(request.query_params.get('days', 30))
        date_from = timezone.now() - timedelta(days=days)
        
        # Get total unique visitors
        unique_visitors = SiteVisit.objects.filter(
            visited_at__gte=date_from
        ).values('session_id').distinct().count()
        
        # Get total page views
        total_page_views = SiteVisit.objects.filter(
            visited_at__gte=date_from
        ).count()
        
        # Get car views
        car_views = CarView.objects.filter(
            viewed_at__gte=date_from
        ).count()
        
        # Get most viewed cars
        most_viewed_cars = Car.objects.order_by('-view_count')[:10]
        most_viewed_cars_data = [{
            'id': car.id,
            'name': f"{car.make.name} {car.model.name} ({car.first_registration_year or 'N/A'})",
            'views': car.view_count,
            'slug': car.slug
        } for car in most_viewed_cars]
        
        # Get daily visits for the chart
        daily_visits = SiteVisit.objects.filter(
            visited_at__gte=date_from
        ).extra({
            'day': "DATE(visited_at)"
        }).values('day').annotate(count=Count('id')).order_by('day')
        
        # Format for chart
        daily_visits_data = [{
            'date': visit['day'],
            'views': visit['count']
        } for visit in daily_visits]
        
        return Response({
            'unique_visitors': unique_visitors,
            'total_page_views': total_page_views,
            'car_views': car_views,
            'most_viewed_cars': most_viewed_cars_data,
            'daily_visits': daily_visits_data
        })
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)