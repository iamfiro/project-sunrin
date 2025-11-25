from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """리듬게임 사용자 모델"""
    nickname = models.CharField(max_length=50, unique=True, help_text="게임 내 닉네임")
    high_score = models.IntegerField(default=0, help_text="최고 점수")
    charts = models.ManyToManyField('game.Chart', related_name='creators', blank=True, help_text="사용자가 만든 차트들 (커뮤니티 곡)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username
