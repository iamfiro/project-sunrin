from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """리듬게임 사용자 모델"""
    nickname = models.CharField(max_length=50, unique=True, help_text="게임 내 닉네임")
    profileImage = models.ImageField(upload_to='profiles/', null=True, blank=True, help_text="프로필 이미지")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username
