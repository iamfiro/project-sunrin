from rest_framework import serializers
from .models import Note, Chart, Rank, Result

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

    class Meta:
        model = Chart
        fields = '__all__'

    def get_ranks(self, obj):
        ranks = obj.ranks.order_by('-score')[:10]  # 상위 10개 랭킹
        return RankSerializer(ranks, many=True, context=self.context).data
    
    def get_userBestRecord(self, obj):
        """현재 로그인한 사용자의 베스트 기록"""
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
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
        # notes는 request.data에서 직접 가져옴 (read_only 필드이므로)
        request = self.context.get('request')
        notes_data = request.data.get('notes', []) if request else []
        
        chart = Chart.objects.create(**validated_data)
        for note_data in notes_data:
            Note.objects.create(chart=chart, **note_data)
        return chart

    def update(self, instance, validated_data):
        # notes는 request.data에서 직접 가져옴 (read_only 필드이므로)
        request = self.context.get('request')
        notes_data = request.data.get('notes', []) if request else []
        
        instance = super().update(instance, validated_data)
        if notes_data:
            # 기존 노트 삭제 후 새로 생성 (단순화)
            instance.notes.all().delete()
            for note_data in notes_data:
                Note.objects.create(chart=instance, **note_data)
        return instance

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