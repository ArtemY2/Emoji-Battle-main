import { io } from 'socket.io-client';

// В реальном приложении URL будет из переменной окружения
const URL = process.env.NODE_ENV === 'production'
    ? 'https://your-production-server.com'
    : 'http://localhost:5000';

const socket = io(URL, {
    autoConnect: false,
    // Другие настройки если нужно
});

export default socket;