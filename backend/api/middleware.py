# middleware.py
import uuid
from .models import SiteVisit
from django.conf import settings
from django.utils import timezone
import datetime

class SiteVisitMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip tracking for static and media files
        if request.path.startswith('/static/') or request.path.startswith('/media/'):
            return self.get_response(request)
        
        # Skip tracking API calls except for car detail views
        # Make sure only the direct car detail page counts, not API calls to it
        if request.path.startswith('/api/') and not (
            request.path.startswith('/api/cars/') and 
            request.method == 'GET' and
            'X-Requested-For-Analytics' in request.headers
        ):
            return self.get_response(request)
            
        # Generate session ID if it doesn't exist
        if not request.session.get('visitor_id'):
            request.session['visitor_id'] = str(uuid.uuid4())
            # Set session to not expire when browser closes
            request.session.set_expiry(60*60*24*30)  # 30 days
        
        # Get the session ID
        session_id = request.session['visitor_id']
        
        # Check if this is an API request or standard page navigation
        is_api_request = request.path.startswith('/api/')
        
        # Only record new visits for page views (not API calls) unless specifically marked
        if not is_api_request or 'X-Requested-For-Analytics' in request.headers:
            try:
                # Check if we've already recorded this path for this session recently
                recent_visit = SiteVisit.objects.filter(
                    session_id=session_id,
                    path=request.path
                ).order_by('-visited_at').first()
                
                # If no recent visit or last visit was more than 30 minutes ago, record new visit
                record_new_visit = True
                if recent_visit:
                    time_difference = timezone.now() - recent_visit.visited_at
                    # Debug log to verify time difference calculation
                    print(f"Time since last visit to {request.path}: {time_difference}")
                    if time_difference < datetime.timedelta(minutes=30):
                        record_new_visit = False
                        print(f"Skipping record for {request.path} - within 30min window")
                
                if record_new_visit:
                    print(f"Recording new visit for {request.path}")
                    SiteVisit.objects.create(
                        session_id=session_id,
                        ip_address=self.get_client_ip(request),
                        user_agent=request.META.get('HTTP_USER_AGENT', ''),
                        referrer=request.META.get('HTTP_REFERER', ''),
                        path=request.path
                    )
            except Exception as e:
                # Log error but don't interrupt the request
                print(f"Error recording site visit: {e}")
        
        response = self.get_response(request)
        
        # Make sure the session cookie has the right settings
        response.set_cookie(
            settings.SESSION_COOKIE_NAME, 
            request.session.session_key, 
            max_age=settings.SESSION_COOKIE_AGE,
            domain=settings.SESSION_COOKIE_DOMAIN,
            secure=settings.SESSION_COOKIE_SECURE or None,
            httponly=settings.SESSION_COOKIE_HTTPONLY or None,
            samesite=settings.SESSION_COOKIE_SAMESITE,
        )
        
        return response
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip