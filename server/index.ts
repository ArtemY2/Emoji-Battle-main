// ✅ server/index.ts — оптимизированная версия с меньшим количеством логов
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: '*' },
    transports: ['websocket', 'polling']
});

interface Player {
    id: string;
    name: string;
}

let openRooms: { [roomId: string]: Player[] } = {};
const socketToName: { [socketId: string]: string } = {};

const rooms: {
    [roomId: string]: {
        answer: string;
        scores: { [socketId: string]: number };
        players: { [socketId: string]: { name: string; avatar?: string } }; // Добавляем информацию об игроках
        roundActive: boolean;
        roundCount: number;
        timer?: NodeJS.Timeout;
    };
} = {};

const questions = [
    { emoji: '🐍🎮', answer: 'snake game' },
    { emoji: '🐸', answer: 'frog' },
    { emoji: '🚗💨', answer: 'fast car' },
    { emoji: '🛸👽', answer: 'ufo' },
    { emoji: '🏹🐗', answer: 'hunting' },
    { emoji: '🎯🔥', answer: 'target practice' },
    { emoji: '🧠🗯️', answer: 'mind reading' },
    { emoji: '🍕🍔🍟', answer: 'fast food' },
    { emoji: '🎶👂', answer: 'music listening' },
    { emoji: '📸🖼️', answer: 'photography' },
];

const MAX_ROUNDS = 3;
const DEV_MODE = process.env.DEV_MODE === 'true';

io.on('connection', (socket) => {
    if (DEV_MODE) console.log('🔗 Подключился:', socket.id);

    socket.on('quickJoin', ({ name }) => {
        // Проверяем, не подключался ли уже этот сокет
        if (socketToName[socket.id]) {
            console.log('⚠️ Повторное подключение игнорировано:', socket.id);
            return;
        }

        console.log(`👤 ${name} присоединяется...`);

        let assignedRoom = '';

        // Ищем открытую комнату
        for (const r in openRooms) {
            if (openRooms[r].length < 5) {
                assignedRoom = r;
                break;
            }
        }

        // Создаем новую комнату если нужно
        if (!assignedRoom) {
            assignedRoom = 'room-' + Math.floor(Math.random() * 100000);
            openRooms[assignedRoom] = [];
            console.log(`🆕 Создана комната: ${assignedRoom}`);
        }

        // Добавляем игрока
        openRooms[assignedRoom].push({ id: socket.id, name });
        socketToName[socket.id] = name;
        socket.join(assignedRoom);

        // Инициализируем комнату для игры
        if (!rooms[assignedRoom]) {
            rooms[assignedRoom] = {
                answer: '',
                scores: {},
                players: {},
                roundActive: false,
                roundCount: 0,
            };
        }
        rooms[assignedRoom].scores[socket.id] = 0;

        // Сохраняем информацию об игроке (имя + аватар если это гость)
        const playerInfo: { name: string; avatar?: string } = { name };

        // Если это гость с эмодзи, извлекаем аватар
        if (name.includes('게스트')) {
            const emojiMatch = name.match(/[🐶🐱🦊🐻🐼🐯🐰🐨]/);
            if (emojiMatch) {
                playerInfo.avatar = emojiMatch[0];
            }
        }

        rooms[assignedRoom].players[socket.id] = playerInfo;

        socket.emit('joinedRoom', assignedRoom);
        io.to(assignedRoom).emit('updateLobby', openRooms[assignedRoom]);

        console.log(`✅ ${name} в комнате ${assignedRoom} (${openRooms[assignedRoom].length} игроков)`);

        // Проверяем условия запуска игры
        const minPlayers = DEV_MODE ? 1 : 5;
        if (openRooms[assignedRoom].length >= minPlayers) {
            console.log(`🚀 Запуск игры в ${assignedRoom}!`);

            // НЕ удаляем комнату сразу, а помечаем как "игра запущена"
            setTimeout(() => {
                console.log(`📡 Отправляем goToGame для комнаты ${assignedRoom}`);
                console.log(`👥 Участники комнаты ${assignedRoom}:`, openRooms[assignedRoom]?.map(p => p.name));

                // Отправляем событие каждому игроку индивидуально
                openRooms[assignedRoom]?.forEach(player => {
                    console.log(`📤 Отправляем goToGame игроку ${player.name} (${player.id})`);
                    io.to(player.id).emit('goToGame', assignedRoom);
                });

                // Удаляем комнату через 5 секунд
                setTimeout(() => {
                    if (openRooms[assignedRoom]) {
                        delete openRooms[assignedRoom];
                        console.log(`🗑️ Комната ${assignedRoom} удалена из открытых`);
                    }
                }, 5000);

            }, 1000); // Уменьшили задержку
        }
    });

    socket.on('startRound', (roomId) => {
        const room = rooms[roomId];
        if (!room || room.roundActive) return;

        const q = questions[Math.floor(Math.random() * questions.length)];
        room.answer = q.answer.toLowerCase();
        room.roundActive = true;
        room.roundCount += 1;

        console.log(`🎯 Раунд ${room.roundCount} в ${roomId}: ${q.answer}`);

        io.to(roomId).emit('roundStart', { emoji: q.emoji });

        // Таймер раунда
        room.timer = setTimeout(() => {
            if (room.roundActive) {
                room.roundActive = false;
                console.log(`⏰ Время вышло в ${roomId}`);

                io.to(roomId).emit('roundEnd', {
                    correct: q.answer,
                    scores: room.scores
                });

                // Переход к следующему раунду или завершение игры
                if (room.roundCount < MAX_ROUNDS) {
                    setTimeout(() => {
                        io.to(roomId).emit('nextRound');
                    }, 3000);
                } else {
                    console.log(`🏁 Игра завершена в ${roomId}`);
                    // Отправляем финальные результаты с информацией об игроках
                    io.to(roomId).emit('gameOver', {
                        scores: room.scores,
                        players: room.players
                    });
                }
            }
        }, 20000);
    });

    socket.on('sendGuess', ({ roomId, message }) => {
        const room = rooms[roomId];
        if (!room || !room.roundActive) return;

        const playerName = socketToName[socket.id] || 'Неизвестный';
        const normalized = message.toLowerCase().trim();

        // Отправляем всем сообщение
        io.to(roomId).emit('newGuess', {
            name: playerName,
            message: message,
        });

        // Проверяем правильность ответа
        if (normalized === room.answer) {
            room.roundActive = false;
            clearTimeout(room.timer);
            room.scores[socket.id] += 1;

            console.log(`✅ ${playerName} угадал: ${room.answer}`);

            io.to(roomId).emit('correctGuess', {
                socketId: socket.id,
                playerName: playerName,
            });

            io.to(roomId).emit('roundEnd', {
                correct: room.answer,
                scores: room.scores,
            });

            // Следующий раунд или конец игры
            if (room.roundCount < MAX_ROUNDS) {
                setTimeout(() => {
                    io.to(roomId).emit('nextRound');
                }, 3000);
            } else {
                console.log(`🏁 Игра завершена в ${roomId}`);
                io.to(roomId).emit('gameOver', { scores: room.scores });
            }
        }
    });

    socket.on('disconnect', () => {
        const playerName = socketToName[socket.id];
        if (playerName && DEV_MODE) {
            console.log(`👋 ${playerName} отключился`);
        }

        delete socketToName[socket.id];

        // Удаляем из всех открытых комнат
        for (const roomId in openRooms) {
            const oldLength = openRooms[roomId].length;
            openRooms[roomId] = openRooms[roomId].filter(p => p.id !== socket.id);

            if (openRooms[roomId].length !== oldLength) {
                io.to(roomId).emit('updateLobby', openRooms[roomId]);
            }
        }
    });
});

httpServer.listen(4000, () => {
    console.log('🚀 Сервер запущен: http://localhost:4000');
    console.log('🔧 Режим разработки:', DEV_MODE ? 'ВКЛ' : 'ВЫКЛ');
});