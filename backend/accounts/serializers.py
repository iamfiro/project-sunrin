from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """사용자 정보 직렬화"""
    class Meta:
        model = User
        fields = ('id', 'username', 'nickname', 'high_score', 'created_at')
        read_only_fields = ('id', 'created_at', 'high_score')


class RegisterSerializer(serializers.ModelSerializer):
    """회원가입 직렬화"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password_confirm', 'nickname', 'email')

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("비밀번호가 일치하지 않습니다.")
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            nickname=validated_data['nickname'],
            email=validated_data.get('email', '')
        )
        return user


class LoginSerializer(serializers.Serializer):
    """로그인 직렬화"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
