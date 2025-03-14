from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import render
from django.http import JsonResponse
from django.core.mail import send_mail
from django.conf import settings
from ..models import ContactMessage
from ..serializers import ContactMessageSerializer

@api_view(["GET"])
def contact_page(request):
    """
    Render the contact page with company contact information
    """
    try:
        # Company contact information
        contact_info = {
            'address': '123 Auto Avenue, Car City, CC 12345',
            'phone': '+1 (555) 123-4567',
            'email': 'info@cardealer.com',
            'working_hours': 'Monday to Friday: 9:00 AM - 6:00 PM, Saturday: 10:00 AM - 4:00 PM'
        }
        
        # If it's an API request, return JSON
        if request.accepts('application/json'):
            return JsonResponse(contact_info)
        
        # For regular page render
        return render(request, 'contact.html', contact_info)
    
    except Exception as e:
        # Handle any errors
        return JsonResponse({
            'error': str(e)
        }, status=500)

@api_view(["POST"])
def submit_contact_form(request):
    """
    Handle contact form submission
    """
    try:
        data = request.data
        
        # Create and save the contact message
        serializer = ContactMessageSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        contact_message = serializer.save()
        
        # Send email notification to admin (if email settings are configured)
        try:
            send_mail(
                subject=f'New Contact Form Submission: {data.get("subject", "No Subject")}',
                message=f'Name: {data.get("name")}\nEmail: {data.get("email")}\nPhone: {data.get("phone", "Not provided")}\n\nMessage:\n{data.get("message")}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.ADMIN_EMAIL],
                fail_silently=True,
            )
        except Exception as e:
            # Log the email error but don't fail the request
            print(f"Error sending email notification: {e}")
        
        return Response({
            'message': 'Your message has been sent successfully. We will contact you soon.',
            'id': contact_message.id
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': 'An error occurred while submitting your message',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_contact_messages(request):
    """
    Get all contact messages (admin only)
    """
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Get query parameters
        read_status = request.GET.get('read')
        
        # Start with all messages
        queryset = ContactMessage.objects.all().order_by('-created_at')
        
        # Filter by read status if provided
        if read_status is not None:
            is_read = read_status.lower() == 'true'
            queryset = queryset.filter(is_read=is_read)
        
        serializer = ContactMessageSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'An error occurred while retrieving contact messages',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def mark_message_as_read(request, message_id):
    """
    Mark a contact message as read (admin only)
    """
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        message = ContactMessage.objects.get(id=message_id)
        message.is_read = True
        message.save()
        
        serializer = ContactMessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except ContactMessage.DoesNotExist:
        return Response({'error': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': 'An error occurred',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_message(request, message_id):
    """
    Delete a contact message (admin only)
    """
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        message = ContactMessage.objects.get(id=message_id)
        message.delete()
        
        return Response({
            'message': 'Contact message deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)
        
    except ContactMessage.DoesNotExist:
        return Response({'error': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': 'An error occurred',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)