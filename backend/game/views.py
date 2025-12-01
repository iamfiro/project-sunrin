from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Chart, Result, Rank
from .serializers import ChartSerializer, ResultSerializer, RankSerializer, CreateResultSerializer

class ChartViewSet(viewsets.ModelViewSet):
    """차트 CRUD 뷰셋"""
    queryset = Chart.objects.all()
    serializer_class = ChartSerializer
    lookup_field = 'musicId'
    permission_classes = [IsAuthenticated]

    def create(self, request, musicId=None):
        """차트 생성 - URL의 musicId 사용"""
        if musicId:
            data = request.data.copy()
            data['musicId'] = musicId
            serializer = self.get_serializer(data=data)
        else:
            serializer = self.get_serializer(data=request.data)
        
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        serializer.save()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_result(request):
    serializer = CreateResultSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    chart = get_object_or_404(Chart, musicId=data['musicId'])

    result = Result.objects.create(
        user=request.user,
        chart=chart,
        musicId=data['musicId'],
        difficulty=chart.difficulty,
        score=data['score'],
        accuracy=data['accuracy'],
        combo=data['combo'],
        rank=data['rank'],
        isFullCombo=data['isFullCombo'],
        isAllPerfect=data['isAllPerfect'],
        perfect=data.get('perfect', 0),
        great=data.get('great', 0),
        good=data.get('good', 0),
        miss=data.get('miss', 0),
        bad=data.get('bad', 0),
        earlyCount=data.get('earlyCount', 0),
        lateCount=data.get('lateCount', 0),
    )

    rank, created = Rank.objects.get_or_create(
        user=request.user,
        chart=chart,
        defaults={'score': result.score}
    )
    if not created and result.score > rank.score:
        rank.score = result.score
        rank.save()

    return Response(ResultSerializer(result).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def leaderboard(request, musicId):
    """곡별 리더보드 조회"""
    chart = get_object_or_404(Chart, musicId=musicId)
    ranks = Rank.objects.filter(chart=chart).order_by('-score')[:10]
    serializer = RankSerializer(ranks, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def user_results(request, userId):
    """특정 유저 결과 조회"""
    results = Result.objects.filter(user_id=userId).order_by('-playedAt')
    serializer = ResultSerializer(results, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def chart_results(request, musicId):
    """특정 곡 결과 조회"""
    chart = get_object_or_404(Chart, musicId=musicId)
    results = Result.objects.filter(chart=chart).order_by('-score')
    serializer = ResultSerializer(results, many=True)
    return Response(serializer.data)
