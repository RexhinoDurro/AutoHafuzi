from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from ..models import ExteriorColor, InteriorColor, Upholstery
from ..serializers import ExteriorColorSerializer, InteriorColorSerializer, UpholsterySerializer

# Exterior Color views
@api_view(['GET'])
def get_exterior_colors(request):
    """Get all exterior colors"""
    colors = ExteriorColor.objects.all().order_by('name')
    serializer = ExteriorColorSerializer(colors, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_exterior_color(request):
    """Add a new exterior color"""
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = ExteriorColorSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_exterior_color(request, color_id):
    """Update an existing exterior color"""
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        color = ExteriorColor.objects.get(id=color_id)
        serializer = ExteriorColorSerializer(color, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except ExteriorColor.DoesNotExist:
        return Response({'error': 'Color not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_exterior_color(request, color_id):
    """Delete an exterior color"""
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        color = ExteriorColor.objects.get(id=color_id)
        # Check if the color is in use before deletion
        if color.car_set.exists():
            return Response(
                {'error': 'This color is in use by one or more cars and cannot be deleted'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        color.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except ExteriorColor.DoesNotExist:
        return Response({'error': 'Color not found'}, status=status.HTTP_404_NOT_FOUND)

# Interior Color views
@api_view(['GET'])
def get_interior_colors(request):
    """Get all interior colors"""
    colors = InteriorColor.objects.all().order_by('name')
    serializer = InteriorColorSerializer(colors, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_interior_color(request):
    """Add a new interior color with upholstery"""
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = InteriorColorSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_interior_color(request, color_id):
    """Update an existing interior color"""
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        color = InteriorColor.objects.get(id=color_id)
        serializer = InteriorColorSerializer(color, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except InteriorColor.DoesNotExist:
        return Response({'error': 'Color not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_interior_color(request, color_id):
    """Delete an interior color"""
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        color = InteriorColor.objects.get(id=color_id)
        # Check if the color is in use before deletion
        if color.car_set.exists():
            return Response(
                {'error': 'This color is in use by one or more cars and cannot be deleted'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        color.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except InteriorColor.DoesNotExist:
        return Response({'error': 'Color not found'}, status=status.HTTP_404_NOT_FOUND)
    
    
    
@api_view(['GET'])
def get_upholstery_types(request):
    """Get all upholstery types"""
    upholstery = Upholstery.objects.all().order_by('name')
    serializer = UpholsterySerializer(upholstery, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_upholstery(request):
    """Add a new upholstery type"""
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = UpholsterySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_upholstery(request, upholstery_id):
    """Update an existing upholstery type"""
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        upholstery = Upholstery.objects.get(id=upholstery_id)
        serializer = UpholsterySerializer(upholstery, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Upholstery.DoesNotExist:
        return Response({'error': 'Upholstery not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_upholstery(request, upholstery_id):
    """Delete an upholstery type"""
    if not request.user.is_staff:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        upholstery = Upholstery.objects.get(id=upholstery_id)
        # Check if the upholstery is in use before deletion
        if upholstery.car_set.exists():
            return Response(
                {'error': 'This upholstery type is in use by one or more cars and cannot be deleted'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        upholstery.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Upholstery.DoesNotExist:
        return Response({'error': 'Upholstery not found'}, status=status.HTTP_404_NOT_FOUND)