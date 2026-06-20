from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, Transaction
from .serializers import (
    UserSerializer, UserProfileSerializer, 
    TransactionSerializer, DepositSerializer,
    RegisterSerializer, LoginSerializer
)

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = User.objects.create_user(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
            name=serializer.validated_data['name']
        )
        tokens = get_tokens_for_user(user)
        user_serializer = UserProfileSerializer(user)
        return Response({
            'success': True,
            'token': tokens['access'],
            'refresh': tokens['refresh'],
            'user': user_serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response({
        'success': False,
        'message': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = authenticate(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )
        if user:
            tokens = get_tokens_for_user(user)
            user_serializer = UserProfileSerializer(user)
            return Response({
                'success': True,
                'token': tokens['access'],
                'refresh': tokens['refresh'],
                'user': user_serializer.data
            })
        return Response({
            'success': False,
            'message': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)
    return Response({
        'success': False,
        'message': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    serializer = UserProfileSerializer(user)
    return Response({
        'success': True,
        'user': serializer.data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deposit(request):
    serializer = DepositSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        amount = serializer.validated_data['amount']
        
        # Update user balance
        user.balance += amount
        user.save()
        
        # Create transaction
        transaction = Transaction.objects.create(
            user=user,
            type='deposit',
            amount=amount,
            description=f"Deposit of ${amount}",
            balance_after=user.balance
        )
        
        return Response({
            'success': True,
            'message': f'Successfully deposited ${amount}',
            'newBalance': user.balance,
            'transaction': TransactionSerializer(transaction).data
        })
    return Response({
        'success': False,
        'message': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_transactions(request):
    transactions = Transaction.objects.filter(user=request.user)[:50]
    serializer = TransactionSerializer(transactions, many=True)
    return Response({
        'success': True,
        'transactions': serializer.data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({
            'success': True,
            'message': 'Logged out successfully'
        })
    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)