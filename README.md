# 🎮 Emoji Battle

**Emoji Battle** is a real-time multiplayer browser game where players guess words or phrases based on emoji combinations. Play against others, score points, and climb the leaderboard!

---

## 🌟 Features

- 🔢 Real-time 5-player rooms
- 🧠 Emoji-based guessing game
- 💬 Live in-game chat with reactions
- 🏆 Leaderboards with filters (daily, weekly, all-time)
- 👤 Profile system with emoji avatars and XP
- ☁️ Fully integrated with AWS for cloud services

---

## 🔧 Tech Stack

### Frontend

- React + TypeScript
- Tailwind CSS for styling
- Socket.IO for WebSocket communication

### Backend

- Node.js + Express
- Socket.IO for real-time game logic
- PostgreSQL (via AWS RDS)
- AWS Cognito (user authentication)

### Cloud & Deployment

- AWS Amplify (frontend hosting)
- AWS Elastic Beanstalk (backend)
- AWS RDS (PostgreSQL DB)
- AWS S3 (avatar image storage)

---

## 🧩 Game Flow

1. Enter the lobby
2. Click **Play** to join a random room
3. Each round, guess the meaning of the emoji combination
4. Type your guess in the input box and hit **Send**
5. Gain points for speed and accuracy
6. View results and leaderboard at the end

