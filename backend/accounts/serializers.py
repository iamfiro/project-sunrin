from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Sum, Max

User = get_user_model()

class UserStatsSerializer(serializers.Serializer):
    """사용자 게임 통계 직렬화"""
    perfectCount = serializers.IntegerField()
    highestScore = serializers.IntegerField()


class UserSerializer(serializers.ModelSerializer):
    """사용자 정보 직렬화"""
    stats = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'nickname', 'email', 'stats')
        read_only_fields = ('id', 'email', 'stats')

    def get_stats(self, obj):
        from game.models import Result
        
        # 해당 유저의 모든 Result에서 perfect 합계와 최고 점수 집계
        stats = Result.objects.filter(user=obj).aggregate(
            perfectCount=Sum('perfect'),
            highestScore=Max('score')
        )
        
        return {
            'perfectCount': stats['perfectCount'] or 0,
            'highestScore': stats['highestScore'] or 0,
        }


class RegisterSerializer(serializers.ModelSerializer):
    """회원가입 직렬화"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('nickname', 'email', 'password', 'password_confirm')

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("비밀번호가 일치하지 않습니다.")
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['nickname'],
            password=validated_data['password'],
            email=validated_data.get('email', ''),
            nickname=validated_data['nickname'],
        )
        # Explicitly save to ensure timestamps are set
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """로그인 직렬화"""
    nickname = serializers.CharField()
    password = serializers.CharField(write_only=True)
