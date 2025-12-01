from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from game.models import Chart, Note, Rank, Result
from datetime import datetime, timedelta
import random

User = get_user_model()

class Command(BaseCommand):
    help = '게임 목데이터를 생성합니다'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='기존 데이터를 모두 삭제하고 새로 생성합니다',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('기존 데이터를 삭제합니다...')
            Result.objects.all().delete()
            Rank.objects.all().delete()
            Note.objects.all().delete()
            Chart.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('기존 데이터 삭제 완료'))

        # 기존 사용자 가져오기 (최소 1명 필요)
        self.stdout.write('기존 사용자를 확인합니다...')
        users = list(User.objects.all())
        
        if not users:
            self.stdout.write(self.style.ERROR('❌ 사용자가 없습니다. 먼저 사용자를 생성해주세요.'))
            self.stdout.write('   python manage.py createsuperuser')
            return
        
        self.stdout.write(f'  ✓ {len(users)}명의 사용자를 찾았습니다.')
        for user in users:
            self.stdout.write(f'    - {user.nickname if hasattr(user, "nickname") else user.username}')

        # 차트 생성
        self.stdout.write('\n차트를 생성합니다...')
        charts_data = [
            {
                'musicId': 'SONG001',
                'title': '애인을 내려주세요',
                'artist': 'Warak',
                'bpm': 146,
                'difficulty': 5,
                'song': '/media/songs/electric_dreams.mp3',
                'backgroundVideo': '/media/video/girlfriend.mp4',
                'coverUrl': '/media/covers/girlfriend.jpg',
                'isCommunitySong': False,
            },
            {
                'musicId': 'SONG002',
                'title': 'Tainted Reminiscence',
                'artist': 'takehirotei',
                'bpm': 238,
                'difficulty': 5,
                'song': '/media/songs/electric_dreams.mp3',
                'backgroundVideo': '/media/video/Tainted Reminiscence.mp4',
                'coverUrl': '/media/covers/Tainted Reminiscence.jpg',
                'isCommunitySong': False,
            },
            {
                'musicId': 'SONG003',
                'title': 'Sincerely, Maya',
                'artist': 'takehirotei',
                'bpm': 304,
                'difficulty': 5,
                'song': '/media/songs/electric_dreams.mp3',
                'backgroundVideo': '/media/video/Sincerely, Maya.mp4',
                'coverUrl': '/media/covers/Sincerely, Maya.jpg',
                'isCommunitySong': False,
            },
            {
                'musicId': 'SONG004',
                'title': 'In Resolve',
                'artist': 'Daru',
                'bpm': 146,
                'difficulty': 5,
                'song': '/media/songs/electric_dreams.mp3',
                'backgroundVideo': '/media/video/In Resolve.mp4',
                'coverUrl': '/media/covers/In Resolve.jpg',
                'isCommunitySong': False,
            },
            {
                'musicId': 'SONG005',
                'title': 'ROSEPHILIA',
                'artist': 'Daru',
                'bpm': 146,
                'difficulty': 5,
                'song': '/media/songs/electric_dreams.mp3',
                'backgroundVideo': '/media/video/ROSEPHILIA.mp4',
                'coverUrl': '/media/covers/ROSEPHILIA.jpeg',
                'isCommunitySong': False,
            },
            {
                'musicId': 'SONG006',
                'title': 'continuous',
                'artist': '황동화',
                'bpm': 122,
                'difficulty': 5,
                'song': '/media/songs/electric_dreams.mp3',
                'backgroundVideo': '/media/video/continuous.mp4',
                'coverUrl': '/media/covers/continuous.jpg',
                'isCommunitySong': False,
            }
        ]

        charts = []
        for idx, chart_data in enumerate(charts_data):
            creator = users[idx % len(users)]
            chart, created = Chart.objects.get_or_create(
                musicId=chart_data['musicId'],
                defaults={
                    **chart_data,
                    'creator': creator
                }
            )
            if created:
                self.stdout.write(f'  ✓ {chart.title} - {chart.artist} (난이도: {chart.difficulty})')
            else:
                self.stdout.write(f'  - {chart.title} 이미 존재')
            charts.append(chart)

        # 노트 생성 (각 차트마다 다양한 패턴)
        self.stdout.write('\n노트를 생성합니다...')
        for chart in charts:
            note_count = random.randint(50, 150)  # 차트당 50~150개의 노트
            lanes = 4  # 4개의 레인
            
            # 난이도에 따라 노트 밀도 조정
            time_interval = max(200, 1000 - (chart.difficulty * 50))
            
            for i in range(note_count):
                time = i * time_interval + random.randint(-50, 50)
                lane = random.randint(0, lanes - 1)
                note_type = random.choices(['tap', 'hold'], weights=[0.8, 0.2])[0]
                duration = random.randint(300, 1000) if note_type == 'hold' else None
                
                Note.objects.create(
                    chart=chart,
                    time=time,
                    lane=lane,
                    type=note_type,
                    duration=duration
                )
            
            self.stdout.write(f'  ✓ {chart.title}: {note_count}개의 노트 생성')

        # 랭킹 생성
        self.stdout.write('\n랭킹을 생성합니다...')
        for chart in charts:
            # 각 차트에 여러 사용자의 랭킹 생성
            for user in random.sample(users, k=min(len(users), random.randint(3, 5))):
                base_score = 900000 - (chart.difficulty * 10000)
                score = base_score + random.randint(0, 100000)
                
                Rank.objects.get_or_create(
                    chart=chart,
                    user=user,
                    defaults={'score': score}
                )
            
            rank_count = Rank.objects.filter(chart=chart).count()
            self.stdout.write(f'  ✓ {chart.title}: {rank_count}명의 랭킹')

        # 게임 결과 생성
        self.stdout.write('\n게임 결과를 생성합니다...')
        rank_choices = ['F', 'D', 'C', 'B', 'A', 'S', 'SS']
        
        for user in users:
            # 각 사용자당 여러 개의 플레이 결과
            play_count = random.randint(5, 15)
            for _ in range(play_count):
                chart = random.choice(charts)
                
                # 난이도에 따라 점수 범위 조정
                difficulty_factor = chart.difficulty / 15
                base_score = 800000 - int(difficulty_factor * 200000)
                score = base_score + random.randint(0, 200000)
                
                # 점수에 따른 랭크 결정
                if score >= 990000:
                    rank = 'SS'
                elif score >= 950000:
                    rank = 'S'
                elif score >= 900000:
                    rank = 'A'
                elif score >= 850000:
                    rank = 'B'
                elif score >= 800000:
                    rank = 'C'
                elif score >= 750000:
                    rank = 'D'
                else:
                    rank = 'F'
                
                # 판정 수 생성
                total_notes = Note.objects.filter(chart=chart).count()
                perfect = int(total_notes * random.uniform(0.6, 0.95))
                great = int((total_notes - perfect) * random.uniform(0.5, 0.8))
                good = int((total_notes - perfect - great) * random.uniform(0.3, 0.7))
                miss = total_notes - perfect - great - good
                bad = random.randint(0, 5)
                
                accuracy = (perfect * 100 + great * 70 + good * 40) / (total_notes * 100) * 100
                
                is_full_combo = miss == 0
                is_all_perfect = perfect == total_notes
                
                # 콤보 기록 (간단한 형태)
                combo_list = []
                current_combo = 0
                for _ in range(total_notes):
                    if random.random() > (miss / total_notes):
                        current_combo += 1
                    else:
                        combo_list.append(current_combo)
                        current_combo = 0
                combo_list.append(current_combo)
                combo = ','.join(map(str, combo_list[:10]))  # 처음 10개만
                
                early_count = random.randint(0, total_notes // 4)
                late_count = total_notes - perfect - great - good - miss - early_count
                
                Result.objects.create(
                    musicId=chart.musicId,
                    user=user,
                    chart=chart,
                    difficulty=chart.difficulty,
                    score=score,
                    accuracy=round(accuracy, 2),
                    rank=rank,
                    combo=combo,
                    isFullCombo=is_full_combo,
                    isAllPerfect=is_all_perfect,
                    earlyCount=early_count,
                    lateCount=late_count,
                    perfect=perfect,
                    great=great,
                    good=good,
                    miss=miss,
                    bad=bad,
                )
        
        total_results = Result.objects.count()
        self.stdout.write(f'  ✓ 총 {total_results}개의 게임 결과 생성')

        # 요약 정보 출력
        self.stdout.write(self.style.SUCCESS('\n✅ 목데이터 생성 완료!'))
        self.stdout.write(f'   - 차트: {Chart.objects.count()}개')
        self.stdout.write(f'   - 노트: {Note.objects.count()}개')
        self.stdout.write(f'   - 랭킹: {Rank.objects.count()}개')
        self.stdout.write(f'   - 결과: {Result.objects.count()}개')
        
        self.stdout.write('\n사용 정보:')
        self.stdout.write(f'  백그라운드 비디오: /media/video/background.mp4')
        self.stdout.write(f'  실제 파일 위치: backend/media/video/background.mp4')
