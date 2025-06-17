import { io, Socket } from 'socket.io-client';

class SocketManager {
    private static instance: SocketManager;
    private socket: Socket;

    private constructor() {
        this.socket = io('http://localhost:4000', {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ['websocket', 'polling']
        });

        // Логирование событий для отладки
        this.socket.onAny((eventName, ...args) => {
            console.log(`📡 Socket событие: ${eventName}`, args);
        });

        this.socket.on('connect', () => {
            console.log('✅ Socket подключен:', this.socket.id);
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Socket отключен');
        });

        this.socket.on('connect_error', (error) => {
            console.error('🔴 Ошибка подключения Socket:', error);
        });
    }

    public static getInstance(): SocketManager {
        if (!SocketManager.instance) {
            SocketManager.instance = new SocketManager();
        }
        return SocketManager.instance;
    }

    public getSocket(): Socket {
        return this.socket;
    }

    public disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

export default SocketManager;