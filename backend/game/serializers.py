from rest_framework import serializers
from .models import Note, Chart, Rank, Result

class NoteSerializer(serializers.ModelSerializer):
    """노트 시리얼라이저"""
    class Meta:
        model = Note
        fields = '__all__'

class ChartSerializer(serializers.ModelSerializer):
    """차트 시리얼라이저"""
    notes = NoteSerializer(many=True, write_only=True)
    ranks = serializers.SerializerMethodField()
    userBestRecord = serializers.SerializerMethodField()

    class Meta:
        model = Chart
        fields = '__all__'

    def get_ranks(self, obj):
        ranks = obj.ranks.order_by('-score')[:10]  # 상위 10개 랭킹
        return RankSerializer(ranks, many=True).data
    
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
        notes_data = validated_data.pop('notes')
        chart = Chart.objects.create(**validated_data)
        for note_data in notes_data:
            Note.objects.create(chart=chart, **note_data)
        return chart

    def update(self, instance, validated_data):
        notes_data = validated_data.pop('notes', [])
        instance = super().update(instance, validated_data)
        # 기존 노트 삭제 후 새로 생성 (단순화)
        instance.notes.all().delete()
        for note_data in notes_data:
            Note.objects.create(chart=instance, **note_data)
        return instance

class RankSerializer(serializers.ModelSerializer):
    """랭킹 시리얼라이저"""
    username = serializers.CharField(source='user.nickname', read_only=True)

    class Meta:
        model = Rank
        fields = ('username', 'score')

class ResultSerializer(serializers.ModelSerializer):
    """결과 시리얼라이저"""
    username = serializers.CharField(source='user.nickname', read_only=True)
    musicId = serializers.CharField(source='chart.musicId', read_only=True)
    title = serializers.CharField(source='chart.title', read_only=True)

    class Meta:
        model = Result
        fields = '__all__'