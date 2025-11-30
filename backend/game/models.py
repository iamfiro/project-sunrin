from django.db import models
from django.conf import settings

class Note(models.Model):
    """노트 모델"""
    NOTE_TYPES = [
        ('tap', 'Tap'),
        ('hold', 'Hold'),
    ]

    id = models.AutoField(primary_key=True, help_text="노트 ID")
    chart = models.ForeignKey('Chart', on_delete=models.CASCADE, related_name='notes', help_text="노트가 속한 차트")
    time = models.IntegerField(help_text="노트가 내려올 시간 (ms 단위)")
    lane = models.IntegerField(help_text="노트의 라인 위치")
    type = models.CharField(max_length=10, choices=NOTE_TYPES, help_text="노트 타입")
    duration = models.IntegerField(null=True, blank=True, help_text="홀드 노트의 유지 시간 (ms 단위)")

    def __str__(self):
        return f"Note {self.id} - {self.type} at {self.time}ms"

class Chart(models.Model):
    """곡 차트 모델"""
    musicId = models.CharField(max_length=100, unique=True, help_text="곡 ID")
    title = models.CharField(max_length=200, help_text="곡 제목")
    song = models.CharField(max_length=500, help_text="노래 음원 파일 경로")
    backgroundVideo = models.CharField(max_length=500, help_text="백그라운드 비디오 파일 경로")
    coverUrl = models.CharField(max_length=500, help_text="커버 이미지 URL")
    isCommunitySong = models.BooleanField(default=False, help_text="커뮤니티 곡 여부")
    artist = models.CharField(max_length=200, help_text="아티스트명")
    difficulty = models.IntegerField(help_text="난이도 (1~15)")
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='charts', help_text="차트를 만든 사용자")

    def __str__(self):
        return f"{self.title} by {self.artist} (ID: {self.musicId})"

class Rank(models.Model):
    """랭킹 모델"""
    chart = models.ForeignKey(Chart, on_delete=models.CASCADE, related_name='ranks', help_text="랭킹이 속한 차트")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ranks', help_text="랭킹을 기록한 사용자")
    score = models.IntegerField(help_text="점수")

    class Meta:
        unique_together = ('chart', 'user')  # 한 차트에 한 사용자당 하나의 랭킹

    def __str__(self):
        return f"{self.user.nickname} - {self.score} on {self.chart.title}"

class Result(models.Model):
    """곡 결과 모델"""
    RANKS = [
        ('F', 'F'),
        ('D', 'D'),
        ('C', 'C'),
        ('B', 'B'),
        ('A', 'A'),
        ('S', 'S'),
        ('SS', 'SS'),
    ]

    musicId = models.CharField(max_length=100, help_text="곡 ID")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='results', help_text="결과를 기록한 사용자")
    chart = models.ForeignKey(Chart, on_delete=models.CASCADE, related_name='results', help_text="결과가 속한 차트")
    difficulty = models.IntegerField(help_text="플레이한 난이도")
    score = models.IntegerField(help_text="최종 점수")
    accuracy = models.FloatField(help_text="정확도 (%)")
    rank = models.CharField(max_length=2, choices=RANKS, help_text="점수 기반 랭크")
    combo = models.CharField(max_length=500, help_text="콤보 기록 (문자열)")
    isFullCombo = models.BooleanField(default=False, help_text="풀콤보 여부")
    isAllPerfect = models.BooleanField(default=False, help_text="올 퍼펙트 여부")
    earlyCount = models.IntegerField(default=0, help_text="빠르게 친 판정 수")
    lateCount = models.IntegerField(default=0, help_text="느리게 친 판정 수")
    perfect = models.IntegerField(default=0, help_text="퍼펙트 판정 수")
    great = models.IntegerField(default=0, help_text="그레이트 판정 수")
    good = models.IntegerField(default=0, help_text="굿 판정 수")
    miss = models.IntegerField(default=0, help_text="미스 판정 수")
    bad = models.IntegerField(default=0, help_text="배드 판정 수")
    playedAt = models.DateTimeField(auto_now_add=True, help_text="플레이 시간")

    def __str__(self):
        return f"{self.user.nickname} - {self.score} on {self.chart.title} at {self.playedAt}"
