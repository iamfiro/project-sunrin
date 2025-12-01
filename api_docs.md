# Project Sunrin API 문서

이 문서는 Project Sunrin 백엔드의 API 엔드포인트에 대한 상세 정보를 제공합니다.

## 인증 (Authentication)

기본 경로(Base Path): `/auth`

모든 인증 관련 엔드포인트는 이 경로 아래에 있습니다.

---

### 1. 회원가입

* **엔드포인트:** `POST /auth/register`
* **설명:** 새로운 사용자 계정을 생성합니다.
* **권한:** `AllowAny` (인증 불필요)
* **요청 바디:** `application/json`

| 필드                 | 타입     | 설명               | 필수 |
| :----------------- | :----- | :--------------- | :- |
| `nickname`         | string | 원하는 닉네임. 고유해야 함. | 예  |
| `email`            | string | 이메일 주소           | 예  |
| `password`         | string | 비밀번호 (최소 8자)     | 예  |
| `password_confirm` | string | 비밀번호 재입력         | 예  |

* **성공 응답 (201 Created):**

```json
{
  "message": "회원가입이 완료되었습니다.",
  "user": {
    "id": 1,
    "nickname": "testuser"
  }
}
```

* **오류 응답 (400 Bad Request):**

```json
{
  "nickname": ["이미 해당 닉네임을 가진 사용자가 존재합니다."],
  "password": ["비밀번호는 최소 8자 이상이어야 합니다."]
}
```

---

### 2. 로그인

* **엔드포인트:** `POST /auth/login`
* **설명:** 로그인 후 JWT 토큰을 httpOnly 쿠키로 설정합니다.
* **권한:** `AllowAny`
* **요청 바디:** `application/json`

| 필드         | 타입     | 설명      | 필수 |
| :--------- | :----- | :------ | :- |
| `nickname` | string | 사용자 닉네임 | 예  |
| `password` | string | 비밀번호    | 예  |

* **성공 응답 (200 OK):**

  * `access_token`, `refresh_token`이 httpOnly 쿠키에 저장됨
  * 응답 예시:

```json
{
  "message": "로그인 성공",
  "user": {
    "id": 1,
    "nickname": "testuser",
    "email": "test@example.com",
    "stats": {
      "perfectCount": 100,
      "highestScore": 980000
    }
  }
}
```

---

### 3. 현재 로그인된 사용자 정보 가져오기

* **엔드포인트:** `GET /auth/me`
* **설명:** 현재 인증된 사용자 정보를 반환합니다.
* **권한:** `IsAuthenticated`
* **성공 응답 (200 OK):**

```json
{
  "user": {
    "id": 1,
    "nickname": "testuser",
    "email": "test@example.com",
    "stats": {
      "perfectCount": 100,
      "highestScore": 980000
    }
  }
}
```

---

### 4. 로그아웃

* **엔드포인트:** `POST /auth/logout`
* **설명:** JWT 쿠키를 삭제하여 로그아웃합니다.
* **권한:** `AllowAny`
* **성공 응답 (200 OK):**

```json
{
  "message": "로그아웃 성공"
}
```

---

## 채보 (Charts)

기본 경로(Base Path): `/charts`

게임 채보 생성, 조회, 수정, 삭제 관련 API입니다.

---

### 1. 채보 목록 조회

* **엔드포인트:** `GET /charts/`
* **설명:** 모든 채보 리스트를 가져옵니다.
* **권한:** `IsAuthenticated`
* **성공 응답 (200 OK):**

  * 채보 객체 배열 반환

```json
[
  {
    "musicId": "01J5Z...",
    "title": "My Awesome Song",
    "song": "/media/songs/01J5Z...mp4",
    "backgroundVideo": "/media/video/01J5Z...mp4",
    "coverUrl": "/media/covers/01J5Z...jpg",
    "isCommunitySong": true,
    "artist": "DJ Dev",
    "bpm": 150,
    "difficulty": 12,
    "creator": 1,
    "notes": [
        {
            "id": 1,
            "chart": 1,
            "time": 1000,
            "lane": 2,
            "type": "tap",
            "duration": null
        }
    ],
    "ranks": [
        {
            "user": {
                "id": 1,
                "username": "player1",
                "profileImage": "/media/pfp/default.png"
            },
            "score": 990000
        }
    ],
    "userBestRecord": {
      "accuracy": 99.5,
      "combo": "123/123",
      "score": 990000,
      "rank": "S",
      "isFullCombo": true,
      "isAllPerfect": false
    }
  }
]
```

---

### 2. 채보 생성

* **엔드포인트:** `POST /charts/`
* **설명:** 새로운 채보를 생성합니다.
* **권한:** `IsAuthenticated`
* **요청 바디:** `multipart/form-data`

| 필드           | 타입      | 설명                  | 필수 |
| :----------- | :------ | :------------------ | :- |
| `title`      | string  | 곡 제목                | 예  |
| `artist`     | string  | 아티스트 이름             | 예  |
| `bpm`        | integer | BPM                 | 예  |
| `difficulty` | integer | 난이도(1~15)           | 예  |
| `musicFile`  | file    | 오디오/영상 파일           | 예  |
| `notes_data` | string  | 노트 JSON 문자열 (id 없음) | 예  |

* **성공 응답 (201 Created):**

  * 생성된 채보 객체 반환

---

### 3. 채보 상세 조회

* **엔드포인트:** `GET /charts/{musicId}/`
* **설명:** 특정 채보의 상세 정보를 조회합니다.
* **권한:** `IsAuthenticated`
* **성공 응답:** 채보 객체 반환

---

## 결과 & 리더보드 (Results & Leaderboards)

### 1. 결과 제출

* **엔드포인트:** `POST /results/`
* **설명:** 플레이 결과를 서버에 저장합니다.
* **권한:** `IsAuthenticated`
* **요청 바디:** `application/json`

| 필드             | 타입      | 설명                |
| :------------- | :------ | :---------------- |
| `musicId`      | string  | 플레이한 채보 ID        |
| `score`        | integer | 최종 점수             |
| `accuracy`     | float   | 정확도(%)            |
| `combo`        | string  | 콤보 (예: "123/456") |
| `rank`         | string  | 최종 랭크 (S, A, B 등) |
| `isFullCombo`  | boolean | 풀콤 여부             |
| `isAllPerfect` | boolean | 올퍼 여부             |
| `perfect`      | integer | PERFECT 판정 수      |
| ...            | ...     | 기타 판정 수           |

---

### 2. 특정 유저의 모든 결과 조회

* **엔드포인트:** `GET /results/user/{userId}/`
* **설명:** 해당 사용자의 모든 플레이 기록을 가져옵니다.
* **성공 응답:** 결과 배열

---

### 3. 특정 채보의 모든 결과 조회

* **엔드포인트:** `GET /results/chart/{musicId}/`
* **설명:** 해당 채보의 모든 플레이 기록을 가져옵니다.
* **성공 응답:** 결과 배열

---

### 4. 리더보드 조회

* **엔드포인트:** `GET /leaderboard/{musicId}/`
* **설명:** 특정 채보의 상위 10개 점수를 반환합니다.
* **성공 응답 (200 OK):**

```json
[
    {
        "user": {
            "id": 1,
            "username": "player1",
            "profileImage": "/media/pfp/default.png"
        },
        "score": 995000
    },
    {
        "user": {
            "id": 2,
            "username": "player2",
            "profileImage": "/media/pfp/another.png"
        },
        "score": 990000
    }
]
```
