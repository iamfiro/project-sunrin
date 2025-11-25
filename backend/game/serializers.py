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

    class Meta:
        model = Chart
        fields = '__all__'

    def get_ranks(self, obj):
        ranks = obj.ranks.order_by('-score')[:10]  # 상위 10개 랭킹
        return RankSerializer(ranks, many=True).data

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