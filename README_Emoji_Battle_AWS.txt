## 📘 Emoji Battle — Браузерная многопользовательская игра

---

### 🎮 Общая идея проекта

Emoji Battle — это браузерная мультиплеерная игра, в которой игроки угадывают слова по комбинации эмодзи. Игра проходит в комнатах по 5 человек, где за ограниченное время участники стараются правильно угадать смысл эмодзи. Побеждает тот, кто наберёт больше очков по итогам всех раундов.

---

## 🔧 Технологии

* **Frontend:**

  * React + TypeScript
  * Tailwind CSS для UI
  * WebSocket (например, Socket.io) для реального времени

* **Backend:**

  * Node.js + Express
  * Socket.io
  * AWS RDS (PostgreSQL) для базы данных
  * AWS Cognito (для авторизации)

* **Deploy:**

  * AWS Amplify (Frontend)
  * AWS Elastic Beanstalk (Backend)
  * AWS RDS (Database)
  * AWS S3 для хранения изображений и аватаров

---

## 📑 Страницы и логика

### 🏠 Home (Лобби)

* Логотип игры "Emoji Battle" 🎮
* Кнопки:

  * "Играть" → создаёт или присоединяет к комнате
  * "Рейтинг" → переход на `Ranking.tsx`
* Профиль игрока:

  * Эмодзи-аватар
  * Уровень
  * Опыт (XP) и ранг
* Если игрок не авторизован → показываем "Войти через AWS Cognito"

### 🧩 Game (Комната)

* Таймер раунда (например, 20 секунд)
* Индикатор текущего раунда (из 10)
* Таблица с 5 игроками:

  * Аватар
  * Ник
  * Очки
* Центр экрана:

  * Эмодзи-комбинация (пример: 🐍📱🕹️ → "Snake Game")
  * Поле ввода
  * Кнопка "Отправить"
* Чат:

  * Отображение догадок
  * Реакции (например, 😂, 👍)
  * Сохранение сообщений в AWS RDS

### 🏆 Результаты

* Таблица:

  * Игроки по убыванию очков
  * MVP: самый точный и быстрый
  * Данные сохраняются в AWS RDS
* Кнопки:

  * "Играть снова"
  * "Выйти в лобби"

### 📊 Рейтинг

* Таблица:

  * Топ-100 игроков
  * Очки, уровень, эмодзи-аватар
  * Поиск по нику
  * Фильтры: За день / неделю / всё время
  * Хранение данных в AWS RDS

### 👤 Профиль

* Имя, аватар, опыт, уровень
* Статистика:

  * Сыграно игр
  * Побед
  * Средний результат
  * Смена аватара (эмодзи) — загрузка в S3

---

## 🌈 UI / UX

* **Стиль:** мультяшный, яркий, добрый
* **Цвета:**

  * Белый фон
  * Градиентные кнопки (фиолетовый → розовый)
* **Шрифт:** закруглённый, крупный, с высоким контрастом

---

## 🌐 Сетевые особенности

* WebSocket для комнат и игрового процесса
* Каждая комната — по 5 игроков
* Обновление сообщений, очков и раундов в реальном времени
* Использование AWS S3 для аватаров

---

## 📁 Структура проекта

```
/client
  /src
    /pages
      Home.tsx
      Game.tsx
      Profile.tsx
      Ranking.tsx
      Results.tsx
    /components
      Timer.tsx
      PlayerCard.tsx
      EmojiDisplay.tsx
      Chat.tsx
      InputBar.tsx
    /hooks
      useSocket.ts
    /utils
      emojiList.ts
  tailwind.config.js
  App.tsx
  main.tsx

/server
  index.ts
  /controllers
    gameController.ts
  /sockets
    gameSocket.ts
  /routes
    authRoutes.ts
    gameRoutes.ts
  /services
    s3Service.ts
    rdsService.ts
    authService.ts
```

--------------------------------------------------------------------------------------------


Вот перевод твоего проектного описания **"Emoji Battle"** на **корейский язык**:

---

## 📘 Emoji Battle — 브라우저 멀티플레이어 게임

---

### 🎮 프로젝트 개요

**Emoji Battle**은 이모지를 조합하여 단어를 추측하는 브라우저 기반 멀티플레이어 게임입니다. 게임은 5인 방에서 진행되며, 제한된 시간 안에 참가자들이 이모지의 의미를 맞추는 방식입니다. 라운드가 모두 끝난 후, 가장 많은 점수를 획득한 플레이어가 승리합니다.

---

## 🔧 사용 기술

* **프론트엔드:**

  * React + TypeScript
  * Tailwind CSS (UI 스타일링)
  * WebSocket (예: Socket.io, 실시간 통신)

* **백엔드:**

  * Node.js + Express
  * Socket.io
  * AWS RDS (PostgreSQL, 데이터베이스)
  * AWS Cognito (인증/로그인)

* **배포:**

  * AWS Amplify (프론트엔드)
  * AWS Elastic Beanstalk (백엔드)
  * AWS RDS (DB)
  * AWS S3 (이미지 및 아바타 저장)

---

## 📑 주요 페이지 및 로직

### 🏠 홈 (로비)

* 게임 로고 "Emoji Battle" 🎮
* 버튼:

  * "게임 시작" → 방 생성 또는 참가
  * "랭킹 보기" → `Ranking.tsx` 이동
* 플레이어 프로필:

  * 이모지 아바타
  * 레벨, 경험치 (XP), 랭크 표시
* 비로그인 상태 → "AWS Cognito로 로그인" 버튼 표시

---

### 🧩 게임 (게임 방)

* 라운드 타이머 (예: 20초)
* 현재 라운드 표시 (예: 3/10)
* 5명 플레이어 리스트:

  * 아바타
  * 닉네임
  * 점수
* 중앙 화면:

  * 이모지 조합 (예: 🐍📱🕹️ → “스네이크 게임”)
  * 정답 입력창 + "제출" 버튼
* 채팅:

  * 추측 메시지 실시간 표시
  * 반응 이모지 (😂, 👍 등)
  * 모든 메시지 AWS RDS 저장

---

### 🏆 결과 페이지

* 점수 순위표:

  * 전체 참가자 점수
  * MVP 표시 (가장 빠르고 정확한 유저)
  * 결과는 AWS RDS에 저장됨
* 버튼:

  * "다시하기"
  * "로비로 나가기"

---

### 📊 랭킹

* 상위 100명 유저 표시
* 점수, 레벨, 이모지 아바타
* 닉네임 검색 가능
* 필터: 일간 / 주간 / 전체
* 모든 데이터는 AWS RDS에 저장됨

---

### 👤 프로필

* 이름, 아바타, 경험치, 레벨
* 통계:

  * 총 게임 수
  * 승리 횟수
  * 평균 점수
  * 아바타 변경 (이모지 → S3 업로드)

---

## 🌈 UI / UX

* **스타일:** 만화 느낌, 밝고 귀엽고 따뜻한 분위기
* **색상:**

  * 흰색 배경
  * 보라색 → 분홍색 그라디언트 버튼
* **폰트:** 둥글고 큼직한 고대비 폰트

---

## 🌐 네트워크 특징

* WebSocket 사용 (실시간 방 및 게임 진행)
* 각 방은 5인 구성
* 메시지, 점수, 라운드 실시간 동기화
* 아바타 이미지는 AWS S3 사용

---

## 📁 프로젝트 구조

```
/client
  /src
    /pages
      Home.tsx
      Game.tsx
      Profile.tsx
      Ranking.tsx
      Results.tsx
    /components
      Timer.tsx
      PlayerCard.tsx
      EmojiDisplay.tsx
      Chat.tsx
      InputBar.tsx
    /hooks
      useSocket.ts
    /utils
      emojiList.ts
  tailwind.config.js
  App.tsx
  main.tsx

/server
  index.ts
  /controllers
    gameController.ts
  /sockets
    gameSocket.ts
  /routes
    authRoutes.ts
    gameRoutes.ts
  /services
    s3Service.ts
    rdsService.ts
    authService.ts
```







