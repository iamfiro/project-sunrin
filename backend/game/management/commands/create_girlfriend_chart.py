"""
girlfriend.mp4 차트 생성 스크립트
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from game.models import Chart, Note
from ulid import ULID
import json
import os
from django.conf import settings

User = get_user_model()

class Command(BaseCommand):
    help = 'girlfriend.mp4 영상에 대한 차트와 노트를 생성합니다.'

    def handle(self, *args, **options):
        # 관리자 계정 가져오기 (없으면 첫 번째 유저)
        try:
            creator = User.objects.first()
            if not creator:
                self.stdout.write(self.style.ERROR('유저가 없습니다. 먼저 유저를 생성해주세요.'))
                return
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'유저 조회 중 오류: {e}'))
            return

        # 이미 girlfriend 차트가 있는지 확인
        existing = Chart.objects.filter(title='Girlfriend').first()
        if existing:
            self.stdout.write(self.style.WARNING(f'이미 Girlfriend 차트가 존재합니다. (ID: {existing.musicId})'))
            # 기존 차트 삭제 여부 확인
            confirm = input('기존 차트를 삭제하고 다시 생성하시겠습니까? (y/N): ')
            if confirm.lower() == 'y':
                existing.delete()
                self.stdout.write(self.style.SUCCESS('기존 차트가 삭제되었습니다.'))
            else:
                return

        # 노트 JSON 파일 로드
        notes_json_path = os.path.join(settings.MEDIA_ROOT, 'girlfriend_notes.json')
        
        if not os.path.exists(notes_json_path):
            self.stdout.write(self.style.ERROR(f'노트 JSON 파일이 없습니다: {notes_json_path}'))
            return
        
        with open(notes_json_path, 'r') as f:
            data = json.load(f)

        bpm = data['bpm']
        notes_data = data['notes']

        self.stdout.write(f'BPM: {bpm}')
        self.stdout.write(f'총 노트 수: {len(notes_data)}')

        # 차트 생성
        music_id = str(ULID())
        
        chart = Chart.objects.create(
            musicId=music_id,
            title='Girlfriend',
            artist='Unknown Artist',
            song='/media/songs/girlfriend.mp4',
            backgroundVideo='/media/video/girlfriend.mp4',
            coverUrl='/media/covers/girlfriend.jpg',
            isCommunitySong=False,
            bpm=bpm,
            difficulty=10,  # 중상 난이도
            creator=creator
        )

        self.stdout.write(self.style.SUCCESS(f'차트 생성 완료: {chart.musicId}'))

        # 노트 생성
        notes_to_create = []
        for note_data in notes_data:
            notes_to_create.append(Note(
                chart=chart,
                time=note_data['time'],
                lane=note_data['lane'],
                type=note_data['type'],
                duration=note_data.get('duration')
            ))

        # bulk_create로 한번에 생성
        Note.objects.bulk_create(notes_to_create)

        self.stdout.write(self.style.SUCCESS(f'노트 {len(notes_to_create)}개 생성 완료!'))
        
        # 커버 이미지 생성 (비디오 첫 프레임)
        try:
            import cv2
            video_path = os.path.join(settings.MEDIA_ROOT, 'video', 'girlfriend.mp4')
            cover_path = os.path.join(settings.MEDIA_ROOT, 'covers', 'girlfriend.jpg')
            
            os.makedirs(os.path.dirname(cover_path), exist_ok=True)
            
            cap = cv2.VideoCapture(video_path)
            ret, frame = cap.read()
            if ret:
                cv2.imwrite(cover_path, frame)
                self.stdout.write(self.style.SUCCESS('커버 이미지 생성 완료'))
            cap.release()
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'커버 이미지 생성 실패: {e}'))

        # 결과 출력
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('Girlfriend 차트 생성 완료!'))
        self.stdout.write(f'  Music ID: {chart.musicId}')
        self.stdout.write(f'  Title: {chart.title}')
        self.stdout.write(f'  Artist: {chart.artist}')
        self.stdout.write(f'  BPM: {chart.bpm}')
        self.stdout.write(f'  Difficulty: {chart.difficulty}')
        self.stdout.write(f'  Notes: {len(notes_to_create)}개')
        self.stdout.write('='*50)
