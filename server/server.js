// server/server.js

require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Фронтенд URL
        methods: ["GET", "POST"],
    },
});

// Middleware
app.use(cors());
app.use(express.json());

// Маршрут для проверки сервера
app.get("/", (req, res) => {
    res.send("Сервер работает!");
});

// WebSocket логика
io.on("connection", (socket) => {
    console.log(`Пользователь подключился: ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`Пользователь отключился: ${socket.id}`);
    });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
