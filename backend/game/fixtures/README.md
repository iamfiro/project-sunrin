# 목데이터 생성 가이드

이 디렉토리는 게임 앱의 목데이터를 관리합니다.

## 사전 준비

### 1. 미디어 파일 준비
백그라운드 비디오 파일을 준비해주세요:
```
backend/media/video/background.mp4
```

실제 비디오 파일이 없다면, 테스트용 더미 파일을 생성할 수 있습니다:
```bash
# 디렉토리가 없으면 생성
mkdir -p backend/media/video

# 더미 비디오 파일 생성 (ffmpeg 필요)
ffmpeg -f lavfi -i color=c=blue:s=1280x720:d=10 -vf "drawtext=text='Test Background Video':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2" backend/media/video/background.mp4
```

### 2. 사용자 생성
목데이터를 생성하기 전에 최소 1명의 사용자가 필요합니다:
```bash
cd backend
python manage.py createsuperuser
```

## Management Command 사용법

### 기본 사용
```bash
cd backend
python manage.py create_mock_data
```

### 기존 데이터 삭제하고 새로 생성
```bash
python manage.py create_mock_data --clear
```

## 생성되는 데이터

- **차트 (Chart)**: 6개의 곡 (일반 곡 5개, 커뮤니티 곡 1개)
  - 모든 곡은 `/media/video/background.mp4` 비디오 사용
  - 난이도: 5 ~ 15
  - 각 차트마다 50~150개의 노트 자동 생성
  
- **노트 (Note)**: 각 차트당 50~150개
  - Tap 노트와 Hold 노트 랜덤 배치
  - 난이도에 따라 밀도 조정
  
- **랭킹 (Rank)**: 각 차트당 3~5명의 랭킹
  - 난이도에 따른 점수 범위 자동 조정
  
- **결과 (Result)**: 각 사용자당 5~15개의 플레이 결과
  - 점수, 정확도, 판정 수 등 현실적인 데이터
  - 랭크 자동 계산 (F, D, C, B, A, S, SS)

## 미디어 파일 접근

목데이터가 생성되면 다음 URL로 비디오에 접근할 수 있습니다:
```
http://localhost:8000/media/video/background.mp4
```

프론트엔드에서 사용 예시:
```html
<video src="http://localhost:8000/media/video/background.mp4" />
```

또는 API 응답에서 받은 `backgroundVideo` 필드를 그대로 사용:
```javascript
// API 응답: { backgroundVideo: "/media/video/background.mp4" }
<video src={`http://localhost:8000${chart.backgroundVideo}`} />
```

## 주의사항

- `--clear` 옵션은 모든 게임 관련 데이터를 삭제합니다 (사용자는 유지)
- 프로덕션 환경에서는 사용하지 마세요
- Django의 미디어 파일 제공은 개발 환경에서만 동작합니다 (settings.DEBUG=True)
- 프로덕션에서는 nginx나 S3 같은 별도의 파일 서버가 필요합니다

## 트러블슈팅

### 비디오가 로드되지 않는 경우
1. `backend/media/video/background.mp4` 파일이 존재하는지 확인
2. Django 서버가 실행 중인지 확인
3. CORS 설정이 올바른지 확인 (settings.py의 CORS_ALLOWED_ORIGINS)
4. 브라우저 개발자 도구의 Network 탭에서 에러 확인

### 사용자가 없다는 에러
```bash
python manage.py createsuperuser
```
명령으로 사용자를 먼저 생성해주세요.

## 커스터마이징

`create_mock_data.py` 파일을 수정하여:
- 곡 정보 변경
- 노트 패턴 조정
- 점수 범위 변경

등을 할 수 있습니다.
