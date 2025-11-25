from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Chart, Result, Rank
from .serializers import ChartSerializer, ResultSerializer, RankSerializer

class ChartViewSet(viewsets.ReadOnlyModelViewSet):
    """차트 조회 뷰셋"""
    queryset = Chart.objects.all()
    serializer_class = ChartSerializer

    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        """특정 차트의 결과 조회"""
        chart = self.get_object()
        results = Result.objects.filter(chart=chart).order_by('-score')
        serializer = ResultSerializer(results, many=True)
        return Response(serializer.data)

class ResultViewSet(viewsets.ModelViewSet):
    """결과 CRUD 뷰셋"""
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Result.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        chart = get_object_or_404(Chart, musicId=self.request.data.get('musicId'))
        serializer.save(user=self.request.user, chart=chart)

        # 랭킹 업데이트
        rank, created = Rank.objects.get_or_create(
            user=self.request.user,
            chart=chart,
            defaults={'score': serializer.validated_data['score']}
        )
        if not created and serializer.validated_data['score'] > rank.score:
            rank.score = serializer.validated_data['score']
            rank.save()

class RankViewSet(viewsets.ReadOnlyModelViewSet):
    """랭킹 조회 뷰셋"""
    queryset = Rank.objects.all()
    serializer_class = RankSerializer

    def get_queryset(self):
        chart_id = self.request.query_params.get('chart')
        if chart_id:
            return Rank.objects.filter(chart_id=chart_id).order_by('-score')
        return Rank.objects.none()
