from rest_framework import serializers
from .models import Note, Chart, Rank, Result
from ulid import ULID
import cv2
from django.core.files.base import ContentFile
from django.conf import settings
import os
import json

class NoteSerializer(serializers.ModelSerializer):
    """노트 시리얼라이저"""
    class Meta:
        model = Note
        fields = '__all__'

class ChartSerializer(serializers.ModelSerializer):
    """차트 시리얼라이저"""
    notes = NoteSerializer(many=True, read_only=True)
    ranks = serializers.SerializerMethodField()
    userBestRecord = serializers.SerializerMethodField()
    musicFile = serializers.FileField(write_only=True)
    coverFile = serializers.ImageField(write_only=True, required=False, allow_null=True)
    notes_data = serializers.CharField(write_only=True)

    class Meta:
        model = Chart
        fields = (
            'musicId', 'title', 'song', 'backgroundVideo', 'coverUrl', 
            'isCommunitySong', 'artist', 'bpm', 'difficulty', 'creator',
            'notes', 'ranks', 'userBestRecord', 'musicFile', 'coverFile', 'notes_data'
        )
        read_only_fields = ('musicId', 'song', 'backgroundVideo', 'coverUrl', 'creator', 'isCommunitySong')

    def get_ranks(self, obj):
        ranks = obj.ranks.order_by('-score')[:10]
        return RankSerializer(ranks, many=True, context=self.context).data
    
    def get_userBestRecord(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        
        best_result = Result.objects.filter(
            chart=obj,
            user=request.user
        ).order_by('-score').first()
        
        if best_result:
            return {
                'accuracy': best_result.accuracy,
                'combo': best_result.combo,
                'score': best_result.score,
                'rank': best_result.rank,
                'isFullCombo': best_result.isFullCombo,
                'isAllPerfect': best_result.isAllPerfect,
            }
        return None

    def create(self, validated_data):
        import posixpath
        request = self.context['request']
        music_file = validated_data.pop('musicFile')
        cover_file = validated_data.pop('coverFile', None)
        notes_data_str = validated_data.pop('notes_data')
        
        music_id = str(ULID())
        file_name = f'{music_id}.mp4'
        
        # --- Song File ---
        song_os_path = os.path.join(settings.MEDIA_ROOT, 'songs', file_name)
        song_db_path = posixpath.join(settings.MEDIA_URL, 'songs', file_name)
        
        os.makedirs(os.path.dirname(song_os_path), exist_ok=True)
        with open(song_os_path, 'wb+') as f:
            for chunk in music_file.chunks():
                f.write(chunk)

        # --- Video File ---
        # Using the same file for song and video, just different DB path based on model
        video_os_path = os.path.join(settings.MEDIA_ROOT, 'video', file_name)
        video_db_path = posixpath.join(settings.MEDIA_URL, 'video', file_name)
        
        os.makedirs(os.path.dirname(video_os_path), exist_ok=True)
        with open(video_os_path, 'wb+') as f:
            music_file.seek(0)
            for chunk in music_file.chunks():
                f.write(chunk)

        # --- Cover Image ---
        cover_db_path = ''
        
        # 커버 파일이 업로드된 경우 사용
        if cover_file:
            # 파일 확장자 추출
            original_ext = os.path.splitext(cover_file.name)[1].lower()
            if original_ext not in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
                original_ext = '.jpg'
            cover_filename = f'{music_id}{original_ext}'
            cover_os_path = os.path.join(settings.MEDIA_ROOT, 'covers', cover_filename)
            cover_db_path = posixpath.join(settings.MEDIA_URL, 'covers', cover_filename)
            os.makedirs(os.path.dirname(cover_os_path), exist_ok=True)
            with open(cover_os_path, 'wb+') as f:
                for chunk in cover_file.chunks():
                    f.write(chunk)
        else:
            # 커버 파일이 없으면 비디오에서 첫 프레임 추출
            temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp')
            os.makedirs(temp_dir, exist_ok=True)
            temp_video_path = os.path.join(temp_dir, file_name)
            
            music_file.seek(0)
            with open(temp_video_path, 'wb+') as f:
                for chunk in music_file.chunks():
                    f.write(chunk)
            
            cap = cv2.VideoCapture(temp_video_path)
            ret, frame = cap.read()
            if ret:
                cover_filename = f'{music_id}.jpg'
                cover_os_path = os.path.join(settings.MEDIA_ROOT, 'covers', cover_filename)
                cover_db_path = posixpath.join(settings.MEDIA_URL, 'covers', cover_filename)
                os.makedirs(os.path.dirname(cover_os_path), exist_ok=True)
                cv2.imwrite(cover_os_path, frame)
            else:
                # If frame extraction fails, use a default cover
                cover_db_path = posixpath.join(settings.MEDIA_URL, 'covers', 'bochi.jpg')
            cap.release()
            os.remove(temp_video_path)

        chart = Chart.objects.create(
            musicId=music_id,
            song=song_db_path,
            backgroundVideo=video_db_path,
            coverUrl=cover_db_path,
            creator=request.user,
            isCommunitySong=True,
            **validated_data
        )

        if notes_data_str:
            notes_data = json.loads(notes_data_str)
            for note_data in notes_data:
                Note.objects.create(chart=chart, **note_data)
        
        return chart

    def update(self, instance, validated_data):
        # This part needs to be updated if chart editing is implemented
        return super().update(instance, validated_data)

class RankUserSerializer(serializers.Serializer):
    """랭킹에 포함될 유저 정보 시리얼라이저"""
    id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.nickname', read_only=True)
    profileImage = serializers.SerializerMethodField()

    def get_profileImage(self, obj):
        if obj.user.profileImage:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.user.profileImage.url)
            return obj.user.profileImage.url
        return None

class RankSerializer(serializers.ModelSerializer):
    """랭킹 시리얼라이저"""
    user = RankUserSerializer(source='*', read_only=True)

    class Meta:
        model = Rank
        fields = ('user', 'score')

class ResultSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.nickname', read_only=True)
    title = serializers.CharField(source='chart.title', read_only=True)

    class Meta:
        model = Result
        fields = '__all__'
        read_only_fields = ('user', 'chart', 'playedAt')

class CreateResultSerializer(serializers.Serializer):
    musicId = serializers.CharField()
    score = serializers.IntegerField()
    accuracy = serializers.FloatField()
    combo = serializers.CharField()
    rank = serializers.CharField()
    isFullCombo = serializers.BooleanField()
    isAllPerfect = serializers.BooleanField()
    perfect = serializers.IntegerField(default=0)
    great = serializers.IntegerField(default=0)
    good = serializers.IntegerField(default=0)
    miss = serializers.IntegerField(default=0)
    bad = serializers.IntegerField(default=0)
    earlyCount = serializers.IntegerField(default=0)
    lateCount = serializers.IntegerField(default=0)