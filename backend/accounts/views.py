from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.conf import settings
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer

User = get_user_model()


def set_token_cookies(response, refresh):
    """JWT 토큰을 httpOnly 쿠키에 설정"""
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)
    
    # Access token 쿠키 설정
    response.set_cookie(
        key='access_token',
        value=access_token,
        httponly=True,
        secure=False,  # 개발환경에서는 False, 프로덕션에서는 True
        samesite='Lax',
        max_age=60 * 60 * 2,  # 2시간
        path='/'
    )
    
    # Refresh token 쿠키 설정
    response.set_cookie(
        key='refresh_token',
        value=refresh_token,
        httponly=True,
        secure=False,  # 개발환경에서는 False, 프로덕션에서는 True
        samesite='Lax',
        max_age=60 * 60 * 24 * 7,  # 7일
        path='/'
    )
    
    return response


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """회원가입 API"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': '회원가입이 완료되었습니다.',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """로그인 API - JWT 토큰을 httpOnly 쿠키에 설정"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        nickname = serializer.validated_data['nickname']
        password = serializer.validated_data['password']
        
        user = authenticate(username=nickname, password=password)
        
        if user is not None:
            refresh = RefreshToken.for_user(user)
            response = Response({
                'message': '로그인 성공',
                'user': UserSerializer(user).data,
            }, status=status.HTTP_200_OK)
            
            # 쿠키에 토큰 설정
            set_token_cookies(response, refresh)
            return response
        else:
            return Response({
                'error': '아이디 또는 비밀번호가 올바르지 않습니다.'
            }, status=status.HTTP_401_UNAUTHORIZED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """현재 로그인한 사용자 정보 반환"""
    return Response({
        'user': UserSerializer(request.user).data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    """로그아웃 - 쿠키 삭제"""
    response = Response({
        'message': '로그아웃 성공'
    }, status=status.HTTP_200_OK)
    
    response.delete_cookie('access_token', path='/')
    response.delete_cookie('refresh_token', path='/')
    
    return response
