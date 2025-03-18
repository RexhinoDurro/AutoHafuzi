from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.views.decorators.csrf import csrf_exempt



@api_view(['POST', 'GET'])
@csrf_exempt
def admin_login(request):
    if request.method == 'POST':
        # Handle login as is
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
    
    elif request.method == 'GET':
        return Response({'message': 'GET method not supported for login.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
