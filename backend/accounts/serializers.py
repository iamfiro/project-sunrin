from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """사용자 정보 직렬화"""
    name = serializers.CharField(source='username', read_only=True)
    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'high_score', 'created_at')
        read_only_fields = ('id', 'created_at', 'high_score')


class RegisterSerializer(serializers.ModelSerializer):
    """회원가입 직렬화"""
    name = serializers.CharField(source='username')
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('name', 'email', 'password')  # 회원가입 시 필요한 필드만

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['name'],
            password=validated_data['password'],
            email=validated_data.get('email', '')
        )
        return user


class LoginSerializer(serializers.Serializer):
    """로그인 직렬화"""
    name = serializers.CharField()
    password = serializers.CharField(write_only=True)
