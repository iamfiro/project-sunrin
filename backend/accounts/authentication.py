from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import RefreshToken

class CookieJWTAuthentication(JWTAuthentication):
    """쿠키에서 JWT 토큰을 읽어 인증하는 클래스"""
    
    def authenticate(self, request):
        # 먼저 쿠키에서 access_token 확인
        access_token = request.COOKIES.get('access_token')
        
        if access_token is None:
            # 쿠키에 없으면 헤더에서 확인 (기존 방식 지원)
            header = self.get_header(request)
            if header is None:
                # 쿠키도 없고 헤더도 없으면 None 반환 (인증 안함)
                return None
            
            raw_token = self.get_raw_token(header)
            if raw_token is None:
                return None
            
            try:
                validated_token = self.get_validated_token(raw_token)
                return self.get_user(validated_token), validated_token
            except (InvalidToken, TokenError):
                return None
        
        # 토큰 검증
        try:
            validated_token = self.get_validated_token(access_token)
            user = self.get_user(validated_token)
            return (user, validated_token)
        except (InvalidToken, TokenError):
            # access_token이 만료된 경우 refresh_token으로 갱신 시도
            refresh_token = request.COOKIES.get('refresh_token')
            if refresh_token:
                try:
                    refresh = RefreshToken(refresh_token)
                    new_access_token = str(refresh.access_token)
                    validated_token = self.get_validated_token(new_access_token)
                    user = self.get_user(validated_token)
                    # 새 토큰은 응답에서 설정해야 하므로 request에 저장
                    request._new_access_token = new_access_token
                    return (user, validated_token)
                except (InvalidToken, TokenError):
                    return None
            return None