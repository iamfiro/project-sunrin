from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Chart, Result, Rank
from .serializers import ChartSerializer, ResultSerializer, RankSerializer

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
    """결과 저장"""
    serializer = ResultSerializer(data=request.data)
    if serializer.is_valid():
        chart = get_object_or_404(Chart, musicId=request.data.get('musicId'))
        result = serializer.save(user=request.user, chart=chart)

        # 랭킹 업데이트
        rank, created = Rank.objects.get_or_create(
            user=request.user,
            chart=chart,
            defaults={'score': result.score}
        )
        if not created and result.score > rank.score:
            rank.score = result.score
            rank.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
