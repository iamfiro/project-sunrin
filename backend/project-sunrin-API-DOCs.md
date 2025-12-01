모든 요청과 응답은 JSON 형식입니다.

---

## 인증 (`/auth/`)

---

### `POST /auth/register` — 회원가입

새로운 사용자를 등록합니다.

#### 요청

```json
{
  "nickname": "string",
  "email": "user@example.com",
  "password": "string(min: 8)",
  "password_confirm": "string"
}
```

#### 응답 (201 CREATED)

```json
{
  "message": "회원가입이 완료되었습니다.",
  "user": {
    "id": "integer",
    "nickname": "string",
    "email": "user@example.com"
  }
}
```

---

### `POST /auth/login` — 로그인

로그인하여 JWT 토큰을 발급받습니다.

#### 요청

```json
{
  "nickname": "string",
  "password": "string"
}
```

#### 응답 (200 OK)

```json
{
  "message": "로그인 성공",
  "user": {
    "id": "integer",
    "nickname": "string",
    "email": "user@example.com"
  },
  "tokens": {
    "refresh": "string",
    "access": "string"
  }
}
```

---

### `GET /auth/me` — 내 정보 조회

로그인된 사용자 정보를 가져옵니다.

#### 요청 헤더

```
Authorization: Bearer <access_token>
```

#### 응답 (200 OK)

```json
{
  "id": "integer",
  "nickname": "string",
  "email": "user@example.com"
}
```

---

## 차트 (`/charts/`)

> 모든 엔드포인트는 인증이 필요합니다.
> `Authorization: Bearer <access_token>`

---

### `GET /charts/` — 차트 리스트 조회

#### 응답 (200 OK)

```json
[
  {
    "id": "integer",
    "musicId": "string (uuid)",
    "title": "string",
    "artist": "string",
    "genre": "string",
    "bpm": "integer",
    "difficulty": "integer",
    "level": "integer",
    "song": "string (mp3 URL)",
    "coverUrl": "string",
    "backgroundVideo": "string",
    "isCommunitySong": "boolean",
    "creator": "integer",
    "notes": [
      {
        "id": "integer",
        "time": "number",
        "type": "string",
        "lane": "integer",
        "chart": "integer"
      }
    ],
    "ranks": [
      {
        "username": "string",
        "score": "integer"
      }
    ]
  }
]
```

---

### `POST /charts/` — 차트 생성

`multipart/form-data` 요청.

#### 요청 (form-data)

* `title`: string
* `artist`: string
* `difficulty`: integer
* `song`: 파일(mp3, wav)
* `notes`: string(JSON 문자열)

#### 응답 (201 CREATED)

* 생성된 차트 전체 객체 반환

---

### `GET /charts/<musicId>/` — 차트 상세 조회

#### 응답 (200 OK)

* 단일 차트 객체 반환

---

### `PUT /charts/<musicId>/`

### `PATCH /charts/<musicId>/` — 차트 수정

* 요청 필드는 `POST /charts/` 와 동일
* 응답 (200 OK): 수정된 차트 객체

---

### `DELETE /charts/<musicId>/` — 차트 삭제

#### 응답

`204 NO CONTENT`

---

## 게임 결과 (`/results/`)

---

### `POST /results/` — 게임 결과 저장

#### 요청 헤더

```
Authorization: Bearer <access_token>
```

#### 요청

```json
{
  "musicId": "string",
  "score": "integer",
  "perfect": "integer",
  "great": "integer",
  "good": "integer",
  "miss": "integer",
  "maxCombo": "integer"
}
```

#### 응답 (201 CREATED)

```json
{
  "id": "integer",
  "username": "string",
  "musicId": "string",
  "title": "string",
  "playedAt": "string",
  "score": "integer",
  "perfect": "integer",
  "great": "integer",
  "good": "integer",
  "miss": "integer",
  "maxCombo": "integer",
  "user": "integer",
  "chart": "integer"
}
```

---

### `GET /results/user/<userId>/` — 특정 사용자의 플레이 기록

#### 응답 (200 OK)

* 결과 리스트

---

### `GET /results/chart/<musicId>/` — 특정 차트의 플레이 기록

#### 응답 (200 OK)

* 결과 리스트

---

## 리더보드 (`/leaderboard/`)

---

### `GET /leaderboard/<musicId>/` — 상위 10명 랭킹

#### 응답 (200 OK)

```json
[
  {
    "username": "string",
    "score": "integer"
  }
]
```
